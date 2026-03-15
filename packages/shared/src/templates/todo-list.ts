import type { ProjectTemplate } from './types';

export const TODO_LIST_TEMPLATE: ProjectTemplate = {
  id: 'todo-list',
  name: 'TODO List',
  description: 'A simple task manager with a list view and an add-task form.',
  icon: '\u2705',
  datasources: [
    {
      id: 'ds_tasks',
      name: 'Tasks',
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'done', label: 'Done', type: 'boolean' },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ],
      sampleEntries: [
        { title: 'Buy groceries', done: false, createdAt: '2026-03-15' },
        { title: 'Read documentation', done: true, createdAt: '2026-03-14' },
        { title: 'Deploy v1', done: false, createdAt: '2026-03-13' },
      ],
    },
  ],
  nodes: [
    {
      id: 'node_task_list',
      label: 'Task List',
      type: 'landing',
      position: { x: 100, y: 100 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_heading',
            type: 'text',
            props: { content: 'My Tasks' },
            style: {
              base: {
                fontSize: 22,
                fontWeight: 'bold',
                textColor: '#f8fafc',
                padding: { top: 16, right: 16, bottom: 8, left: 16 },
              },
            },
          },
          {
            id: 'sc_add_btn',
            type: 'button',
            props: { label: '+ Add Task', variant: 'primary', navigateTo: 'node_add_task' },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 12, left: 16 },
              },
            },
          },
          {
            id: 'sc_task_list',
            type: 'list',
            props: { direction: 'vertical', gap: 8 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
            datasource: {
              datasourceId: 'ds_tasks',
              fieldMappings: {},
            },
            children: [
              {
                id: 'sc_task_card',
                type: 'card',
                props: { elevation: 1 },
                style: {
                  base: {
                    backgroundColor: '#1e293b',
                    padding: { top: 12, right: 12, bottom: 12, left: 12 },
                    border: { radius: 10 },
                  },
                },
                children: [
                  {
                    id: 'sc_task_row',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 10 },
                    children: [
                      {
                        id: 'sc_task_check',
                        type: 'checkbox',
                        props: { label: '', checked: false },
                        datasource: {
                          datasourceId: 'ds_tasks',
                          fieldMappings: { checked: 'done' },
                        },
                        actions: [
                          {
                            trigger: 'onValueChange',
                            type: 'DATASOURCE_UPDATE',
                            payload: { datasourceId: 'ds_tasks', field: 'done' },
                          },
                        ],
                      },
                      {
                        id: 'sc_task_title',
                        type: 'text',
                        props: { content: '{{title}}' },
                        style: {
                          base: {
                            fontSize: 14,
                            textColor: '#f8fafc',
                          },
                        },
                        datasource: {
                          datasourceId: 'ds_tasks',
                          fieldMappings: { content: 'title' },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'node_add_task',
      label: 'Add Task',
      type: 'form',
      position: { x: 500, y: 100 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_form_heading',
            type: 'text',
            props: { content: 'New Task' },
            style: {
              base: {
                fontSize: 22,
                fontWeight: 'bold',
                textColor: '#f8fafc',
                padding: { top: 16, right: 16, bottom: 8, left: 16 },
              },
            },
          },
          {
            id: 'sc_title_input',
            type: 'input',
            props: { placeholder: 'Task title...', type: 'text' },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 12, left: 16 },
              },
            },
          },
          {
            id: 'sc_save_btn',
            type: 'button',
            props: { label: 'Save Task', variant: 'primary', navigateTo: '' },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 8, left: 16 },
              },
            },
            actions: [
              {
                trigger: 'onPress',
                type: 'DATASOURCE_ADD',
                payload: {
                  datasourceId: 'ds_tasks',
                  fieldMap: { title: 'sc_title_input' },
                },
              },
            ],
          },
          {
            id: 'sc_back_btn',
            type: 'button',
            props: { label: 'Back', variant: 'secondary', navigateTo: 'node_task_list' },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 16, left: 16 },
                backgroundColor: '#334155',
              },
            },
          },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'edge_list_to_add',
      source: 'node_task_list',
      target: 'node_add_task',
    },
  ],
};
