export type { ProjectTemplate, TemplateDatasource, TemplateNode, TemplateEdge } from './types';
export { TODO_LIST_TEMPLATE } from './todo-list';
export { BNB_TEMPLATE } from './bnb';
export { EVENT_DISTANCE_TEMPLATE } from './event-distance';
export { RESTAURANT_TEMPLATE } from './restaurant';
export { QUIZ_TEMPLATE } from './quiz';
export { cloneTemplate } from './clone';
export { ProjectTemplateSchema } from './schema';

import { TODO_LIST_TEMPLATE } from './todo-list';
import { BNB_TEMPLATE } from './bnb';
import { EVENT_DISTANCE_TEMPLATE } from './event-distance';
import { RESTAURANT_TEMPLATE } from './restaurant';
import { QUIZ_TEMPLATE } from './quiz';
import type { ProjectTemplate } from './types';

export const TEMPLATES: ProjectTemplate[] = [TODO_LIST_TEMPLATE, BNB_TEMPLATE, EVENT_DISTANCE_TEMPLATE, RESTAURANT_TEMPLATE, QUIZ_TEMPLATE];
