create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','foreman')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

alter table public.employees add column if not exists company_id uuid;
alter table public.employees add column if not exists installation_id text;
alter table public.day_details add column if not exists company_id uuid;
alter table public.day_details add column if not exists installation_id text;
alter table public.clients add column if not exists company_id uuid;
alter table public.clients add column if not exists installation_id text;
alter table public.documents add column if not exists company_id uuid;
alter table public.documents add column if not exists installation_id text;
alter table public.company_info add column if not exists company_id uuid;
alter table public.company_info add column if not exists installation_id text;
alter table public.payroll_records add column if not exists company_id uuid;
alter table public.payroll_records add column if not exists installation_id text;
alter table public.projects add column if not exists company_id uuid;
alter table public.projects add column if not exists installation_id text;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.company_members cm
    where cm.company_id = target_company_id and cm.user_id = auth.uid()
  );
$$;

create or replace function public.company_role(target_company_id uuid)
returns text language sql stable as $$
  select cm.role from public.company_members cm
  where cm.company_id = target_company_id and cm.user_id = auth.uid()
  limit 1;
$$;

alter table public.employees enable row level security;
alter table public.day_details enable row level security;
alter table public.clients enable row level security;
alter table public.documents enable row level security;
alter table public.company_info enable row level security;
alter table public.payroll_records enable row level security;
alter table public.projects enable row level security;

-- Worker-level stricter policies are applied in 002_worker_rls_strict.sql.

do $$
begin
  for t in select unnest(array['employees','day_details','clients','documents','company_info','payroll_records','projects']) as tab loop
    execute format('drop policy if exists %I_select on public.%I', t.tab, t.tab);
    execute format('drop policy if exists %I_insert on public.%I', t.tab, t.tab);
    execute format('drop policy if exists %I_update on public.%I', t.tab, t.tab);
    execute format('drop policy if exists %I_delete on public.%I', t.tab, t.tab);

    execute format('create policy %I_select on public.%I for select using (public.is_company_member(company_id));', t.tab, t.tab);
    execute format('create policy %I_insert on public.%I for insert with check (public.is_company_member(company_id));', t.tab, t.tab);
    execute format('create policy %I_update on public.%I for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));', t.tab, t.tab);
    execute format('create policy %I_delete on public.%I for delete using (public.company_role(company_id) in (''owner'',''admin''));', t.tab, t.tab);
  end loop;
end
$$;
