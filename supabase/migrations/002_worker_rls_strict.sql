-- Stricter worker-level RLS policies.
-- Workers (member/foreman) are read-only on sensitive tables.
-- Managers (admin/owner) retain full write access.
-- Addresses: TODO: worker-level policies stricter before public SaaS.

create or replace function public.is_company_manager(target_company_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin')
  );
$$;

do $$
declare
  tbl text;
begin
  -- Manager-only write tables: workers can SELECT, only managers INSERT/UPDATE, owner/admin DELETE.
  foreach tbl in array array['clients','documents','company_info','payroll_records','employees','projects'] loop
    execute format('drop policy if exists %I_select on public.%I', tbl, tbl);
    execute format('drop policy if exists %I_insert on public.%I', tbl, tbl);
    execute format('drop policy if exists %I_update on public.%I', tbl, tbl);
    execute format('drop policy if exists %I_delete on public.%I', tbl, tbl);

    execute format(
      'create policy %I_select on public.%I for select using (public.is_company_member(company_id));',
      tbl, tbl
    );
    execute format(
      'create policy %I_insert on public.%I for insert with check (public.is_company_manager(company_id));',
      tbl, tbl
    );
    execute format(
      'create policy %I_update on public.%I for update using (public.is_company_manager(company_id)) with check (public.is_company_manager(company_id));',
      tbl, tbl
    );
    execute format(
      'create policy %I_delete on public.%I for delete using (public.company_role(company_id) in (''owner'',''admin''));',
      tbl, tbl
    );
  end loop;

  -- day_details: all members can SELECT and INSERT work entries; only managers can UPDATE/DELETE.
  execute 'drop policy if exists day_details_select on public.day_details';
  execute 'drop policy if exists day_details_insert on public.day_details';
  execute 'drop policy if exists day_details_update on public.day_details';
  execute 'drop policy if exists day_details_delete on public.day_details';

  execute 'create policy day_details_select on public.day_details
    for select using (public.is_company_member(company_id))';

  execute 'create policy day_details_insert on public.day_details
    for insert with check (public.is_company_member(company_id))';

  execute 'create policy day_details_update on public.day_details
    for update using (public.is_company_manager(company_id))
    with check (public.is_company_manager(company_id))';

  execute 'create policy day_details_delete on public.day_details
    for delete using (public.company_role(company_id) in (''owner'',''admin''))';
end
$$;
