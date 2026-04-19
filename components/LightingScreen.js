'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, Badge } from './shared';
import { getLighting, createLighting, updateLighting, deleteLighting } from '@/lib/api';

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const add = () => { if (input.trim()) { onChange([...(tags || []), input.trim()]); setInput(''); } };
  return (
    <div style={{ border: `1px solid ${C.line2}`, borderRadius: 6, background: C.panel, padding: 6, display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
      {(tags || []).map((t, i) => (
        <span key={i} style={{ background: C.tint, color: C.ink2, padding: '3px 7px', borderRadius: 4, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {t}
          <button onClick={() => onChange(tags.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} onBlur={add}
        placeholder="Add unit, press Enter"
        style={{ flex: 1, minWidth: 100, border: 'none', background: 'none', fontSize: 12, padding: '3px 4px', outline: 'none', fontFamily: 'Inter' }}
      />
    </div>
  );
}

function SetupCard({ l, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({});
  const upd = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const startEdit = () => { setDraft({ label_id: l.label_id, label: l.label, temp: l.temp, setup_time: l.setup_time, units: [...(l.units || [])] }); setEditing(true); };
  const cancel    = () => setEditing(false);
  const save      = () => { onSave(l.id, draft); setEditing(false); };

  const inp = { border: `1px solid ${C.line2}`, borderRadius: 4, padding: '6px 9px', fontSize: 13, fontFamily: 'Inter', outline: 'none', background: C.bg, color: C.ink, width: '100%', boxSizing: 'border-box', marginBottom: 6 };

  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.line}` }}>
        {editing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3 }}>ID</div>
                <input value={draft.label_id} onChange={e => upd('label_id', e.target.value)} placeholder="A"
                  style={{ ...inp, fontFamily: '"IBM Plex Mono", monospace', fontSize: 16, fontWeight: 600, textAlign: 'center', marginBottom: 0 }}/>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3 }}>SETUP TIME</div>
                <input value={draft.setup_time} onChange={e => upd('setup_time', e.target.value)} placeholder="45m"
                  style={{ ...inp, marginBottom: 0 }}/>
              </div>
            </div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3 }}>LABEL</div>
            <input value={draft.label} onChange={e => upd('label', e.target.value)} placeholder="Setup description" style={inp}/>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3 }}>COLOR TEMP</div>
            <input value={draft.temp} onChange={e => upd('temp', e.target.value)} placeholder="5600K" style={{ ...inp, marginBottom: 0 }}/>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 34, height: 34, borderRadius: 6, background: C.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono", monospace', fontSize: 16, fontWeight: 600 }}>
              {l.label_id}
            </div>
            <Badge tone="accent" dot>{l.setup_time}</Badge>
          </div>
        )}
        {!editing && (
          <>
            <div style={{ fontSize: 15, fontWeight: 500, marginTop: 12, lineHeight: 1.35 }}>{l.label}</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginTop: 6 }}>Color temp · {l.temp}</div>
          </>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: 1, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', marginBottom: 8 }}>Units</div>
        {editing ? (
          <TagInput tags={draft.units} onChange={v => upd('units', v)}/>
        ) : (
          <div>
            {(l.units || []).map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < l.units.length - 1 ? `1px solid ${C.line}` : 'none', fontSize: 12.5 }}>
                <span style={{ color: C.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                <span>{u}</span>
              </div>
            ))}
            {(!l.units || l.units.length === 0) && <div style={{ color: C.muted, fontSize: 12 }}>No units listed.</div>}
          </div>
        )}
      </div>

      <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.line}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {editing ? (
          <>
            <button onClick={save} style={{ background: C.ink, border: 'none', borderRadius: 5, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#fff', fontFamily: 'Inter' }}>Save</button>
            <button onClick={cancel} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '6px 10px', fontSize: 12, cursor: 'pointer', color: C.muted2, fontFamily: 'Inter' }}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={startEdit} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: C.ink2, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Ico.pencil/> Edit
            </button>
            <button onClick={() => onDelete(l.id)} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '6px 10px', fontSize: 12, cursor: 'pointer', color: C.muted2, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Ico.trash/>
            </button>
          </>
        )}
      </div>
    </Card>
  );
}

const EMPTY_FORM = { label_id: '', label: '', temp: '5600K', setup_time: '', units: [] };

function NewSetupForm({ onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = { border: `1px solid ${C.line2}`, borderRadius: 4, padding: '7px 10px', fontSize: 13, fontFamily: 'Inter', outline: 'none', background: C.bg, color: C.ink, width: '100%', boxSizing: 'border-box' };
  const valid = form.label_id.trim() && form.label.trim();

  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>New lighting setup</div>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3 }}>ID</div>
            <input value={form.label_id} onChange={e => upd('label_id', e.target.value)} placeholder="D" style={{ ...inp, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace', fontSize: 16, fontWeight: 600 }}/>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3 }}>SETUP TIME</div>
            <input value={form.setup_time} onChange={e => upd('setup_time', e.target.value)} placeholder="45m" style={inp}/>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3 }}>LABEL</div>
          <input value={form.label} onChange={e => upd('label', e.target.value)} placeholder="Setup description" style={inp}/>
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3 }}>COLOR TEMP</div>
          <input value={form.temp} onChange={e => upd('temp', e.target.value)} placeholder="5600K" style={inp}/>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: 1, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', marginBottom: 8 }}>Units</div>
        <TagInput tags={form.units} onChange={v => upd('units', v)}/>
      </div>
      <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.line}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={() => valid && onSave(form)} disabled={!valid}
          style={{ background: valid ? C.ink : C.line2, border: 'none', borderRadius: 5, padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: valid ? 'pointer' : 'default', color: '#fff', fontFamily: 'Inter' }}>
          Save setup
        </button>
        <button onClick={onCancel} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: C.muted2, fontFamily: 'Inter' }}>Cancel</button>
      </div>
    </Card>
  );
}

export default function LightingScreen({ projectId }) {
  const [setups, setSetups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);

  useEffect(() => {
    if (!projectId) return;
    getLighting(projectId).then(setSetups).finally(() => setLoading(false));
  }, [projectId]);

  const handleSave = async (id, data) => {
    await updateLighting(projectId, id, data);
    setSetups(s => s.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const handleDelete = async (id) => {
    await deleteLighting(projectId, id);
    setSetups(s => s.filter(l => l.id !== id));
  };

  const handleCreate = async (data) => {
    const created = await createLighting(projectId, data);
    setSetups(s => [...s, created]);
    setAdding(false);
  };

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading lighting…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={() => setAdding(a => !a)} style={{
          background: C.ink, border: 'none', borderRadius: 6, padding: '8px 14px',
          fontSize: 12.5, fontWeight: 500, cursor: 'pointer', color: '#fff', fontFamily: 'Inter',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Ico.plus/> New setup
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {adding && <NewSetupForm onSave={handleCreate} onCancel={() => setAdding(false)}/>}
        {setups.map(l => (
          <SetupCard key={l.id} l={l} onSave={handleSave} onDelete={handleDelete}/>
        ))}
        {setups.length === 0 && !adding && (
          <div style={{ padding: 40, color: C.muted, fontSize: 13 }}>No lighting setups yet. Click "New setup" to add one.</div>
        )}
      </div>
    </div>
  );
}
