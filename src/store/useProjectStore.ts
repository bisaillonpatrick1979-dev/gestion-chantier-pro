// src/store/useProjectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  syncProjectsToSupabase,
  fetchProjectsFromSupabase,
} from '@/lib/sync';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PayMode = 'hourly' | 'job' | 'sqft';

export interface ProjectTask {
  id: string
  label: string
  catalogItemId?: string
  qty?: number
  unit?: string
  done: boolean
  doneBy?: string
  doneAt?: string
  sortOrder: number
}

export interface MaterialEntry {
  id: string;
  material: string;
  sqft: number;
  ratePerSqft: number;
}

export interface EmployeeWorkLog {
  employeeId: string;
  employeeName: string;
  hourlyRate: number;
  punchIn: string;
  punchOut?: string;
  hoursWorked?: number;
  materials?: MaterialEntry[];
  jobPay?: number;
  date: string;
  chantier?: string;
  payMode?: PayMode;
}

export interface ProjectExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  address: string;
  city: string;
  payMode: PayMode;
  hourlyRate?: number;
  jobAmount?: number;
  sqftRate?: number;
  clientAmount?: number;
  assignedEmployeeIds: string[];
  workLogs: EmployeeWorkLog[];
  expenses: ProjectExpense[];
  status: 'open' | 'closed' | 'invoiced';
  createdAt: string;
  closedAt?: string;
  invoiceId?: string;
  notes?: string;
  jobsiteLatLng?: string;
  isVirtual?: boolean;
  tasks?: ProjectTask[];
  workerCompletedAt?: string;
  adminVerifiedAt?: string;
}

// ─── Calculs ──────────────────────────────────────────────────────────────────

export function calcProjectStats(project: Project) {
  const completedLogs = project.workLogs.filter((l) => l.punchOut);

  const byEmployee: Record<string, {
    employeeId: string;
    employeeName: string;
    hourlyRate: number;
    totalHours: number;
    totalPay: number;
    sessions: number;
  }> = {};

  let totalLaborCost = 0;
  let totalSqft = 0;
  let totalSqftRevenue = 0;

  for (const log of completedLogs) {
    if (!byEmployee[log.employeeId]) {
      byEmployee[log.employeeId] = {
        employeeId: log.employeeId,
        employeeName: log.employeeName,
        hourlyRate: log.hourlyRate,
        totalHours: 0,
        totalPay: 0,
        sessions: 0,
      };
    }
    const emp = byEmployee[log.employeeId];
    emp.sessions++;
    const effectivePayMode = log.payMode ?? project.payMode;

    if (effectivePayMode === 'hourly') {
      const hours = log.hoursWorked ?? 0;
      emp.totalHours += hours;
      emp.totalPay += hours * log.hourlyRate;
      totalLaborCost += hours * log.hourlyRate;
    } else if (effectivePayMode === 'job') {
      emp.totalPay += log.jobPay ?? 0;
      totalLaborCost += log.jobPay ?? 0;
    } else if (effectivePayMode === 'sqft') {
      const hours = log.hoursWorked ?? 0;
      emp.totalHours += hours;
      for (const mat of log.materials ?? []) {
        totalSqft += mat.sqft;
        totalSqftRevenue += mat.sqft * mat.ratePerSqft;
      }
      emp.totalPay += hours * log.hourlyRate;
      totalLaborCost += hours * log.hourlyRate;
    }
  }

  const totalExpenses = project.expenses.reduce((s, e) => s + e.amount, 0);
  const clientRevenue = project.payMode === 'sqft'
    ? totalSqftRevenue
    : (project.clientAmount ?? 0);

  const totalHours = Object.values(byEmployee).reduce((s, e) => s + e.totalHours, 0);
  const effectiveRate = totalHours > 0 ? (clientRevenue - totalExpenses) / totalHours : 0;
  const margin = clientRevenue - totalLaborCost - totalExpenses;
  const marginPercent = clientRevenue > 0 ? (margin / clientRevenue) * 100 : 0;
  const activeLog = project.workLogs.find((l) => !l.punchOut);

  return {
    byEmployee, totalLaborCost, totalExpenses, totalHours,
    totalSqft, totalSqftRevenue, clientRevenue, effectiveRate,
    margin, marginPercent, activeLog,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface ProjectStore {
  projects: Project[];
  isSyncing: boolean;
  lastSync: string | null;
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'workLogs' | 'expenses' | 'status'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  closeProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id' | 'sortOrder'>) => void;
  toggleTask: (projectId: string, taskId: string, workerName?: string) => void;
  removeTask: (projectId: string, taskId: string) => void;
  workerCompleteProject: (projectId: string) => void;
  adminVerifyAndClose: (projectId: string) => void;
  punchIn: (projectId: string, log: Omit<EmployeeWorkLog, 'punchOut' | 'hoursWorked'>) => void;
  punchOut: (projectId: string, employeeId: string, data: { materials?: MaterialEntry[]; jobPay?: number }) => void;
  addExpense: (projectId: string, expense: Omit<ProjectExpense, 'id'>) => void;
  removeExpense: (projectId: string, expenseId: string) => void;
  getOpenProjects: () => Project[];
  getProjectsForEmployee: (employeeId: string) => Project[];
  getActiveLogForEmployee: (employeeId: string) => { project: Project; log: EmployeeWorkLog } | null;
  getActiveJobsites: () => { projectId: string; name: string; latLng: string }[];
  punchInVirtual: (log: Omit<EmployeeWorkLog, 'punchOut' | 'hoursWorked'>) => string;
  syncToCloud: () => Promise<void>;
  fetchFromCloud: () => Promise<void>;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      isSyncing: false,
      lastSync: null,

      addProject: (p) => {
        const id = uid();
        const newProjects = [
          ...get().projects,
          { ...p, id, createdAt: new Date().toISOString(), workLogs: [], expenses: [], status: 'open' as const },
        ];
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
        return id;
      },

      updateProject: (id, updates) => {
        const newProjects = get().projects.map((p) => p.id === id ? { ...p, ...updates } : p);
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      deleteProject: (id) => {
        const newProjects = get().projects.filter((p) => p.id !== id);
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      closeProject: (id) => {
        const newProjects = get().projects.map((p) =>
          p.id === id ? { ...p, status: 'closed' as const, closedAt: new Date().toISOString() } : p
        );
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      addTask: (projectId, task) => {
        const proj = get().projects.find(p => p.id === projectId);
        const sortOrder = proj?.tasks?.length ?? 0;
        const newProjects = get().projects.map(p =>
          p.id === projectId
            ? { ...p, tasks: [...(p.tasks ?? []), { ...task, id: uid(), sortOrder }] }
            : p
        );
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      toggleTask: (projectId, taskId, workerName) => {
        const newProjects = get().projects.map(p => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            tasks: (p.tasks ?? []).map(task => {
              if (task.id !== taskId) return task;
              const nowDone = !task.done;
              return { ...task, done: nowDone, doneBy: nowDone ? workerName : undefined, doneAt: nowDone ? new Date().toISOString() : undefined };
            }),
          };
        });
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      removeTask: (projectId, taskId) => {
        const newProjects = get().projects.map(p =>
          p.id === projectId
            ? { ...p, tasks: (p.tasks ?? []).filter(t => t.id !== taskId) }
            : p
        );
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      workerCompleteProject: (projectId) => {
        const newProjects = get().projects.map(p =>
          p.id === projectId ? { ...p, workerCompletedAt: new Date().toISOString() } : p
        );
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      adminVerifyAndClose: (projectId) => {
        const newProjects = get().projects.map(p =>
          p.id === projectId
            ? { ...p, status: 'closed' as const, closedAt: new Date().toISOString(), adminVerifiedAt: new Date().toISOString() }
            : p
        );
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      punchIn: (projectId, log) => {
        const newProjects = get().projects.map((p) =>
          p.id === projectId ? { ...p, workLogs: [...p.workLogs, log] } : p
        );
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      punchInVirtual: (log) => {
        const projectId = `virtual-${log.employeeId}-${Date.now()}`;
        const chantierName = log.chantier || 'Chantier sans nom';
        const newProjects = [
          ...get().projects,
          {
            id: projectId,
            name: chantierName,
            clientId: '',
            clientName: '',
            address: chantierName,
            city: '',
            payMode: log.payMode ?? 'hourly' as PayMode,
            assignedEmployeeIds: [log.employeeId],
            workLogs: [log],
            expenses: [],
            status: 'open' as const,
            createdAt: new Date().toISOString(),
            isVirtual: true,
          },
        ];
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
        return projectId;
      },

      punchOut: (projectId, employeeId, data) => {
        const punchOutTime = new Date().toISOString();
        const newProjects = get().projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            workLogs: p.workLogs.map((log) => {
              if (log.employeeId !== employeeId || log.punchOut) return log;
              const hoursWorked =
                (new Date(punchOutTime).getTime() - new Date(log.punchIn).getTime()) / (1000 * 60 * 60);
              return {
                ...log,
                punchOut: punchOutTime,
                hoursWorked: Math.round(hoursWorked * 100) / 100,
                ...data,
              };
            }),
          };
        });
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      addExpense: (projectId, expense) => {
        const newProjects = get().projects.map((p) =>
          p.id === projectId
            ? { ...p, expenses: [...p.expenses, { ...expense, id: uid() }] }
            : p
        );
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      removeExpense: (projectId, expenseId) => {
        const newProjects = get().projects.map((p) =>
          p.id === projectId
            ? { ...p, expenses: p.expenses.filter((e) => e.id !== expenseId) }
            : p
        );
        set({ projects: newProjects });
        syncProjectsToSupabase(newProjects);
      },

      getOpenProjects: () => get().projects.filter((p) => p.status === 'open'),

      getProjectsForEmployee: (employeeId) =>
        get().projects.filter(
          (p) => p.status === 'open' && p.assignedEmployeeIds.includes(employeeId)
        ),

      getActiveLogForEmployee: (employeeId) => {
        for (const project of get().projects) {
          const log = project.workLogs.find(
            (l) => l.employeeId === employeeId && !l.punchOut
          );
          if (log) return { project, log };
        }
        return null;
      },

      getActiveJobsites: () =>
        get().projects
          .filter((p) => p.status === 'open' && p.jobsiteLatLng && p.jobsiteLatLng.includes(','))
          .map((p) => ({ projectId: p.id, name: p.name, latLng: p.jobsiteLatLng! })),

      syncToCloud: async () => {
        set({ isSyncing: true });
        try {
          await syncProjectsToSupabase(get().projects);
          set({ lastSync: new Date().toISOString() });
        } catch (e) {
          console.error('syncToCloud projects error:', e);
        } finally {
          set({ isSyncing: false });
        }
      },

      fetchFromCloud: async () => {
        set({ isSyncing: true });
        try {
          const remote = await fetchProjectsFromSupabase();
          if (remote !== null) {
            const local = get().projects;
            const remoteIds = new Set(remote.map((p: any) => p.id));
            // Merge: keep tasks/workerCompletedAt/adminVerifiedAt from localStorage
            // since these columns don't yet exist in Supabase.
            const merged = remote.map((rp: any) => {
              const lp = local.find(p => p.id === rp.id);
              return {
                ...rp,
                tasks: lp?.tasks ?? [],
                workerCompletedAt: lp?.workerCompletedAt,
                adminVerifiedAt: lp?.adminVerifiedAt,
                isVirtual: lp?.isVirtual ?? rp.isVirtual,
              };
            });
            // Keep virtual/local-only projects that Supabase doesn't know about
            const localOnly = local.filter(p => p.isVirtual && !remoteIds.has(p.id));
            set({ projects: [...merged, ...localOnly] });
          }
          set({ lastSync: new Date().toISOString() });
        } catch (e) {
          console.error('fetchFromCloud projects error:', e);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    { name: 'project-store-v1' }
  )
);
