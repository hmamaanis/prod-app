'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, SectionHead, Avatar, StatusDot, statusLabel } from './shared';
import { getCast, getCrew, createCast, createCrew, updateCast, updateCrew, deleteCast, deleteCrew } from '@/lib/api';

const STATUS_OPTIONS = ['on-set','travel','holding','wrapped','not-called','at-base'];

function PersonRow({ p, isCast, onStatusChange, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({});

  const startEdit = () => { setDraft({ name: p.name, role: p.role, status: p.status }); setEditing(true); };
  const cancel    = () => setEditing(false);
  const save      = () => { onSave(p.id, draft); setEditing(false); };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 6, borderBottom: `1px solid ${C.line}` }}>
      <Avatar name={editing ? draft.name || p.name : p.name} size={36}/>

      {editing ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <input
            autoFocus value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            placeholder="Name"
            style={{ border: `1px solid ${C.line2}`, borderRadius: 4, padding: '4px 8px', fontSize: 13, fontFamily: 'Inter', outline: 'none', background: C.bg }}
          />
          <input
            value={draft.role} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
            placeholder="Role"
            style={{ border: `1px solid ${C.line2}`, borderRadius: 4, padding: '4px 8px', fontSize: 12, fontFamily: '"IBM Plex Mono", monospace', outline: 'none', background: C.bg }}
          />
          <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
            style={{ fontSize: 11, border: `1px solid ${C.line2}`, borderRadius: 4, padding: '3px 6px', background: C.panel, fontFamily: 'Inter' }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel({ status: s })}</option>)}
          </select>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
            {p.role}{isCast && p.scenes && Array.isArray(p.scenes) && p.scenes.length > 0 && ` · Scenes ${p.scenes.join(', ')}`}
          </div>
        </div>
      )}

      {editing ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={save} style={{ background: C.ink, border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', color: '#fff', fontSize: 11, fontFamily: 'Inter' }}>Save</button>
          <button onClick={cancel} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 4, padding: '5px 8px', cursor: 'pointer', color: C.muted2, fontSize: 11 }}>✕</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusDot status={p.status}/>
          <select
            value={p.status} onChange={e => onStatusChange(p.id, e.target.value)}
            style={{ fontSize: 11, border: `1px solid ${C.line2}`, borderRadius: 4, padding: '3px 6px', background: C.panel, cursor: 'pointer', fontFamily: 'Inter', color: C.ink2 }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel({ status: s })}</option>)}
          </select>
          <button onClick={startEdit} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 4, padding: '4px 7px', cursor: 'pointer', color: C.muted2 }} title="Edit">
            <Ico.pencil/>
          </button>
          <button onClick={() => onDelete(p.id)} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 4, padding: '4px 7px', cursor: 'pointer', color: C.muted2 }} title="Remove">
            <Ico.trash/>
          </button>
        </div>
      )}
    </div>
  );
}

function AddForm({ onSave, onCancel, label }) {
  const [name, setName]     = useState('');
  const [role, setRole]     = useState('');
  const [status, setStatus] = useState('not-called');
  const inp = { border: `1px solid ${C.line2}`, borderRadius: 4, padding: '6px 10px', fontSize: 13, fontFamily: 'Inter', outline: 'none', background: C.bg, color: C.ink, width: '100%', boxSizing: 'border-box' };
  return (
    <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder={`${label} name`} style={inp}/>
      <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role" style={{ ...inp, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}/>
      <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inp, cursor: 'pointer', fontSize: 11 }}>
        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel({ status: s })}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => name.trim() && role.trim() && onSave({ name: name.trim(), role: role.trim(), status })} disabled={!name.trim() || !role.trim()}
          style={{ background: C.ink, border: 'none', borderRadius: 4, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#fff', fontFamily: 'Inter', opacity: (!name.trim() || !role.trim()) ? 0.5 : 1 }}>
          Add {label}
        </button>
        <button onClick={onCancel} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 4, padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: C.muted2, fontFamily: 'Inter' }}>Cancel</button>
      </div>
    </div>
  );
}

export default function CastScreen({ projectId }) {
  const [cast, setCast]           = useState([]);
  const [crew, setCrew]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [addingCast, setAddingCast] = useState(false);
  const [addingCrew, setAddingCrew] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([getCast(projectId), getCrew(projectId)])
      .then(([c, cr]) => { setCast(c); setCrew(cr); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCastStatus = async (id, status) => {
    await updateCast(projectId, id, { status });
    setCast(s => s.map(p => p.id === id ? { ...p, status } : p));
  };
  const handleCrewStatus = async (id, status) => {
    await updateCrew(projectId, id, { status });
    setCrew(s => s.map(p => p.id === id ? { ...p, status } : p));
  };
  const handleCastSave = async (id, data) => {
    await updateCast(projectId, id, data);
    setCast(s => s.map(p => p.id === id ? { ...p, ...data } : p));
  };
  const handleCrewSave = async (id, data) => {
    await updateCrew(projectId, id, data);
    setCrew(s => s.map(p => p.id === id ? { ...p, ...data } : p));
  };
  const handleCastDelete = async (id) => {
    await deleteCast(projectId, id);
    setCast(s => s.filter(p => p.id !== id));
  };
  const handleCrewDelete = async (id) => {
    await deleteCrew(projectId, id);
    setCrew(s => s.filter(p => p.id !== id));
  };
  const handleAddCast = async (data) => {
    const p = await createCast(projectId, data);
    setCast(s => [...s, p]);
    setAddingCast(false);
  };
  const handleAddCrew = async (data) => {
    const p = await createCrew(projectId, data);
    setCrew(s => [...s, p]);
    setAddingCrew(false);
  };

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading cast & crew…</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>Cast</div>
          <button onClick={() => { setAddingCast(true); setAddingCrew(false); }} style={{ background: C.ink, border: 'none', borderRadius: 5, padding: '5px 10px', fontSize: 11.5, fontWeight: 500, cursor: 'pointer', color: '#fff', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Ico.plus/> Add cast
          </button>
        </div>
        <div>
          {cast.map(p => <PersonRow key={p.id} p={p} isCast onStatusChange={handleCastStatus} onSave={handleCastSave} onDelete={handleCastDelete}/>)}
          {cast.length === 0 && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>No cast members yet.</div>}
        </div>
        {addingCast && <AddForm label="cast member" onSave={handleAddCast} onCancel={() => setAddingCast(false)}/>}
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>Crew — heads of department</div>
          <button onClick={() => { setAddingCrew(true); setAddingCast(false); }} style={{ background: C.ink, border: 'none', borderRadius: 5, padding: '5px 10px', fontSize: 11.5, fontWeight: 500, cursor: 'pointer', color: '#fff', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Ico.plus/> Add crew
          </button>
        </div>
        <div>
          {crew.map(p => <PersonRow key={p.id} p={p} onStatusChange={handleCrewStatus} onSave={handleCrewSave} onDelete={handleCrewDelete}/>)}
          {crew.length === 0 && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>No crew members yet.</div>}
        </div>
        {addingCrew && <AddForm label="crew member" onSave={handleAddCrew} onCancel={() => setAddingCrew(false)}/>}
      </Card>
    </div>
  );
}
