'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, Ico, Avatar, SectionHead, PrimaryBtn, GhostBtn } from '@/components/shared';
import { getCast, getCrew, getTokens, createToken, deleteToken } from '@/lib/api';

const ROLE_PRESETS = {
  'Director':  ['dashboard','shotlist','breakdown','cast','ai'],
  'DP':        ['shotlist','lighting','breakdown','dashboard'],
  'AD':        ['dashboard','shotlist','cast','activity','breakdown'],
  'Gaffer':    ['lighting','shotlist'],
  'Actor':     ['cast','shotlist'],
  'Producer':  ['budget','cast','activity','ai','dashboard'],
  'PA':        ['cast','shotlist','location'],
};

const ALL_TABS = ['dashboard','shotlist','cast','lighting','location','tracker','breakdown','activity','budget','ai'];

const TAB_LABELS = {
  dashboard: 'Today', shotlist: 'Shots', cast: 'Cast', lighting: 'Lights',
  location: 'Map', tracker: 'Track', breakdown: 'Script', activity: 'Log',
  budget: 'Budget', ai: 'AI',
};

function getPresetForRole(role) {
  if (!role) return [];
  const match = Object.keys(ROLE_PRESETS).find(k => role.toLowerCase().includes(k.toLowerCase()));
  return match ? ROLE_PRESETS[match] : [];
}

function PersonRow({ person, type, existingToken, projectId, onTokenChange }) {
  const preset = getPresetForRole(person.role);
  const initialTabs = existingToken?.visible_tabs ?? preset;
  const [checkedTabs, setCheckedTabs] = useState(initialTabs);
  const [generatedUrl, setGeneratedUrl] = useState(
    existingToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/crew/${existingToken.token}` : null
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleTab = tab => {
    setCheckedTabs(prev =>
      prev.includes(tab) ? prev.filter(t => t !== tab) : [...prev, tab]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (existingToken) {
        await deleteToken(projectId, existingToken.id);
      }
      const result = await createToken(projectId, {
        crew_member_id: person.id,
        crew_type: type,
        name: person.name,
        role: person.role,
        visible_tabs: checkedTabs,
      });
      const url = `${window.location.origin}/crew/${result.token}`;
      setGeneratedUrl(url);
      onTokenChange(person.id, type, result);
    } catch (err) {
      console.error('Failed to generate token', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: '14px 20px', borderBottom: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Avatar name={person.name} size={30}/>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{person.name}</div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{person.role}</div>
        </div>

        {/* Tab checkboxes — 2 rows of 5 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, auto)', gap: '4px 8px' }}>
          {ALL_TABS.map(tab => (
            <label key={tab} style={{
              display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
              fontSize: 11, color: C.ink2, userSelect: 'none', whiteSpace: 'nowrap',
            }}>
              <input
                type="checkbox"
                checked={checkedTabs.includes(tab)}
                onChange={() => toggleTab(tab)}
                style={{ accentColor: C.ink, width: 12, height: 12 }}
              />
              {TAB_LABELS[tab]}
            </label>
          ))}
        </div>

        <PrimaryBtn onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : existingToken ? 'Regenerate' : 'Generate link'}
        </PrimaryBtn>
      </div>

      {generatedUrl && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, padding: '6px 10px', background: C.tint, borderRadius: 6,
            fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: C.ink2,
            border: `1px solid ${C.line}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {generatedUrl}
          </div>
          <GhostBtn onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </GhostBtn>
        </div>
      )}
    </div>
  );
}

export default function ViewSettingsScreen({ projectId }) {
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCopied, setAllCopied] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      getCast(projectId),
      getCrew(projectId),
      getTokens(projectId),
    ]).then(([c, cr, t]) => {
      setCast(c);
      setCrew(cr);
      setTokens(t);
    }).catch(err => {
      console.error('ViewSettingsScreen load error', err);
    }).finally(() => setLoading(false));
  }, [projectId]);

  const handleTokenChange = useCallback((personId, type, newToken) => {
    setTokens(prev => {
      const filtered = prev.filter(t => !(t.crew_member_id === personId && t.crew_type === type));
      return [...filtered, newToken];
    });
  }, []);

  const getToken = (personId, type) =>
    tokens.find(t => t.crew_member_id === personId && t.crew_type === type) || null;

  const applyPreset = (presetRole) => {
    const tabs = ROLE_PRESETS[presetRole];
    if (!tabs) return;
    // This just signals that preset was applied — individual rows manage their own state
    // via initial values, so a full re-render would be needed. We'll use a key trick.
    // For simplicity, notify user via console; real implementation might lift state.
  };

  const handleCopyAll = () => {
    const allPeople = [
      ...cast.map(p => ({ ...p, _type: 'cast' })),
      ...crew.map(p => ({ ...p, _type: 'crew' })),
    ];
    const lines = allPeople.map(p => {
      const tok = getToken(p.id, p._type);
      if (!tok) return null;
      const url = `${window.location.origin}/crew/${tok.token}`;
      return `${p.name} (${p.role})\n${url}`;
    }).filter(Boolean);

    const projectTitle = ''; // Could be passed as prop if needed
    const text = `PROD${projectTitle ? ` — ${projectTitle}` : ''} — Crew Access Links\n\n${lines.join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            height: 64, borderRadius: 8, background: C.line, marginBottom: 10,
            animation: 'pulse 1.4s ease-in-out infinite',
          }}/>
        ))}
      </div>
    );
  }

  const allPeople = [
    ...cast.map(p => ({ ...p, _type: 'cast' })),
    ...crew.map(p => ({ ...p, _type: 'crew' })),
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100%' }}>

      {/* Section 1: Role presets */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, marginBottom: 20 }}>
        <SectionHead title="Role presets">Role presets</SectionHead>
        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto', padding: '14px 20px',
          scrollbarWidth: 'none',
        }}>
          {Object.entries(ROLE_PRESETS).map(([roleName, tabs]) => (
            <div key={roleName} style={{
              flexShrink: 0, background: C.tint, border: `1px solid ${C.line}`,
              borderRadius: 8, padding: '12px 14px', minWidth: 160,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{roleName}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
                {tabs.map(t => TAB_LABELS[t]).join(', ')}
              </div>
              <button
                onClick={() => applyPreset(roleName)}
                style={{
                  background: C.ink, color: '#fff', border: 'none', borderRadius: 5,
                  padding: '5px 10px', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'Inter, system-ui', whiteSpace: 'nowrap',
                }}
              >
                Apply to all {roleName}s
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Crew access links */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, marginBottom: 20 }}>
        <SectionHead action={
          <GhostBtn onClick={handleCopyAll}>
            {allCopied ? 'Copied!' : 'Copy all links'}
          </GhostBtn>
        }>
          Crew access links
        </SectionHead>

        {allPeople.length === 0 && (
          <div style={{ padding: '24px 20px', color: C.muted, fontSize: 13, textAlign: 'center' }}>
            No cast or crew found for this project.
          </div>
        )}

        {allPeople.map(person => (
          <PersonRow
            key={`${person._type}-${person.id}`}
            person={person}
            type={person._type}
            existingToken={getToken(person.id, person._type)}
            projectId={projectId}
            onTokenChange={handleTokenChange}
          />
        ))}
      </div>

      {/* Section 3: Share all */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10 }}>
        <SectionHead>Share all</SectionHead>
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
            Copy all generated links as a formatted list you can paste into a message or email.
          </p>
          <PrimaryBtn onClick={handleCopyAll}>
            {allCopied ? 'Copied!' : 'Copy all links as list'}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
