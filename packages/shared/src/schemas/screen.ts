import { z } from 'zod';

// ─── Style Schema ────────────────────────────────────────────────────────────

export const SpacingSchema = z.object({
  top: z.number().optional(),
  right: z.number().optional(),
  bottom: z.number().optional(),
  left: z.number().optional(),
});
export type Spacing = z.infer<typeof SpacingSchema>;

export const BorderSchema = z.object({
  width: z.number().optional(),
  color: z.string().optional(),
  radius: z.number().optional(),
});
export type Border = z.infer<typeof BorderSchema>;

export const ShadowSchema = z.object({
  color: z.string().optional(),
  offsetX: z.number().optional(),
  offsetY: z.number().optional(),
  blur: z.number().optional(),
});
export type Shadow = z.infer<typeof ShadowSchema>;

export const ComponentStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontSize: z.number().optional(),
  fontWeight: z.enum(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  padding: SpacingSchema.optional(),
  margin: SpacingSchema.optional(),
  border: BorderSchema.optional(),
  shadow: ShadowSchema.optional(),
  opacity: z.number().min(0).max(1).optional(),
  width: z.union([z.number(), z.string()]).optional(), // number (px) or "100%" etc
  height: z.union([z.number(), z.string()]).optional(),
  minHeight: z.union([z.number(), z.string()]).optional(),
  alignSelf: z.enum(['auto', 'flex-start', 'flex-end', 'center', 'stretch']).optional(),
});
export type ComponentStyle = z.infer<typeof ComponentStyleSchema>;

// Breakpoint-aware styles
export const Breakpoint = z.enum(['phone', 'tablet', 'desktop']);
export type Breakpoint = z.infer<typeof Breakpoint>;

export const ResponsiveStyleSchema = z.object({
  base: ComponentStyleSchema.optional(),
  phone: ComponentStyleSchema.optional(),
  tablet: ComponentStyleSchema.optional(),
  desktop: ComponentStyleSchema.optional(),
});
export type ResponsiveStyle = z.infer<typeof ResponsiveStyleSchema>;

// ─── Screen Component Types ──────────────────────────────────────────────────

export const ScreenComponentType = z.enum([
  'text',
  'button',
  'image',
  'combobox',
  'gallery',
  'container',
  'horizontal_scroll',
  'carousel',
  'hero',
  'spacer',
  'divider',
  'input',
  'video',
  'icon',
  'card',
  'avatar',
  'badge',
  'list',
]);
export type ScreenComponentType = z.infer<typeof ScreenComponentType>;

// ─── Datasource Binding ──────────────────────────────────────────────────────

export const DatasourceBindingSchema = z.object({
  datasourceId: z.string(),
  fieldMappings: z.record(z.string(), z.string()), // componentPropKey -> datasource field key
});
export type DatasourceBinding = z.infer<typeof DatasourceBindingSchema>;

// ─── Screen Component ────────────────────────────────────────────────────────

export interface ScreenComponent {
  id: string;
  type: ScreenComponentType;
  props: Record<string, any>;
  style?: ResponsiveStyle;
  children?: ScreenComponent[];
  datasource?: DatasourceBinding;
  actions?: any[];
  hidden?: boolean;
}

export const ScreenComponentSchema: z.ZodType<ScreenComponent> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: ScreenComponentType,
    props: z.record(z.string(), z.any()),
    style: ResponsiveStyleSchema.optional(),
    children: z.array(ScreenComponentSchema).optional(),
    datasource: DatasourceBindingSchema.optional(),
    actions: z.array(z.any()).optional(), // OrchestraAction references
    hidden: z.boolean().optional(),
  })
);

// ─── Datasource Field Definition ─────────────────────────────────────────────

export const DatasourceFieldType = z.enum([
  'text',
  'number',
  'image_url',
  'boolean',
  'date',
  'rich_text',
  'url',
]);
export type DatasourceFieldType = z.infer<typeof DatasourceFieldType>;

export const DatasourceFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: DatasourceFieldType,
  required: z.boolean().optional(),
});
export type DatasourceField = z.infer<typeof DatasourceFieldSchema>;

// ─── Default Props per Component Type ────────────────────────────────────────
// Used by the admin palette to create new components with sensible defaults

export const COMPONENT_DEFAULTS: Record<ScreenComponentType, { props: Record<string, any>; label: string; icon: string }> = {
  text: { props: { content: 'Text block' }, label: 'Text', icon: '\u{1F524}' },
  button: { props: { label: 'Button', variant: 'primary' }, label: 'Button', icon: '\u{1F518}' },
  image: { props: { src: '', alt: 'Image' }, label: 'Image', icon: '\u{1F5BC}' },
  combobox: { props: { label: 'Select', options: [], placeholder: 'Choose...' }, label: 'Combo Box', icon: '\u{1F503}' },
  gallery: { props: { columns: 2 }, label: 'Gallery', icon: '\u{1F4F7}' },
  container: { props: { direction: 'vertical', gap: 8 }, label: 'Container', icon: '\u{1F4E6}' },
  horizontal_scroll: { props: { gap: 12 }, label: 'H-Scroll', icon: '\u{2194}' },
  carousel: { props: { autoPlay: false, interval: 3000 }, label: 'Carousel', icon: '\u{1F3A0}' },
  hero: { props: { backgroundImage: '', overlay: true }, label: 'Hero / Panoramic', icon: '\u{1F304}' },
  spacer: { props: { height: 16 }, label: 'Spacer', icon: '\u{2195}' },
  divider: { props: { color: '#334155', thickness: 1 }, label: 'Divider', icon: '\u{2796}' },
  input: { props: { placeholder: 'Enter text...', type: 'text' }, label: 'Input', icon: '\u{270F}' },
  video: { props: { src: '', autoPlay: false }, label: 'Video', icon: '\u{1F3AC}' },
  icon: { props: { name: 'star', size: 24, color: '#ffffff' }, label: 'Icon', icon: '\u{2B50}' },
  card: { props: { elevation: 2 }, label: 'Card', icon: '\u{1F4C4}' },
  avatar: { props: { src: '', size: 48 }, label: 'Avatar', icon: '\u{1F464}' },
  badge: { props: { text: 'New', color: '#6366f1' }, label: 'Badge', icon: '\u{1F3F7}' },
  list: { props: { direction: 'vertical', gap: 8 }, label: 'List', icon: '\u{1F4CB}' },
};

// ─── Screen Definition (per node) ────────────────────────────────────────────

export const ScreenDefinitionSchema = z.object({
  rootComponents: z.array(ScreenComponentSchema),
  backgroundColor: z.string().optional(),
  scrollable: z.boolean().optional(),
});
export type ScreenDefinition = z.infer<typeof ScreenDefinitionSchema>;
