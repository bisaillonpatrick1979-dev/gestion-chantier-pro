'use client'

import { useState } from 'react'
import { useAssignmentStore, newChecklistItem } from '@/store/useAssignmentStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'

const today = () => new Date().toISOString().slice(0, 10)
const statusLabel: Record<string, string> = { assigned: 'Assignée', in_progress: 'En cours', partial: 'Partielle', blocked: 'Bloquée', completed: 'Terminée', revisit: 'À revisiter', todo: 'À faire', done: 'Fait', not_applicable: 'N/A' }

export default function AssignmentsPage() {
  const { employees, currentEmployeeId } = useEmployeeStore()
  const { assignments, addAssignment, setChecklistStatus, finishAssignment } = useAssignmentStore()
  const current = employees.find(e => e.id === currentEmployeeId)
  const isAdmin = !current || current.role === 'admin' || current.role === 'accountant' || current.role === 'secretary'
  const [workerId, setWorkerId] = useState(employees.find(e => e.id !== 'admin')?.id || '')
  const [clientName, setClientName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [address, setAddress] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [instructions, setInstructions] = useState('')
  const [checklistText, setChecklistText] = useState('Retirer vieux matériel\nInstaller / réparer\nVérifier alignement\nNettoyer chantier\nPhotos finales')

  const visible = isAdmin ? assignments : assignments.filter(a => a.workerId === currentEmployeeId)
  const activeWorkers = employees.filter(e => e.id !== 'admin' && e.active)

  function createAssignment() {
    const worker = employees.find(e => e.id === workerId)
    if (!worker || !projectName.trim() || !address.trim()) return
    const checklist = checklistText.split('\n').map(x => x.trim()).filter(Boolean).map(newChecklistItem)
    addAssignment({ workerId: worker.id, workerName: worker.name, clientName, projectName, address, serviceType, priority: 'normal', scheduledDate: today(), instructions, checklist })
    setClientName('')
    setProjectName('')
    setAddress('')
    setServiceType('')
    setInstructions('')
  }

  return <main className="min-h-screen px-4 pb-28 pt-6 text-white"><div className="mx-auto max-w-6xl space-y-4">
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5"><h1 className="text-3xl font-black">✅ Assignations & checklists</h1><p className="mt-2 text-base text-white/65">Chaque job peut avoir une checklist. L’employé coche les tâches, bloque si matériel manquant, puis finalise complet ou partiel.</p></section>

    {isAdmin && <section className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">Créer une assignation</h2><div className="mt-3 grid gap-3 lg:grid-cols-3"><select className="big-field" value={workerId} onChange={e => setWorkerId(e.target.value)}>{activeWorkers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select><input className="big-field" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client"/><input className="big-field" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Projet / service"/><input className="big-field lg:col-span-2" value={address} onChange={e => setAddress(e.target.value)} placeholder="Adresse chantier"/><input className="big-field" value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder="Type de job"/><textarea className="big-field lg:col-span-3" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Instructions"/><textarea className="big-field lg:col-span-3" value={checklistText} onChange={e => setChecklistText(e.target.value)} placeholder="Une tâche par ligne"/><button className="big-button lg:col-span-3" onClick={createAssignment}>Envoyer l’assignation</button></div></section>}

    <section className="grid gap-3 lg:grid-cols-2">{visible.length === 0 ? <p className="text-base text-white/55">Aucune assignation.</p> : visible.map(a => <AssignmentCard key={a.id} assignment={a} setChecklistStatus={setChecklistStatus} finishAssignment={finishAssignment} isAdmin={isAdmin} />)}</section>
  </div></main>
}

function AssignmentCard({ assignment, setChecklistStatus, finishAssignment, isAdmin }: any) {
  const [blockNote, setBlockNote] = useState('')
  const done = assignment.checklist.filter((i: any) => i.status === 'done' || i.status === 'not_applicable').length
  const total = assignment.checklist.length
  const complete = total > 0 && done === total
  return <div className={`rounded-3xl border p-4 ${assignment.status === 'completed' ? 'border-green-400/30 bg-green-400/10' : assignment.status === 'blocked' ? 'border-amber-400/30 bg-amber-400/10' : 'border-white/10 bg-white/5'}`}>
    <div className="flex items-start justify-between gap-3"><div><h2 className="text-2xl font-black">{assignment.projectName}</h2><p className="text-base text-white/65">{assignment.clientName || 'Client —'} · {assignment.address}</p><p className="text-sm text-white/55">Assigné à {assignment.workerName} · {statusLabel[assignment.status] || assignment.status}</p></div><strong className="text-xl text-cyan-300">{done}/{total}</strong></div>
    {assignment.instructions && <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-base text-white/75">{assignment.instructions}</p>}
    <div className="mt-3 grid gap-2">{assignment.checklist.map((item: any) => <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between gap-2"><div><b className="text-lg">{item.title}</b><p className="text-sm text-white/55">{statusLabel[item.status] || item.status}{item.missingMaterial ? ` · Manque: ${item.missingMaterial}` : ''}</p>{item.note && <p className="text-sm text-amber-100">{item.note}</p>}</div><div className="flex flex-wrap gap-2"><button className="rounded-xl border border-green-400/30 px-3 py-2 text-green-200" onClick={() => setChecklistStatus(assignment.id, item.id, 'done')}>Check fait</button><button className="rounded-xl border border-white/20 px-3 py-2 text-white/80" onClick={() => setChecklistStatus(assignment.id, item.id, 'not_applicable')}>N/A</button></div></div><div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]"><input className="big-field" value={blockNote} onChange={e => setBlockNote(e.target.value)} placeholder="Raison blocage / matériau manquant"/><button className="rounded-xl border border-amber-400/30 px-3 py-2 text-amber-200" onClick={() => setChecklistStatus(assignment.id, item.id, 'blocked', blockNote, blockNote)}>Bloquer</button></div></div>)}</div>
    <button className="big-button mt-4 w-full" onClick={() => finishAssignment(assignment.id)}>{complete ? 'Finaliser complet' : 'Finaliser partiel / à revisiter'}</button>
    {isAdmin && <p className="mt-3 text-sm text-white/50">Admin: si une tâche est bloquée, la job reste visible comme à revisiter.</p>}
  </div>
}
