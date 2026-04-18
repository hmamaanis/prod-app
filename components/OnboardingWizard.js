'use client';
import { useState } from 'react';
import { C, Ico, Kbd } from './shared';

// ── Shared primitives ──────────────────────────────────────────────────────

function Field({ label, help, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {help && <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8 }}>{help}</div>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, mono, type = 'text' }) {
  return (
    <input
      type={type} value={value || ''} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', border: `1px solid ${C.line2}`, background: C.panel,
        borderRadius: 6, padding: '10px 12px', fontSize: 13,
        fontFamily: mono ? '"IBM Plex Mono", monospace' : 'Inter', color: C.ink,
        outline: 'none', boxSizing: 'border-box',
      }}
      onFocus={e => (e.target.style.borderColor = C.ink)}
      onBlur={e => (e.target.style.borderColor = C.line2)}
    />
  );
}

function OptionRow({ options, value, onChange, multi }) {
  const toggle = v => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    } else onChange(v);
  };
  const selected = v => (multi ? Array.isArray(value) && value.includes(v) : value === v);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
      {options.map(o => (
        <button key={o.v} onClick={() => toggle(o.v)} style={{
          background: selected(o.v) ? C.tint : C.panel,
          border: selected(o.v) ? `1.5px solid ${C.ink}` : `1px solid ${C.line2}`,
          borderRadius: 6, padding: '12px 14px', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'Inter',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{o.label}</div>
            {o.sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.sub}</div>}
          </div>
          {multi && selected(o.v) && <span style={{ color: C.ok }}><Ico.check /></span>}
        </button>
      ))}
    </div>
  );
}

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    if (input.trim()) { onChange([...(tags || []), input.trim()]); setInput(''); }
  };
  return (
    <div style={{
      border: `1px solid ${C.line2}`, borderRadius: 6, background: C.panel,
      padding: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
    }}>
      {(tags || []).map((t, i) => (
        <span key={i} style={{
          background: C.tint, color: C.ink2, padding: '4px 8px', borderRadius: 4,
          fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          {t}
          <button onClick={() => onChange(tags.filter((_, j) => j !== i))}
            style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0, display: 'flex' }}>
            <Ico.x />
          </button>
        </span>
      ))}
      <input
        value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
        onBlur={add} placeholder={placeholder}
        style={{ flex: 1, minWidth: 160, border: 'none', background: 'none', fontSize: 13, padding: '4px 6px', outline: 'none', fontFamily: 'Inter' }}
      />
    </div>
  );
}

// ── Step components ────────────────────────────────────────────────────────

function StepImport({ a, u }) {
  const [mode, setMode] = useState(a.importMode || 'file');
  const [fileName, setFileName] = useState(a.importFileName || '');
  const [pasted, setPasted] = useState(a.pastedText || '');
  const [phase, setPhase] = useState(a.importPhase || 'idle');
  const [steps, setSteps] = useState([]);
  const [extracted, setExtracted] = useState(a.extracted || null);

  const runExtract = name => {
    setPhase('reading');
    setSteps([]);
    const stages = [
      { t: 400,  label: 'Reading document · 142 pages detected' },
      { t: 1000, label: 'Parsing scene headings · 64 scenes found' },
      { t: 1700, label: 'Identifying characters · 11 speaking roles' },
      { t: 2400, label: 'Extracting locations · 9 unique · 3 INT · 6 EXT' },
      { t: 3100, label: 'Reading tone & genre markers' },
      { t: 3800, label: 'Estimating shoot length from page count' },
    ];
    stages.forEach(s => setTimeout(() => setSteps(prev => [...prev, s.label]), s.t));
    setTimeout(() => setPhase('extracting'), 600);
    setTimeout(() => {
      const ex = {
        title: 'Dust Valley', kind: 'feature',
        scope: 'A retired detective returns to the case that broke her, and finds her own past buried in the file.',
        shootDays: 24, locations: ["Warehouse — Brooklyn", "Rooftop — Jefferson St.", "Nora's apartment", "Diner — Bushwick", "Detective HQ"],
        castSize: 'small', crewSize: 'standard', visualStyle: 'cinematic',
        northStar: 'tenderness in tough places', refs: ['Prisoners', 'Zodiac', 'Deakins'],
        coverage: 'standard',
        castList: [
          { name: 'NORA', scenes: 42 }, { name: 'DET. KANE', scenes: 28 },
          { name: 'ROY', scenes: 14 }, { name: 'MAYA', scenes: 9 }, { name: 'CHILD', scenes: 4 },
        ],
        sceneCount: 64, pageCount: 142, estimatedPages: '1 4/8 / day',
      };
      setPhase('done');
      setExtracted(ex);
      setFileName(name);
      ['title','kind','scope','shootDays','locations','castSize','crewSize','visualStyle','northStar','refs','coverage'].forEach(k => u(k, ex[k]));
      u('extracted', ex); u('importMode', 'file'); u('importFileName', name); u('importPhase', 'done');
    }, 4400);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 22 }}>
        {[
          { v: 'file', label: 'Upload file', sub: 'PDF, Fountain, FDX, DOCX' },
          { v: 'paste', label: 'Paste text', sub: 'Script, treatment, brief' },
          { v: 'skip', label: 'Skip — fill manually', sub: 'Do it the old-fashioned way' },
        ].map(o => (
          <button key={o.v} onClick={() => { setMode(o.v); setPhase('idle'); setExtracted(null); }} style={{
            background: mode === o.v ? C.tint : C.panel,
            border: mode === o.v ? `1.5px solid ${C.ink}` : `1px solid ${C.line2}`,
            borderRadius: 6, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter',
          }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{o.label}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.sub}</div>
          </button>
        ))}
      </div>

      {mode === 'file' && phase === 'idle' && (
        <label style={{
          display: 'block', border: `2px dashed ${C.line2}`, borderRadius: 10,
          padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: C.panel,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.background = C.tint; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.line2; e.currentTarget.style.background = C.panel; }}>
          <input type="file" accept=".pdf,.fdx,.fountain,.docx,.txt" onChange={e => { const f = e.target.files?.[0]; if (f) runExtract(f.name); }} style={{ display: 'none' }} />
          <div style={{ width: 48, height: 48, borderRadius: 10, background: C.tint, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ink2, fontSize: 22 }}>↑</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Drop your script or brief here</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>or click to browse · PDF, Fountain, Final Draft (.fdx), DOCX</div>
          <div style={{ fontSize: 10.5, color: C.muted2, marginTop: 14, fontFamily: '"IBM Plex Mono", monospace' }}>Processed locally · nothing leaves your device until you launch</div>
        </label>
      )}

      {mode === 'paste' && phase === 'idle' && (
        <div>
          <textarea value={pasted} onChange={e => setPasted(e.target.value)} placeholder="Paste a logline, treatment, script pages, creative brief..." style={{
            width: '100%', border: `1px solid ${C.line2}`, background: C.panel,
            borderRadius: 6, padding: 14, fontSize: 13, minHeight: 220,
            fontFamily: '"IBM Plex Mono", monospace', color: C.ink, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{pasted.length} chars</div>
            <button onClick={() => runExtract('pasted text')} disabled={pasted.trim().length < 50} style={{
              background: pasted.trim().length < 50 ? C.line2 : C.ink, color: '#fff',
              border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12.5,
              cursor: pasted.trim().length < 50 ? 'default' : 'pointer', fontFamily: 'Inter', fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}><Ico.sparkle />Extract fields</button>
          </div>
        </div>
      )}

      {mode === 'skip' && (
        <div style={{ padding: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>
          No worries — you can always import later from <strong>Project settings → Script</strong>. Click <strong>Continue</strong> to fill fields manually.
        </div>
      )}

      {(phase === 'reading' || phase === 'extracting') && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: '#EBEFFB', color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico.sparkle /></div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.critical, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>EXTRACTING · {fileName}</div>
          </div>
          <div style={{ height: 4, background: C.line, borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ height: '100%', width: '40%', background: C.critical, animation: 'pulse 2s ease-in-out infinite' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.ink2, fontFamily: '"IBM Plex Mono", monospace', display: 'flex', gap: 8 }}>
                <span style={{ color: C.ok }}>✓</span>{s}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'done' && extracted && (
        <div style={{ background: C.panel, border: `1px solid ${C.ok}`, borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: '#E4EDE4', color: C.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico.check /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Extracted · {fileName}</div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{extracted.sceneCount} scenes · {extracted.pageCount} pages · {extracted.estimatedPages}</div>
            </div>
            <button onClick={() => { setPhase('idle'); setExtracted(null); u('extracted', null); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 11, fontFamily: 'Inter' }}>Re-run</button>
          </div>
          <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Pre-filled fields — edit any in the next steps</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[['Title', extracted.title], ['Kind', extracted.kind], ['Shoot days (est.)', `${extracted.shootDays} days`], ['Visual style', extracted.visualStyle]].map(([l, v]) => (
              <div key={l} style={{ padding: '8px 0', borderBottom: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{v}</div>
              </div>
            ))}
            <div style={{ padding: '8px 0', borderBottom: `1px solid ${C.line}`, gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>Locations</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{extracted.locations.join(' · ')}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {extracted.castList.map(c => (
              <span key={c.name} style={{ background: C.tint, color: C.ink2, padding: '5px 9px', borderRadius: 4, fontSize: 11.5, fontFamily: '"IBM Plex Mono", monospace' }}>
                {c.name} <span style={{ color: C.muted2 }}>· {c.scenes}sc</span>
              </span>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: 10, background: '#EBEFFB', borderRadius: 6, display: 'flex', gap: 8 }}>
            <div style={{ color: C.critical, flexShrink: 0 }}><Ico.sparkle /></div>
            <div style={{ fontSize: 11.5, color: '#2A3C8A', lineHeight: 1.5 }}>
              I've also drafted a <strong>script breakdown</strong> and <strong>shot-list skeleton</strong>. Both will be available in the workspace once you launch.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBasics({ a, u }) {
  return (
    <div>
      <Field label="Project title" help="The name your team will see everywhere.">
        <TextInput value={a.title} onChange={v => u('title', v)} placeholder="e.g. Dust Valley" />
      </Field>
      <Field label="What kind of project?">
        <OptionRow value={a.kind} onChange={v => u('kind', v)} options={[
          { v: 'feature', label: 'Feature film', sub: '60+ minutes' },
          { v: 'short', label: 'Short film', sub: 'Under 40 min' },
          { v: 'tv', label: 'TV · Series', sub: 'Episodic' },
          { v: 'doc', label: 'Documentary', sub: 'Scripted or observational' },
          { v: 'commercial', label: 'Commercial', sub: 'Branded content' },
          { v: 'music', label: 'Music video', sub: 'Performance or narrative' },
        ]} />
      </Field>
      <Field label="Scope (optional)" help="A short logline helps the AI understand tone.">
        <textarea value={a.scope || ''} onChange={e => u('scope', e.target.value)} placeholder="A retired detective returns to a case that broke her..." style={{
          width: '100%', border: `1px solid ${C.line2}`, background: C.panel,
          borderRadius: 6, padding: '10px 12px', fontSize: 13, minHeight: 72,
          fontFamily: 'Inter', color: C.ink, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
        }} />
      </Field>
    </div>
  );
}

function StepSchedule({ a, u }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Start of principal photography">
          <TextInput type="date" value={a.startDate} onChange={v => u('startDate', v)} />
        </Field>
        <Field label="Estimated shoot days">
          <TextInput type="number" value={a.shootDays} onChange={v => u('shootDays', parseInt(v) || 0)} />
        </Field>
      </div>
      <Field label="Where are you shooting?" help="Add locations as you know them. You can edit later.">
        <TagInput tags={a.locations} onChange={v => u('locations', v)} placeholder="Type a location, press Enter" />
      </Field>
      <Field label="Visual style">
        <OptionRow value={a.visualStyle} onChange={v => u('visualStyle', v)} options={[
          { v: 'cinematic', label: 'Cinematic · moody' },
          { v: 'naturalistic', label: 'Naturalistic · observational' },
          { v: 'stylized', label: 'Stylized · graphic' },
          { v: 'vintage', label: 'Vintage · film look' },
          { v: 'commercial', label: 'Commercial · clean' },
          { v: 'other', label: 'Other / set later' },
        ]} />
      </Field>
    </div>
  );
}

function StepScale({ a, u }) {
  return (
    <div>
      <Field label="Cast size">
        <OptionRow value={a.castSize} onChange={v => u('castSize', v)} options={[
          { v: 'tiny', label: '1–3 leads', sub: 'Intimate' },
          { v: 'small', label: '4–8 speaking roles' },
          { v: 'med', label: '9–20 speaking roles' },
          { v: 'large', label: '20+ with background' },
        ]} />
      </Field>
      <Field label="Crew size">
        <OptionRow value={a.crewSize} onChange={v => u('crewSize', v)} options={[
          { v: 'run', label: 'Run & gun', sub: '1–5 people' },
          { v: 'small', label: 'Small unit', sub: '6–15' },
          { v: 'standard', label: 'Standard', sub: '16–40' },
          { v: 'full', label: 'Full crew', sub: '40+' },
        ]} />
      </Field>
      <Field label="Budget range (optional)" help="Used only to calibrate cost warnings. Never shared.">
        <OptionRow value={a.budget} onChange={v => u('budget', v)} options={[
          { v: 'micro', label: 'Under $50K' },
          { v: 'low', label: '$50K — $500K' },
          { v: 'mid', label: '$500K — $5M' },
          { v: 'high', label: '$5M+' },
        ]} />
      </Field>
    </div>
  );
}

function StepCreative({ a, u }) {
  return (
    <div>
      <Field label="Director's north star" help="One line. This seeds the AI's creative proposals.">
        <TextInput value={a.northStar} onChange={v => u('northStar', v)} placeholder="e.g. 'tenderness in tough places'" />
      </Field>
      <Field label="References you love" help="Films, directors, or photographers for tone.">
        <TagInput tags={a.refs || []} onChange={v => u('refs', v)} placeholder="e.g. Roma, Deakins, Wes Anderson" />
      </Field>
      <Field label="Coverage preference">
        <OptionRow value={a.coverage} onChange={v => u('coverage', v)} options={[
          { v: 'minimal', label: 'Minimal coverage', sub: 'Fewer angles, longer takes' },
          { v: 'standard', label: 'Standard coverage', sub: 'Master + 2 sizes' },
          { v: 'heavy', label: 'Heavy coverage', sub: 'Safety nets for edit' },
          { v: 'mixed', label: 'Mixed per scene' },
        ]} />
      </Field>
    </div>
  );
}

function StepPriorities({ a, u }) {
  return (
    <Field label="Pick up to 3" help="The AI will weight these when proposing plans.">
      <OptionRow value={a.priorities} onChange={v => u('priorities', v.slice(0, 3))} multi options={[
        { v: 'time', label: 'Finish on time', sub: 'Minimize overtime' },
        { v: 'budget', label: 'Stay on budget', sub: 'Flag cost overruns early' },
        { v: 'creative', label: 'Protect the vision', sub: "Don't compromise creative choices" },
        { v: 'crew', label: 'Crew wellbeing', sub: 'Respect rest & meal windows' },
        { v: 'flexibility', label: 'Adapt on the fly', sub: 'Prefer plans that allow pivots' },
        { v: 'coverage', label: 'Maximum coverage', sub: 'Give editor options' },
      ]} />
      <div style={{ marginTop: 10, fontSize: 11.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
        {(a.priorities || []).length} / 3 selected
      </div>
    </Field>
  );
}

function StepAI({ a, u }) {
  return (
    <div>
      <Field label="How much should the AI do on its own?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { v: 'silent', label: 'Silent observer', sub: 'I only answer when asked.' },
            { v: 'suggest', label: 'Suggest proactively', sub: 'I surface ideas but never act. Recommended.' },
            { v: 'auto-low', label: 'Auto — safe actions only', sub: 'I can send notifications and update drafts.' },
            { v: 'auto-high', label: 'Auto — full autonomy', sub: 'I can reschedule and reassign. Changes still logged.' },
          ].map(l => (
            <button key={l.v} onClick={() => u('aiAutonomy', l.v)} style={{
              background: a.aiAutonomy === l.v ? C.tint : C.panel,
              border: a.aiAutonomy === l.v ? `1.5px solid ${C.ink}` : `1px solid ${C.line2}`,
              borderRadius: 6, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Inter', display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 99, flexShrink: 0, marginTop: 2,
                border: a.aiAutonomy === l.v ? `5px solid ${C.ink}` : `1.5px solid ${C.line2}`,
              }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{l.label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{l.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Alert me about">
        <OptionRow value={a.alertKinds || ['weather', 'conflicts', 'overtime']} onChange={v => u('alertKinds', v)} multi options={[
          { v: 'weather', label: 'Weather risks' },
          { v: 'conflicts', label: 'Scheduling conflicts' },
          { v: 'overtime', label: 'Overtime forecasts' },
          { v: 'budget', label: 'Budget overruns' },
          { v: 'creative', label: 'Creative suggestions' },
          { v: 'continuity', label: 'Continuity risks' },
        ]} />
      </Field>
    </div>
  );
}

function StepIntegrations({ a, u }) {
  const apps = [
    { v: 'gcal', name: 'Google Calendar', sub: 'Sync call times' },
    { v: 'slack', name: 'Slack', sub: 'Push alerts to #production' },
    { v: 'dropbox', name: 'Dropbox', sub: 'Dailies & script versions' },
    { v: 'stb', name: 'StudioBinder', sub: 'Import script breakdown' },
    { v: 'movie-magic', name: 'Movie Magic', sub: 'Schedule import' },
    { v: 'gusto', name: 'Gusto', sub: 'Payroll for time tracking' },
  ];
  return (
    <Field label="Connect (optional)">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {apps.map(app => {
          const on = (a.integrations || []).includes(app.v);
          return (
            <button key={app.v} onClick={() => u('integrations', on ? a.integrations.filter(x => x !== app.v) : [...(a.integrations || []), app.v])} style={{
              background: C.panel, border: `1px solid ${on ? C.ok : C.line2}`,
              borderRadius: 6, padding: '12px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: C.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 13, color: C.ink2 }}>
                {app.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{app.name}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{app.sub}</div>
              </div>
              <div style={{ fontSize: 11, color: on ? C.ok : C.muted, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>
                {on ? 'Connected' : 'Connect'}
              </div>
            </button>
          );
        })}
      </div>
    </Field>
  );
}

function StepTeam({ a, u }) {
  return (
    <div>
      <Field label="Invite teammates" help="One email per line. Assign roles inside the project later.">
        <textarea value={(a.team || []).join('\n')} onChange={e => u('team', e.target.value.split('\n').filter(Boolean))} placeholder={'ferrara@crew.io\nnakamura@crew.io\nokoye@crew.io'} style={{
          width: '100%', border: `1px solid ${C.line2}`, background: C.panel,
          borderRadius: 6, padding: '10px 12px', fontSize: 13, minHeight: 140,
          fontFamily: '"IBM Plex Mono", monospace', color: C.ink, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
        }} />
      </Field>
      <div style={{ fontSize: 11.5, color: C.muted }}>{(a.team || []).length} people will be invited.</div>
    </div>
  );
}

function StepReview({ a }) {
  const row = (label, val) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.line}` }}>
      <span style={{ fontSize: 12, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', maxWidth: 400 }}>{val || '—'}</span>
    </div>
  );
  return (
    <div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 16px', marginBottom: 18 }}>
        {row('Title', a.title)}
        {row('Kind', a.kind)}
        {row('Start', a.startDate)}
        {row('Shoot days', a.shootDays)}
        {row('Locations', (a.locations || []).join(', '))}
        {row('Cast · crew', `${a.castSize || '—'} · ${a.crewSize || '—'}`)}
        {row('Visual style', a.visualStyle)}
        {row('Priorities', (a.priorities || []).join(', '))}
        {row('AI autonomy', a.aiAutonomy)}
        {row('Integrations', (a.integrations || []).join(', '))}
        {row('Team invites', `${(a.team || []).length} people`)}
      </div>
      <div style={{ padding: 14, background: '#EBEFFB', borderRadius: 8, display: 'flex', gap: 10 }}>
        <div style={{ color: C.critical, flexShrink: 0 }}><Ico.sparkle /></div>
        <div style={{ fontSize: 12.5, color: '#2A3C8A', lineHeight: 1.5 }}>
          On launch, I'll scaffold your call sheet template, create a shot list skeleton from your scope, and draft a kick-off message for your team. You can undo any of it in one click.
        </div>
      </div>
    </div>
  );
}

// ── Main wizard ────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'import',       title: 'Import a script or doc',  subtitle: 'Optional — I can extract what I need from your material.' },
  { key: 'basics',       title: 'The basics',               subtitle: "Let's start with what kind of project you're making." },
  { key: 'schedule',     title: 'Schedule & scope',         subtitle: 'Rough shape of the shoot.' },
  { key: 'scale',        title: 'Team & scale',             subtitle: 'How big is the operation?' },
  { key: 'creative',     title: 'Creative direction',       subtitle: 'So I can generate relevant references.' },
  { key: 'priorities',   title: 'Priorities',               subtitle: "What matters most? I'll optimize for these." },
  { key: 'ai',           title: 'AI permissions',           subtitle: 'How proactive should I be?' },
  { key: 'integrations', title: 'Connect your tools',       subtitle: 'Optional. You can skip and connect later.' },
  { key: 'team',         title: 'Invite your team',         subtitle: 'Email addresses, one per line.' },
  { key: 'review',       title: 'Ready to go',              subtitle: 'Review and launch your project.' },
];

export default function OnboardingWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    title: '', kind: '', scope: '', startDate: '', shootDays: 24,
    locations: [], castSize: '', crewSize: '', budget: '',
    priorities: [], aiAutonomy: 'suggest', alertKinds: ['weather', 'conflicts', 'overtime'],
    integrations: [], team: [], visualStyle: '', northStar: '', refs: [], coverage: '',
  });

  const update = (k, v) => setAnswers(a => ({ ...a, [k]: v }));
  const pct = ((step + 1) / STEPS.length) * 100;

  const canAdvance = () => {
    const key = STEPS[step].key;
    if (key === 'basics') return answers.title && answers.kind;
    if (key === 'schedule') return answers.startDate && answers.shootDays > 0;
    return true;
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>
      {/* Top bar */}
      <div style={{ padding: '18px 32px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 16, background: C.panel }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 12 }}>P</div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.3 }}>PROD</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 4, background: C.line, borderRadius: 99, overflow: 'hidden', maxWidth: 360 }}>
            <div style={{ height: '100%', background: C.ink, width: `${pct}%`, transition: 'width 260ms' }} />
          </div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5 }}>
            {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
          </div>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12.5, fontWeight: 500, fontFamily: 'Inter' }}>
          Save & exit
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 0 }}>
        {/* Steps rail */}
        <div style={{ borderRight: `1px solid ${C.line}`, padding: '28px 20px', background: C.panel }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>New project setup</div>
          {STEPS.map((s, i) => (
            <div key={s.key} onClick={() => i < step && setStep(i)} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '9px 10px', borderRadius: 6, marginBottom: 2,
              cursor: i < step ? 'pointer' : 'default',
              background: i === step ? C.tint : 'none',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                background: i < step ? C.ok : i === step ? C.ink : C.panel,
                border: i > step ? `1px solid ${C.line2}` : 'none',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace',
              }}>
                {i < step ? <Ico.check /> : i + 1}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: i === step ? 600 : 500, color: i > step ? C.muted : C.ink }}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflow: 'auto', padding: '48px 56px', maxWidth: 720, width: '100%' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: C.accent, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>Step {step + 1} of {STEPS.length}</div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, marginTop: 8, lineHeight: 1.15 }}>{STEPS[step].title}</div>
          <div style={{ fontSize: 14.5, color: C.muted, marginTop: 8, lineHeight: 1.5, marginBottom: 32 }}>{STEPS[step].subtitle}</div>

          {STEPS[step].key === 'import'       && <StepImport       a={answers} u={update} />}
          {STEPS[step].key === 'basics'       && <StepBasics       a={answers} u={update} />}
          {STEPS[step].key === 'schedule'     && <StepSchedule     a={answers} u={update} />}
          {STEPS[step].key === 'scale'        && <StepScale        a={answers} u={update} />}
          {STEPS[step].key === 'creative'     && <StepCreative     a={answers} u={update} />}
          {STEPS[step].key === 'priorities'   && <StepPriorities   a={answers} u={update} />}
          {STEPS[step].key === 'ai'           && <StepAI           a={answers} u={update} />}
          {STEPS[step].key === 'integrations' && <StepIntegrations a={answers} u={update} />}
          {STEPS[step].key === 'team'         && <StepTeam         a={answers} u={update} />}
          {STEPS[step].key === 'review'       && <StepReview       a={answers} />}

          {/* Nav */}
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} style={{
              background: 'none', border: 'none', color: step === 0 ? C.muted2 : C.ink2,
              cursor: step === 0 ? 'default' : 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Inter',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>← Back</button>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {step < STEPS.length - 1 && (
                <span style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
                  Press <Kbd>↵</Kbd> to continue
                </span>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()} style={{
                  background: canAdvance() ? C.ink : C.line2, color: '#fff',
                  border: 'none', borderRadius: 6, padding: '10px 18px',
                  fontSize: 13, fontWeight: 500, cursor: canAdvance() ? 'pointer' : 'default',
                  fontFamily: 'Inter', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>Continue <Ico.arrow /></button>
              ) : (
                <button onClick={() => onComplete(answers)} style={{
                  background: C.accent, color: '#fff', border: 'none', borderRadius: 6,
                  padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'Inter', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}><Ico.sparkle />Launch project</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
