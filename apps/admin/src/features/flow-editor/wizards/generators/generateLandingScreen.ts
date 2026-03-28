import type { ScreenDefinition, ScreenComponent } from '@orchestra/shared';

export type LandingTemplate = 'hero-parallax' | 'split' | 'card-grid' | 'minimal';

export interface LandingConfig {
  template: LandingTemplate;
  title: string;
  subtitle: string;
  backgroundColor: string;
  backgroundImage?: string;
  logoUrl?: string;
  buttons: { label: string; navigateTo?: string }[];
  cards?: { icon: string; title: string; description: string }[];
}

let idCounter = 0;
function nextId(): string {
  return `wiz_landing_${++idCounter}`;
}

function resetIds(): void {
  idCounter = 0;
}

function makeText(content: string, fontSize: number, opts?: { fontWeight?: string; textColor?: string; textAlign?: string; padding?: Record<string, number> }): ScreenComponent {
  return {
    id: nextId(),
    type: 'text',
    props: { content },
    style: {
      base: {
        fontSize,
        fontWeight: opts?.fontWeight as any,
        textColor: opts?.textColor || '#f8fafc',
        textAlign: opts?.textAlign as any,
        padding: opts?.padding,
      },
    },
  };
}

function makeButton(label: string, navigateTo: string): ScreenComponent {
  return {
    id: nextId(),
    type: 'button',
    props: { label, variant: 'primary', navigateTo },
    style: {
      base: {
        backgroundColor: '#6366f1',
        border: { radius: 12 },
      },
    },
  };
}

function makeButtonsContainer(buttons: { label: string; navigateTo?: string }[]): ScreenComponent[] {
  if (buttons.length === 0) return [];
  if (buttons.length === 1) {
    return [makeButton(buttons[0].label, buttons[0].navigateTo || '')];
  }
  return [{
    id: nextId(),
    type: 'container',
    props: { direction: 'vertical', gap: 10 },
    children: buttons.map((b) => makeButton(b.label, b.navigateTo || '')),
  }];
}

function generateHeroParallax(config: LandingConfig): ScreenDefinition {
  const buttons = makeButtonsContainer(config.buttons);
  return {
    backgroundColor: '#0f172a',
    scrollable: true,
    rootComponents: [
      {
        id: nextId(),
        type: 'hero',
        props: {
          backgroundImage: config.backgroundImage || '',
          overlay: true,
        },
        style: {
          base: {
            width: '100%',
            height: 360,
          },
        },
        children: [
          {
            id: nextId(),
            type: 'container',
            props: { direction: 'vertical', gap: 8 },
            style: {
              base: {
                padding: { top: 80, right: 24, bottom: 24, left: 24 },
              },
            },
            children: [
              makeText(config.title, 32, { fontWeight: 'bold' }),
              makeText(config.subtitle, 14, { textColor: '#94a3b8' }),
            ],
          },
        ],
      },
      {
        id: nextId(),
        type: 'spacer',
        props: { height: 24 },
      },
      ...buttons.map((b) => ({
        ...b,
        style: {
          ...b.style,
          base: {
            ...(b.style?.base || {}),
            margin: { top: 0, right: 24, bottom: 24, left: 24 },
          },
        },
      })),
    ],
  };
}

function generateSplitLayout(config: LandingConfig): ScreenDefinition {
  return {
    backgroundColor: config.backgroundColor || '#1e293b',
    scrollable: true,
    rootComponents: [
      {
        id: nextId(),
        type: 'image',
        props: { src: config.backgroundImage || '', alt: 'hero' },
        style: {
          base: {
            width: '100%',
            height: 240,
          },
        },
      },
      {
        id: nextId(),
        type: 'container',
        props: { direction: 'vertical', gap: 12 },
        style: {
          base: {
            padding: { top: 24, right: 24, bottom: 24, left: 24 },
          },
        },
        children: [
          makeText(config.title, 26, { fontWeight: 'bold' }),
          makeText(config.subtitle, 14, { textColor: '#94a3b8' }),
          {
            id: nextId(),
            type: 'spacer',
            props: { height: 16 },
          },
          ...makeButtonsContainer(config.buttons),
        ],
      },
    ],
  };
}

function generateCardGrid(config: LandingConfig): ScreenDefinition {
  const cards = config.cards || [
    { icon: 'zap', title: 'Fast', description: 'Lightning-fast performance' },
    { icon: 'shield', title: 'Secure', description: 'Enterprise-grade security' },
    { icon: 'globe', title: 'Global', description: 'Available worldwide' },
    { icon: 'heart', title: 'Loved', description: 'Trusted by millions' },
  ];

  function makeCard(card: { icon: string; title: string; description: string }): ScreenComponent {
    return {
      id: nextId(),
      type: 'card',
      props: { elevation: 1 },
      style: {
        base: {
          backgroundColor: '#1e293b',
          border: { radius: 12 },
          padding: { top: 16, right: 16, bottom: 16, left: 16 },
          width: '48%',
        },
      },
      children: [
        {
          id: nextId(),
          type: 'icon',
          props: { name: card.icon, size: 28, color: '#6366f1' },
        },
        makeText(card.title, 14, { fontWeight: '600' }),
        makeText(card.description, 11, { textColor: '#94a3b8' }),
      ],
    };
  }

  // Build rows of 2
  const rows: ScreenComponent[] = [];
  for (let i = 0; i < cards.length; i += 2) {
    const rowChildren: ScreenComponent[] = [makeCard(cards[i])];
    if (i + 1 < cards.length) {
      rowChildren.push(makeCard(cards[i + 1]));
    }
    rows.push({
      id: nextId(),
      type: 'container',
      props: { direction: 'horizontal', gap: 12 },
      children: rowChildren,
    });
  }

  return {
    backgroundColor: config.backgroundColor || '#0f172a',
    scrollable: true,
    rootComponents: [
      makeText(config.title, 24, {
        fontWeight: 'bold',
        padding: { top: 24, right: 16, bottom: 4, left: 16 },
      }),
      makeText(config.subtitle, 13, {
        textColor: '#94a3b8',
        padding: { top: 0, right: 16, bottom: 16, left: 16 },
      }),
      {
        id: nextId(),
        type: 'container',
        props: { direction: 'vertical', gap: 12 },
        style: {
          base: { padding: { top: 0, right: 16, bottom: 16, left: 16 } },
        },
        children: rows,
      },
      {
        id: nextId(),
        type: 'button',
        props: {
          label: config.buttons[0]?.label || 'Get Started',
          variant: 'primary',
          navigateTo: config.buttons[0]?.navigateTo || '',
        },
        style: {
          base: {
            margin: { top: 8, right: 16, bottom: 24, left: 16 },
            backgroundColor: '#6366f1',
            border: { radius: 12 },
          },
        },
      },
    ],
  };
}

function generateMinimalLogo(config: LandingConfig): ScreenDefinition {
  return {
    backgroundColor: config.backgroundColor || '#0f172a',
    scrollable: false,
    rootComponents: [
      {
        id: nextId(),
        type: 'container',
        props: { direction: 'vertical', gap: 16 },
        style: {
          base: {
            padding: { top: 120, right: 40, bottom: 40, left: 40 },
          },
        },
        children: [
          {
            id: nextId(),
            type: 'image',
            props: { src: config.logoUrl || '', alt: 'logo' },
            style: {
              base: { width: 80, height: 80, alignSelf: 'center', border: { radius: 16 } },
            },
          },
          makeText(config.title, 28, { fontWeight: 'bold', textAlign: 'center' }),
          makeText(config.subtitle, 14, { textColor: '#94a3b8', textAlign: 'center' }),
          {
            id: nextId(),
            type: 'spacer',
            props: { height: 32 },
          },
          ...makeButtonsContainer(config.buttons),
        ],
      },
    ],
  };
}

export function generateLandingScreen(config: LandingConfig): ScreenDefinition {
  resetIds();

  switch (config.template) {
    case 'hero-parallax':
      return generateHeroParallax(config);
    case 'split':
      return generateSplitLayout(config);
    case 'card-grid':
      return generateCardGrid(config);
    case 'minimal':
      return generateMinimalLogo(config);
    default:
      return generateHeroParallax(config);
  }
}

const TEMPLATE_LABELS: Record<LandingTemplate, string> = {
  'hero-parallax': 'Hero Landing',
  'split': 'Split Landing',
  'card-grid': 'Card Grid',
  'minimal': 'Welcome',
};

export function getLandingLabel(template: LandingTemplate): string {
  return TEMPLATE_LABELS[template] || 'Landing';
}
