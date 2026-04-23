import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a professional script consultant embedded in PROD — a film production coordination app. You are precise, practical, and creative. You help filmmakers structure scripts, organize scenes, and improve storytelling.

You can:
- Analyze and restructure scene order for better story flow
- Apply 3-act structure, Save the Cat beats, or other frameworks
- Break scenes into proper screenplay format (INT./EXT. LOCATION — DAY/NIGHT, action, dialogue)
- Identify pacing issues and coverage gaps
- Suggest which scenes to cut, combine, or expand
- Generate scene breakdowns: INT/EXT, cast needed, props, wardrobe, SFX
- Write or rewrite specific scenes or dialogue
- Suggest shot lists for particular scenes
- Estimate page counts and shooting schedule impact

Rules:
- Respond in the same language the user writes in (Arabic or English)
- Keep responses concise and actionable — this is an on-set tool for busy filmmakers
- When suggesting script changes, format scenes in proper screenplay style (ALL CAPS for scene headers, character names, transitions)
- If the user shares scene data, reference it specifically by scene number
- Never pad responses — one great suggestion beats five mediocre ones`;

// Smart fallback responses when no API key is configured
const FALLBACK_RESPONSES = {
  structure: `Here's a standard 3-act script structure framework:

**ACT 1 (25%)** — Setup
- Opening image / hook (p.1)
- Introduce protagonist in their world
- Inciting incident (p.10-12)
- Break into Act 2 (first plot point)

**ACT 2 (50%)** — Confrontation
- Fun and games / rising stakes
- Midpoint reversal (p.55-60)
- Darkest moment / All is lost (p.75)
- Break into Act 3 (second plot point)

**ACT 3 (25%)** — Resolution
- Climax
- Resolution
- Final image

Want me to map your specific scenes onto this structure?`,

  breakdown: `For a solid scene breakdown, each scene needs:
- **Scene #** + location (INT./EXT. + LOCATION — DAY/NIGHT)
- **Synopsis** (1 sentence max)
- **Cast** who appears
- **Pages** (1/8 page = ~1 min of screen time)
- **Props / Wardrobe / SFX** requirements
- **Notes** for director / DP

Share your scenes and I'll format the breakdown for you.`,

  pacing: `Common pacing issues to check:
1. **Too many talking heads** — break up dialogue-heavy scenes with action cutaways
2. **Scene bloat** — if a scene runs 3+ pages with no action, trim or split
3. **Missing transitions** — scenes that don't connect emotionally feel jarring
4. **Act 2 sag** — add a midpoint twist if the middle 50% feels flat
5. **Rushed ending** — Act 3 needs breathing room for the emotional payoff

What scene or section feels off to you?`,

  default: `I can help you with:
- **Script structure** — 3-act, Save the Cat, or custom frameworks
- **Scene breakdown** — cast, props, pages, location type
- **Pacing analysis** — identify slow or rushed sections
- **Scene rewriting** — improve dialogue or action lines
- **Shot list** — suggest coverage for specific scenes

What would you like to work on?`,
};

function getFallback(message) {
  const lower = message.toLowerCase();
  if (lower.includes('structure') || lower.includes('act') || lower.includes('beat')) return FALLBACK_RESPONSES.structure;
  if (lower.includes('breakdown') || lower.includes('scene') || lower.includes('format')) return FALLBACK_RESPONSES.breakdown;
  if (lower.includes('pace') || lower.includes('pacing') || lower.includes('slow') || lower.includes('long')) return FALLBACK_RESPONSES.pacing;
  return FALLBACK_RESPONSES.default;
}

export async function POST(req) {
  try {
    const { messages, context } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // ── No API key — return smart fallback ───────────────────────────────
    if (!apiKey || apiKey.startsWith('sk-ant-...')) {
      const lastMsg = messages[messages.length - 1]?.content || '';
      await new Promise(r => setTimeout(r, 700 + Math.random() * 600)); // realistic delay
      return NextResponse.json({
        content: getFallback(lastMsg),
        model: 'fallback',
        usage: null,
      });
    }

    // ── Call Anthropic Claude ─────────────────────────────────────────────
    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nCurrent project context:\n${context}`
      : SYSTEM_PROMPT;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1500,
        system: systemWithContext,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error('Anthropic error:', err);
      // Graceful fallback on API error
      const lastMsg = messages[messages.length - 1]?.content || '';
      return NextResponse.json({ content: getFallback(lastMsg), model: 'fallback' });
    }

    const data = await anthropicRes.json();
    const text = data?.content?.[0]?.text || '';

    return NextResponse.json({
      content: text,
      model: data.model,
      usage: data.usage,
    });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json({ error: 'Internal error', detail: err.message }, { status: 500 });
  }
}
