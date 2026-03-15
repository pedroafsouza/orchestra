export type { ProjectTemplate, TemplateDatasource, TemplateNode, TemplateEdge } from './types';
export { TODO_LIST_TEMPLATE } from './todo-list';
export { BNB_TEMPLATE } from './bnb';
export { cloneTemplate } from './clone';

import { TODO_LIST_TEMPLATE } from './todo-list';
import { BNB_TEMPLATE } from './bnb';
import type { ProjectTemplate } from './types';

export const TEMPLATES: ProjectTemplate[] = [TODO_LIST_TEMPLATE, BNB_TEMPLATE];
