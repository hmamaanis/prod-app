'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { C, Ico } from './shared';

// ── Icons ─────────────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function ChatIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function SparkleIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>
    </svg>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <>
      <style>{`
        @keyframes chat-dot { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        .chat-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:#9A9A95; animation:chat-dot 1.2s infinite; margin:0 2px; }
        .chat-dot:nth-child(2){animation-delay:.2s}
        .chat-dot:nth-child(3){animation-delay:.4s}
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '2px 0' }}>
        <span className="chat-dot"/><span className="chat-dot"/><span className="chat-dot"/>
      </div>
    </>
  );
}

// ── Markdown-lite renderer (bold, code, line breaks) ─────────────────────────
function MsgText({ text }) {
  if (!text) return null;
  // Split on code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ fontSize: 13, lineHeight: 1.65, color: 'inherit', fontFamily: 'Inter, system-ui' }}>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return (
            <pre key={i} style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 5, padding: '8px 10px', fontSize: 11.5, fontFamily: '"IBM Plex Mono", monospace', overflowX: 'auto', margin: '6px 0', whiteSpace: 'pre-wrap' }}>
              {code}
            </pre>
          );
        }
        // Inline formatting within regular text
        const lines = part.split('\n');
        return lines.map((line, li) => {
          // Bold: **text**
          const boldParts = line.split(/\*\*(.*?)\*\*/g);
          const rendered = boldParts.map((bp, bi) => bi % 2 === 1 ? <strong key={bi}>{bp}</strong> : bp);
          return (
            <span key={`${i}-${li}`}>
              {rendered}
              {li < lines.length - 1 && <br/>}
            </span>
          );
        });
      })}
    </div>
  );
}

// ── Quick suggestion chips ────────────────────────────────────────────────────
const CHIPS = [
  { label: 'Structure my script', msg: 'Help me structure my script using 3-act format' },
  { label: 'Break down a scene', msg: 'Help me create a proper scene breakdown with cast, props, and notes' },
  { label: 'Fix pacing', msg: 'My script feels slow in the middle. How do I fix the pacing?' },
  { label: 'Write a scene', msg: 'Help me write a scene in proper screenplay format' },
  { label: 'Shot list for scene', msg: 'Suggest a shot list for one of my scenes' },
  { label: 'Arabic script tips', msg: 'What are the best practices for structuring an Arabic-language script?' },
];

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <span style={{ fontSize: 11, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', background: C.tint, padding: '2px 8px', borderRadius: 4 }}>{msg.content}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      {/* AI avatar */}
      {!isUser && (
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${C.critical}18`, color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, marginTop: 2 }}>
          <SparkleIcon size={12}/>
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        padding: '10px 13px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        background: isUser ? C.ink : C.panel,
        color: isUser ? '#fff' : C.ink,
        border: isUser ? 'none' : `1px solid ${C.line}`,
        boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {msg.typing ? <TypingDots/> : <MsgText text={msg.content}/>}
        {msg.timestamp && !msg.typing && (
          <div style={{ fontSize: 10, color: isUser ? 'rgba(255,255,255,0.5)' : C.muted2, marginTop: 5, textAlign: isUser ? 'right' : 'left', fontFamily: '"IBM Plex Mono", monospace' }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function AIChatPanel({ open, onClose, projectId, projectTitle, currentTab, sceneContext }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your script consultant.\n\nI can help you **structure scenes**, **write dialogue**, **fix pacing**, or **generate breakdowns**. What are we working on?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [apiMode, setApiMode] = useState(''); // 'claude' | 'fallback' | ''
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const storageKey = `prod-chat-${projectId || 'default'}`;

  // Load saved messages
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && Array.isArray(saved) && saved.length > 0) setMessages(saved);
    } catch {}
  }, [storageKey]);

  // Save messages
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch {}
  }, [messages, storageKey]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const buildContext = () => {
    const parts = [];
    if (projectTitle) parts.push(`Project: "${projectTitle}"`);
    if (currentTab)   parts.push(`Current screen: ${currentTab}`);
    if (sceneContext?.length) {
      parts.push(`Scenes in project:\n${sceneContext.map(s => `- Scene ${s.scene_number}: ${s.synopsis || s.location || ''} (${s.int_ext || ''} ${s.day_night || ''})`).join('\n')}`);
    }
    return parts.join('\n');
  };

  const sendMessage = useCallback(async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', content: userText, timestamp: Date.now() };
    const typingMsg = { id: 'typing', role: 'assistant', content: '', typing: true };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setLoading(true);

    try {
      // Build conversation history for API (exclude typing placeholder + system)
      const history = [...messages, userMsg]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .filter(m => !m.typing)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, context: buildContext() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      if (data.model) setApiMode(data.model === 'fallback' ? 'fallback' : 'claude');

      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        { id: Date.now() + 1, role: 'assistant', content: data.content, timestamp: Date.now() },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        { id: Date.now() + 1, role: 'assistant', content: `Sorry — something went wrong. (${err.message})`, timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, buildContext]);

  const clearChat = () => {
    const fresh = [{ id: 'welcome-' + Date.now(), role: 'assistant', content: "Chat cleared. What would you like to work on?", timestamp: Date.now() }];
    setMessages(fresh);
    try { localStorage.removeItem(storageKey); } catch {}
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.3)', display: 'none' }} className="chat-backdrop"/>

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 61,
        width: 380, maxWidth: '100vw',
        background: C.bg,
        borderLeft: `1px solid ${C.line}`,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px -16px rgba(0,0,0,0.18)',
        animation: 'slideInRight 180ms ease',
      }}>
        <style>{`
          @keyframes slideInRight { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
          @media (max-width: 700px) { .chat-backdrop { display: block !important; } }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '14px 16px', borderBottom: `1px solid ${C.line}`,
          background: C.panel, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${C.critical}18`, color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SparkleIcon size={15}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, fontFamily: 'Inter', letterSpacing: -0.2 }}>Script Assistant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: apiMode === 'fallback' ? C.warn : apiMode === 'claude' ? C.ok : C.muted2, flexShrink: 0 }}/>
              <span style={{ fontSize: 10.5, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>
                {apiMode === 'claude' ? 'Powered by Claude' : apiMode === 'fallback' ? 'Demo mode' : 'Ready'}
              </span>
            </div>
          </div>
          <button onClick={clearChat} title="Clear chat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, padding: 4, display: 'flex', borderRadius: 5 }}
            onMouseEnter={e => e.currentTarget.style.background = C.tint}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, padding: 4, display: 'flex', borderRadius: 5 }}
            onMouseEnter={e => e.currentTarget.style.background = C.tint}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <CloseIcon/>
          </button>
        </div>

        {/* Context bar */}
        {(projectTitle || currentTab) && (
          <div style={{ padding: '7px 14px', background: `${C.accent}0D`, borderBottom: `1px solid ${C.accent}25`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: C.accent2, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.8 }}>CONTEXT</span>
            <span style={{ fontSize: 11.5, color: C.ink2, fontFamily: 'Inter' }}>{projectTitle || 'Project'}</span>
            {currentTab && (
              <>
                <span style={{ color: C.muted2 }}>·</span>
                <span style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'capitalize' }}>{currentTab}</span>
              </>
            )}
            {sceneContext?.length > 0 && (
              <>
                <span style={{ color: C.muted2 }}>·</span>
                <span style={{ fontSize: 11, color: C.muted }}>{sceneContext.length} scenes</span>
              </>
            )}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg}/>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* Quick chips */}
        <div style={{ padding: '8px 12px 4px', borderTop: `1px solid ${C.line}`, overflowX: 'auto', display: 'flex', gap: 6, flexShrink: 0 }}>
          {CHIPS.map(c => (
            <button key={c.label} onClick={() => sendMessage(c.msg)} disabled={loading} style={{
              flexShrink: 0,
              background: 'none', border: `1px solid ${C.line2}`, borderRadius: 99,
              padding: '4px 10px', fontSize: 11.5, cursor: loading ? 'default' : 'pointer',
              color: C.ink2, fontFamily: 'Inter', whiteSpace: 'nowrap', opacity: loading ? 0.5 : 1,
              transition: 'all 120ms',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.tint; e.currentTarget.style.borderColor = C.line; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = C.line2; }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.line}`, background: C.panel, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 12, padding: '8px 10px 8px 14px' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder="Ask about scene structure, dialogue, pacing…"
              rows={1}
              style={{
                flex: 1, border: 'none', background: 'none', resize: 'none', outline: 'none',
                fontSize: 13, fontFamily: 'Inter', color: C.ink, lineHeight: 1.5,
                maxHeight: 120, overflowY: 'auto',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: loading || !input.trim() ? C.line : C.ink,
              color: '#fff', border: 'none',
              cursor: loading || !input.trim() ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms',
            }}>
              {loading
                ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'chat-dot 0.7s linear infinite' }}/>
                : <SendIcon/>}
            </button>
          </div>
          <div style={{ fontSize: 10, color: C.muted2, marginTop: 6, fontFamily: '"IBM Plex Mono", monospace', textAlign: 'center' }}>
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </>
  );
}

// ── Toggle button (export for use in project page) ────────────────────────────
export function ChatToggleButton({ open, onClick, hasUnread }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative',
      background: open ? C.ink : C.panel,
      color: open ? '#fff' : C.ink2,
      border: `1px solid ${open ? C.ink : C.line2}`,
      borderRadius: 8, padding: '7px 12px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
      fontSize: 12.5, fontWeight: 500, fontFamily: 'Inter',
      transition: 'all 140ms', flexShrink: 0,
    }}>
      <ChatIcon size={15}/>
      Script AI
      {hasUnread && !open && (
        <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: C.accent, border: `1.5px solid ${C.panel}` }}/>
      )}
    </button>
  );
}
