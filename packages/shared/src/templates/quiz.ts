import type { ProjectTemplate } from './types';

/* ─── helpers to reduce boilerplate ──────────────────────────────────────── */

const pad = (t = 0, r = 16, b = 0, l = 16) => ({ top: t, right: r, bottom: b, left: l });

function feedbackScreen(
  id: string,
  emoji: string,
  title: string,
  body: string,
  bg: string,
  titleColor: string,
  bodyColor: string,
  nextNodeId: string,
  nextLabel: string,
) {
  return {
    id: `sc_${id}_icon`,
    type: 'text' as const,
    props: { content: emoji },
    style: { base: { fontSize: 44, textAlign: 'center' as const, padding: pad(48, 0, 8, 0) } },
    _extra: {
      bg,
      titleComp: {
        id: `sc_${id}_title`,
        type: 'text' as const,
        props: { content: title },
        style: { base: { fontSize: 20, fontWeight: 'bold' as const, textColor: titleColor, textAlign: 'center' as const, padding: pad(0, 16, 6, 16) } },
      },
      bodyComp: {
        id: `sc_${id}_body`,
        type: 'text' as const,
        props: { content: body },
        style: { base: { fontSize: 13, textColor: bodyColor, textAlign: 'center' as const, padding: pad(0, 20, 28, 20), lineHeight: 1.5 } },
      },
      btnComp: {
        id: `sc_${id}_btn`,
        type: 'button' as const,
        props: { label: nextLabel, variant: 'primary', navigateTo: nextNodeId },
        style: { base: { margin: pad(0, 32, 0, 32) } },
      },
    },
  };
}

function buildFeedbackNode(
  nodeId: string,
  label: string,
  emoji: string,
  title: string,
  body: string,
  bg: string,
  titleColor: string,
  bodyColor: string,
  nextNodeId: string,
  nextLabel: string,
  position: { x: number; y: number },
) {
  const f = feedbackScreen(nodeId, emoji, title, body, bg, titleColor, bodyColor, nextNodeId, nextLabel);
  return {
    id: nodeId,
    label,
    type: 'detail',
    position,
    screen: {
      backgroundColor: f._extra.bg,
      rootComponents: [
        { id: f.id, type: f.type, props: f.props, style: f.style },
        f._extra.titleComp,
        f._extra.bodyComp,
        f._extra.btnComp,
      ],
    },
  };
}

/* ─── template ───────────────────────────────────────────────────────────── */

export const QUIZ_TEMPLATE: ProjectTemplate = {
  id: 'quiz',
  name: 'Quiz',
  description: 'An interactive quiz where every answer leads to a unique screen with tailored feedback.',
  icon: '🧠',
  datasources: [
    {
      id: 'ds_results',
      name: 'Results',
      fields: [
        { key: 'player', label: 'Player', type: 'text', required: true },
        { key: 'score', label: 'Score', type: 'number' },
        { key: 'path', label: 'Path Taken', type: 'text' },
        { key: 'completedAt', label: 'Completed At', type: 'date' },
      ],
      sampleEntries: [
        { player: 'Alice', score: 3, path: 'A→B→A', completedAt: '2026-03-20' },
        { player: 'Bob', score: 1, path: 'B→A→B', completedAt: '2026-03-21' },
      ],
    },
  ],

  nodes: [
    /* ════════════════════  WELCOME  ════════════════════ */
    {
      id: 'node_welcome',
      label: 'Welcome',
      type: 'landing',
      position: { x: 400, y: 0 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          { id: 'sc_sp', type: 'spacer', props: { height: 60 } },
          { id: 'sc_hero', type: 'text', props: { content: '🧠' }, style: { base: { fontSize: 52, textAlign: 'center', padding: pad(0, 0, 4, 0) } } },
          { id: 'sc_title', type: 'text', props: { content: 'Knowledge Quiz' }, style: { base: { fontSize: 28, fontWeight: 'bold', textColor: '#f8fafc', textAlign: 'center', padding: pad(0, 16, 4, 16) } } },
          { id: 'sc_sub', type: 'text', props: { content: 'Answer 3 questions. Every answer takes you to a different screen!' }, style: { base: { fontSize: 14, textColor: '#94a3b8', textAlign: 'center', padding: pad(0, 24, 32, 24) } } },
          { id: 'sc_go', type: 'button', props: { label: 'Start Quiz', variant: 'primary', navigateTo: 'node_q1' }, style: { base: { margin: pad(0, 40, 0, 40) } } },
        ],
      },
    },

    /* ════════════════════  QUESTION 1  ════════════════════ */
    {
      id: 'node_q1',
      label: 'Q1 — Planets',
      type: 'form',
      position: { x: 400, y: 220 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          { id: 'sc_q1_b', type: 'badge', props: { text: 'Question 1 of 3', variant: 'secondary' }, style: { base: { margin: pad(24, 16, 8, 16) } } },
          { id: 'sc_q1_q', type: 'text', props: { content: 'What is the largest planet in our solar system?' }, style: { base: { fontSize: 20, fontWeight: 'bold', textColor: '#f8fafc', padding: pad(8, 16, 24, 16) } } },
          { id: 'sc_q1a', type: 'button', props: { label: 'A) Jupiter', variant: 'secondary', navigateTo: 'node_d1' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q1', value: 'A' } }] },
          { id: 'sc_q1b', type: 'button', props: { label: 'B) Saturn', variant: 'secondary', navigateTo: 'node_d1' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q1', value: 'B' } }] },
          { id: 'sc_q1c', type: 'button', props: { label: 'C) Neptune', variant: 'secondary', navigateTo: 'node_d1' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q1', value: 'C' } }] },
        ],
      },
    },

    /* ── Decision 1 ── */
    {
      id: 'node_d1',
      label: 'Q1 Route',
      type: 'decision',
      position: { x: 400, y: 440 },
      props: {
        conditions: [
          { label: 'Jupiter', expression: 'context.q1 === "A"' },
          { label: 'Saturn', expression: 'context.q1 === "B"' },
          { label: 'Neptune', expression: 'context.q1 === "C"' },
        ],
      },
      screen: { rootComponents: [] },
    },

    /* ── Q1 Answer A — Jupiter (correct) ── */
    buildFeedbackNode(
      'node_q1a', 'Jupiter!',
      '🪐', 'Correct — Jupiter!',
      'Jupiter is a gas giant with a mass more than 300 times that of Earth. Its iconic Great Red Spot is a storm larger than our entire planet, raging for over 350 years.',
      '#052e16', '#86efac', '#bbf7d0',
      'node_q2', 'Next Question →',
      { x: 80, y: 620 },
    ),

    /* ── Q1 Answer B — Saturn (wrong) ── */
    buildFeedbackNode(
      'node_q1b', 'Saturn',
      '💫', 'Close — it\'s Saturn\'s rings that steal the show!',
      'Saturn is the second-largest planet and famous for its stunning ring system made of ice and rock. But Jupiter still outweighs it by about 3.3 times!',
      '#1e1b4b', '#a5b4fc', '#c7d2fe',
      'node_q2', 'Next Question →',
      { x: 400, y: 620 },
    ),

    /* ── Q1 Answer C — Neptune (wrong) ── */
    buildFeedbackNode(
      'node_q1c', 'Neptune',
      '🌊', 'Nope — Neptune is the windiest planet though!',
      'Neptune is actually the fourth-largest planet. It has the strongest sustained winds in the solar system, reaching speeds of over 2,100 km/h. The answer was Jupiter.',
      '#172554', '#7dd3fc', '#bae6fd',
      'node_q2', 'Next Question →',
      { x: 720, y: 620 },
    ),

    /* ════════════════════  QUESTION 2  ════════════════════ */
    {
      id: 'node_q2',
      label: 'Q2 — Web',
      type: 'form',
      position: { x: 400, y: 880 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          { id: 'sc_q2_b', type: 'badge', props: { text: 'Question 2 of 3', variant: 'secondary' }, style: { base: { margin: pad(24, 16, 8, 16) } } },
          { id: 'sc_q2_q', type: 'text', props: { content: 'Which language is primarily used for styling web pages?' }, style: { base: { fontSize: 20, fontWeight: 'bold', textColor: '#f8fafc', padding: pad(8, 16, 24, 16) } } },
          { id: 'sc_q2a', type: 'button', props: { label: 'A) HTML', variant: 'secondary', navigateTo: 'node_d2' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q2', value: 'A' } }] },
          { id: 'sc_q2b', type: 'button', props: { label: 'B) CSS', variant: 'secondary', navigateTo: 'node_d2' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q2', value: 'B' } }] },
          { id: 'sc_q2c', type: 'button', props: { label: 'C) Python', variant: 'secondary', navigateTo: 'node_d2' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q2', value: 'C' } }] },
        ],
      },
    },

    /* ── Decision 2 ── */
    {
      id: 'node_d2',
      label: 'Q2 Route',
      type: 'decision',
      position: { x: 400, y: 1100 },
      props: {
        conditions: [
          { label: 'HTML', expression: 'context.q2 === "A"' },
          { label: 'CSS', expression: 'context.q2 === "B"' },
          { label: 'Python', expression: 'context.q2 === "C"' },
        ],
      },
      screen: { rootComponents: [] },
    },

    /* ── Q2 Answer A — HTML (wrong) ── */
    buildFeedbackNode(
      'node_q2a', 'HTML',
      '📄', 'Not quite — HTML is for structure!',
      'HTML (HyperText Markup Language) defines the structure and content of web pages — headings, paragraphs, images. But the visual styling? That\'s CSS\'s job.',
      '#431407', '#fdba74', '#fed7aa',
      'node_q3', 'Next Question →',
      { x: 80, y: 1280 },
    ),

    /* ── Q2 Answer B — CSS (correct) ── */
    buildFeedbackNode(
      'node_q2b', 'CSS!',
      '🎨', 'Correct — CSS!',
      'CSS (Cascading Style Sheets) controls layout, colors, fonts, and animations. Fun fact: the first CSS proposal was made in 1994 by Hakon Wium Lie, and it took until 1996 for browsers to start supporting it.',
      '#052e16', '#86efac', '#bbf7d0',
      'node_q3', 'Next Question →',
      { x: 400, y: 1280 },
    ),

    /* ── Q2 Answer C — Python (wrong) ── */
    buildFeedbackNode(
      'node_q2c', 'Python',
      '🐍', 'Nah — Python rules the backend!',
      'Python is incredible for backend services, data science, AI, and scripting — but browsers don\'t natively run Python. Web styling is handled by CSS.',
      '#1a2e05', '#bef264', '#d9f99d',
      'node_q3', 'Next Question →',
      { x: 720, y: 1280 },
    ),

    /* ════════════════════  QUESTION 3  ════════════════════ */
    {
      id: 'node_q3',
      label: 'Q3 — HTTP',
      type: 'form',
      position: { x: 400, y: 1540 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          { id: 'sc_q3_b', type: 'badge', props: { text: 'Question 3 of 3', variant: 'secondary' }, style: { base: { margin: pad(24, 16, 8, 16) } } },
          { id: 'sc_q3_q', type: 'text', props: { content: 'What does "HTTP" stand for?' }, style: { base: { fontSize: 20, fontWeight: 'bold', textColor: '#f8fafc', padding: pad(8, 16, 24, 16) } } },
          { id: 'sc_q3a', type: 'button', props: { label: 'A) HyperText Transfer Protocol', variant: 'secondary', navigateTo: 'node_d3' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q3', value: 'A' } }] },
          { id: 'sc_q3b', type: 'button', props: { label: 'B) High Tech Programming', variant: 'secondary', navigateTo: 'node_d3' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q3', value: 'B' } }] },
          { id: 'sc_q3c', type: 'button', props: { label: 'C) Hyper Tool Transfer Process', variant: 'secondary', navigateTo: 'node_d3' }, style: { base: { margin: pad(0, 16, 8, 16) } }, actions: [{ trigger: 'onPress', type: 'SET_CONTEXT', payload: { key: 'q3', value: 'C' } }] },
        ],
      },
    },

    /* ── Decision 3 ── */
    {
      id: 'node_d3',
      label: 'Q3 Route',
      type: 'decision',
      position: { x: 400, y: 1760 },
      props: {
        conditions: [
          { label: 'HTTP', expression: 'context.q3 === "A"' },
          { label: 'HTP', expression: 'context.q3 === "B"' },
          { label: 'HTTP?', expression: 'context.q3 === "C"' },
        ],
      },
      screen: { rootComponents: [] },
    },

    /* ── Q3 Answer A — HyperText Transfer Protocol (correct) ── */
    buildFeedbackNode(
      'node_q3a', 'HTTP!',
      '🏆', 'Nailed it — HyperText Transfer Protocol!',
      'HTTP was invented by Tim Berners-Lee in 1989 at CERN. It\'s the foundation of data communication on the World Wide Web. HTTPS adds a security layer using TLS encryption.',
      '#042f2e', '#5eead4', '#99f6e4',
      'node_welcome', 'Play Again',
      { x: 80, y: 1940 },
    ),

    /* ── Q3 Answer B — High Tech Programming (wrong) ── */
    buildFeedbackNode(
      'node_q3b', 'HTP?',
      '💻', '"High Tech Programming" sounds cool, but no!',
      'That\'s a common misconception! HTTP stands for HyperText Transfer Protocol. It defines how messages are formatted and transmitted between web servers and browsers.',
      '#1c1917', '#fdba74', '#fed7aa',
      'node_welcome', 'Play Again',
      { x: 400, y: 1940 },
    ),

    /* ── Q3 Answer C — Hyper Tool Transfer Process (wrong) ── */
    buildFeedbackNode(
      'node_q3c', 'HHTTP?',
      '🔧', 'Nice guess, but it\'s HyperText Transfer Protocol!',
      '"Hyper Tool Transfer Process" isn\'t a thing — but it does sound like something from a sci-fi movie. The real answer: HyperText Transfer Protocol, created to power the web.',
      '#0c0a09', '#e879f9', '#f0abfc',
      'node_welcome', 'Play Again',
      { x: 720, y: 1940 },
    ),
  ],

  edges: [
    /* Welcome → Q1 */
    { id: 'e_w_q1', source: 'node_welcome', target: 'node_q1' },

    /* Q1 → Decision 1 */
    { id: 'e_q1_d1', source: 'node_q1', target: 'node_d1' },

    /* Decision 1 → 3 unique screens */
    { id: 'e_d1_a', source: 'node_d1', target: 'node_q1a', sourceHandle: 'condition-0', data: { label: 'Jupiter', conditionIndex: 0 } },
    { id: 'e_d1_b', source: 'node_d1', target: 'node_q1b', sourceHandle: 'condition-1', data: { label: 'Saturn', conditionIndex: 1 } },
    { id: 'e_d1_c', source: 'node_d1', target: 'node_q1c', sourceHandle: 'condition-2', data: { label: 'Neptune', conditionIndex: 2 } },

    /* All Q1 feedback screens → Q2 */
    { id: 'e_q1a_q2', source: 'node_q1a', target: 'node_q2' },
    { id: 'e_q1b_q2', source: 'node_q1b', target: 'node_q2' },
    { id: 'e_q1c_q2', source: 'node_q1c', target: 'node_q2' },

    /* Q2 → Decision 2 */
    { id: 'e_q2_d2', source: 'node_q2', target: 'node_d2' },

    /* Decision 2 → 3 unique screens */
    { id: 'e_d2_a', source: 'node_d2', target: 'node_q2a', sourceHandle: 'condition-0', data: { label: 'HTML', conditionIndex: 0 } },
    { id: 'e_d2_b', source: 'node_d2', target: 'node_q2b', sourceHandle: 'condition-1', data: { label: 'CSS', conditionIndex: 1 } },
    { id: 'e_d2_c', source: 'node_d2', target: 'node_q2c', sourceHandle: 'condition-2', data: { label: 'Python', conditionIndex: 2 } },

    /* All Q2 feedback screens → Q3 */
    { id: 'e_q2a_q3', source: 'node_q2a', target: 'node_q3' },
    { id: 'e_q2b_q3', source: 'node_q2b', target: 'node_q3' },
    { id: 'e_q2c_q3', source: 'node_q2c', target: 'node_q3' },

    /* Q3 → Decision 3 */
    { id: 'e_q3_d3', source: 'node_q3', target: 'node_d3' },

    /* Decision 3 → 3 unique final screens */
    { id: 'e_d3_a', source: 'node_d3', target: 'node_q3a', sourceHandle: 'condition-0', data: { label: 'HTTP', conditionIndex: 0 } },
    { id: 'e_d3_b', source: 'node_d3', target: 'node_q3b', sourceHandle: 'condition-1', data: { label: 'HTP', conditionIndex: 1 } },
    { id: 'e_d3_c', source: 'node_d3', target: 'node_q3c', sourceHandle: 'condition-2', data: { label: 'HHTTP?', conditionIndex: 2 } },
  ],
};
