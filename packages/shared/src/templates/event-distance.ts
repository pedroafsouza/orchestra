import type { ProjectTemplate } from './types';

export const EVENT_DISTANCE_TEMPLATE: ProjectTemplate = {
  id: 'event-distance',
  name: 'Event Distance',
  description:
    'A map-based event discovery app with event list, interactive map, and event detail screens.',
  icon: '\u{1F4CD}',
  datasources: [
    {
      id: 'ds_events',
      name: 'Events',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'imageUrl', label: 'Image', type: 'image_url' },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'location', label: 'Location', type: 'geolocation', required: true },
        { key: 'address', label: 'Address', type: 'text' },
        { key: 'price', label: 'Price', type: 'number' },
      ],
      sampleEntries: [
        {
          name: 'Lollapalooza Brasil',
          description:
            'One of the biggest music festivals in South America, featuring international and local artists across multiple stages.',
          imageUrl:
            'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
          date: '2026-03-28',
          category: 'Music',
          location: { latitude: -23.7013, longitude: -46.6968 },
          address: 'Autódromo de Interlagos, São Paulo',
          price: 450,
        },
        {
          name: 'São Paulo Tech Week',
          description:
            'A week-long technology conference with talks on AI, startups, and innovation from leading industry speakers.',
          imageUrl:
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
          date: '2026-04-15',
          category: 'Tech',
          location: { latitude: -23.5874, longitude: -46.6576 },
          address: 'Pavilhão da Bienal, Parque Ibirapuera',
          price: 120,
        },
        {
          name: 'Exposição Imersiva',
          description:
            'An immersive art exhibition combining projection mapping, sound design, and interactive installations.',
          imageUrl:
            'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=400&fit=crop',
          date: '2026-05-01',
          category: 'Art',
          location: { latitude: -23.5467, longitude: -46.6345 },
          address: 'Farol Santander, Centro, São Paulo',
          price: 60,
        },
        {
          name: 'Corrida de São Silvestre',
          description:
            'The legendary New Year\'s Eve road race through the streets of São Paulo, attracting thousands of runners.',
          imageUrl:
            'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=600&h=400&fit=crop',
          date: '2026-12-31',
          category: 'Sports',
          location: { latitude: -23.5632, longitude: -46.6542 },
          address: 'Av. Paulista, São Paulo',
          price: 85,
        },
        {
          name: 'Festival de Jazz',
          description:
            'An open-air jazz festival in the heart of Ibirapuera Park featuring Brazilian and international jazz artists.',
          imageUrl:
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=400&fit=crop',
          date: '2026-06-20',
          category: 'Music',
          location: { latitude: -23.5874, longitude: -46.6576 },
          address: 'Parque Ibirapuera, São Paulo',
          price: 0,
        },
      ],
    },
  ],
  nodes: [
    /* ── Node 1: Event List (landing) ── */
    {
      id: 'node_event_list',
      label: 'Event List',
      type: 'landing',
      position: { x: 80, y: 60 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_ev_1',
            type: 'text',
            props: { content: 'Events Near You' },
            style: {
              base: {
                fontSize: 26,
                fontWeight: 'bold',
                textColor: '#f8fafc',
                padding: { top: 20, right: 16, bottom: 4, left: 16 },
              },
            },
          },
          {
            id: 'sc_ev_2',
            type: 'text',
            props: { content: 'Discover what\'s happening in São Paulo' },
            style: {
              base: {
                fontSize: 13,
                textColor: '#94a3b8',
                padding: { top: 0, right: 16, bottom: 12, left: 16 },
              },
            },
          },
          {
            id: 'sc_ev_3',
            type: 'horizontal_scroll',
            props: { gap: 8 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 8, left: 16 },
              },
            },
            children: [
              { id: 'sc_ev_4', type: 'chip', props: { label: 'Music', variant: 'outline' } },
              { id: 'sc_ev_5', type: 'chip', props: { label: 'Sports', variant: 'outline' } },
              { id: 'sc_ev_6', type: 'chip', props: { label: 'Tech', variant: 'outline' } },
              { id: 'sc_ev_7', type: 'chip', props: { label: 'Art', variant: 'outline' } },
            ],
          },
          {
            id: 'sc_ev_8',
            type: 'list',
            props: { direction: 'vertical', gap: 12 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
            datasource: {
              datasourceId: 'ds_events',
              fieldMappings: {},
            },
            children: [
              {
                id: 'sc_ev_9',
                type: 'card',
                props: { elevation: 2 },
                style: {
                  base: {
                    backgroundColor: '#1e293b',
                    border: { radius: 16 },
                  },
                },
                children: [
                  {
                    id: 'sc_ev_10',
                    type: 'image',
                    props: { src: '{{imageUrl}}', alt: 'event' },
                    style: {
                      base: {
                        width: '100%',
                        height: 140,
                        border: { radius: 12 },
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_events',
                      fieldMappings: { src: 'imageUrl' },
                    },
                  },
                  {
                    id: 'sc_ev_11',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 8 },
                    style: {
                      base: {
                        padding: { top: 10, right: 12, bottom: 2, left: 12 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_ev_12',
                        type: 'badge',
                        props: { text: '{{date}}', color: '#6366f1' },
                        datasource: {
                          datasourceId: 'ds_events',
                          fieldMappings: { text: 'date' },
                        },
                      },
                      {
                        id: 'sc_ev_13',
                        type: 'chip',
                        props: { label: '{{category}}', variant: 'outline' },
                        datasource: {
                          datasourceId: 'ds_events',
                          fieldMappings: { label: 'category' },
                        },
                      },
                    ],
                  },
                  {
                    id: 'sc_ev_14',
                    type: 'text',
                    props: { content: '{{name}}' },
                    style: {
                      base: {
                        fontSize: 16,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                        padding: { top: 4, right: 12, bottom: 2, left: 12 },
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_events',
                      fieldMappings: { content: 'name' },
                    },
                  },
                  {
                    id: 'sc_ev_15',
                    type: 'text',
                    props: { content: '{{address}}' },
                    style: {
                      base: {
                        fontSize: 12,
                        textColor: '#94a3b8',
                        padding: { top: 0, right: 12, bottom: 8, left: 12 },
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_events',
                      fieldMappings: { content: 'address' },
                    },
                  },
                  {
                    id: 'sc_ev_16',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 6 },
                    style: {
                      base: {
                        padding: { top: 0, right: 12, bottom: 10, left: 12 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_ev_17',
                        type: 'price_tag',
                        props: { amount: 0, currency: 'R$', period: '' },
                        datasource: {
                          datasourceId: 'ds_events',
                          fieldMappings: { amount: 'price' },
                        },
                      },
                      {
                        id: 'sc_ev_18',
                        type: 'spacer',
                        props: { height: 1 },
                      },
                      {
                        id: 'sc_ev_19',
                        type: 'button',
                        props: {
                          label: 'Details',
                          variant: 'primary',
                          navigateTo: 'node_detail',
                        },
                        style: {
                          base: {
                            fontSize: 12,
                            padding: { top: 6, right: 16, bottom: 6, left: 16 },
                            backgroundColor: '#6366f1',
                            border: { radius: 8 },
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'sc_ev_20',
            type: 'button',
            props: {
              label: 'View on Map',
              variant: 'primary',
              navigateTo: 'node_map',
            },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 20, left: 16 },
                backgroundColor: '#6366f1',
              },
            },
          },
        ],
      },
    },

    /* ── Node 2: Event Map (landing) ── */
    {
      id: 'node_map',
      label: 'Event Map',
      type: 'landing',
      position: { x: 340, y: 60 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_ev_21',
            type: 'text',
            props: { content: 'Event Map' },
            style: {
              base: {
                fontSize: 22,
                fontWeight: 'bold',
                textColor: '#f8fafc',
                padding: { top: 20, right: 16, bottom: 12, left: 16 },
              },
            },
          },
          {
            id: 'sc_ev_22',
            type: 'map_view',
            props: {
              lat: -23.5874,
              lng: -46.6576,
              zoom: 12,
              height: 400,
              markers: [],
            },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 12, left: 16 },
                border: { radius: 16 },
              },
            },
            datasource: {
              datasourceId: 'ds_events',
              fieldMappings: {
                markerPosition: 'location',
                markerTitle: 'name',
              },
            },
          },
          {
            id: 'sc_ev_23',
            type: 'button',
            props: {
              label: 'Back to List',
              variant: 'secondary',
              navigateTo: 'node_event_list',
            },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 20, left: 16 },
                backgroundColor: '#334155',
              },
            },
          },
        ],
      },
    },

    /* ── Node 3: Event Detail (list) ── */
    {
      id: 'node_detail',
      label: 'Event Detail',
      type: 'list',
      position: { x: 210, y: 240 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_ev_30',
            type: 'image',
            props: { src: '', alt: 'event detail' },
            style: {
              base: {
                width: '100%',
                height: 220,
              },
            },
          },
          {
            id: 'sc_ev_31',
            type: 'container',
            props: { direction: 'vertical', gap: 4 },
            style: {
              base: {
                padding: { top: 16, right: 16, bottom: 0, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_ev_32',
                type: 'container',
                props: { direction: 'horizontal', gap: 8 },
                children: [
                  {
                    id: 'sc_ev_33',
                    type: 'badge',
                    props: { text: '{{date}}', color: '#6366f1' },
                  },
                  {
                    id: 'sc_ev_34',
                    type: 'chip',
                    props: { label: '{{category}}', variant: 'outline' },
                  },
                ],
              },
              {
                id: 'sc_ev_35',
                type: 'text',
                props: { content: '{{name}}' },
                style: {
                  base: {
                    fontSize: 22,
                    fontWeight: 'bold',
                    textColor: '#f8fafc',
                    padding: { top: 4, right: 0, bottom: 0, left: 0 },
                  },
                },
              },
              {
                id: 'sc_ev_36',
                type: 'text',
                props: { content: '{{description}}' },
                style: {
                  base: {
                    fontSize: 13,
                    textColor: '#94a3b8',
                    padding: { top: 4, right: 0, bottom: 8, left: 0 },
                  },
                },
              },
            ],
          },
          {
            id: 'sc_ev_37',
            type: 'divider',
            props: { color: '#1e293b', thickness: 1 },
          },
          {
            id: 'sc_ev_38',
            type: 'container',
            props: { direction: 'horizontal', gap: 16 },
            style: {
              base: {
                padding: { top: 12, right: 16, bottom: 12, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_ev_39',
                type: 'container',
                props: { direction: 'vertical', gap: 2 },
                children: [
                  {
                    id: 'sc_ev_40',
                    type: 'text',
                    props: { content: 'Address' },
                    style: { base: { fontSize: 11, textColor: '#64748b' } },
                  },
                  {
                    id: 'sc_ev_41',
                    type: 'text',
                    props: { content: '{{address}}' },
                    style: { base: { fontSize: 13, textColor: '#e2e8f0' } },
                  },
                ],
              },
              {
                id: 'sc_ev_42',
                type: 'container',
                props: { direction: 'vertical', gap: 2 },
                children: [
                  {
                    id: 'sc_ev_43',
                    type: 'text',
                    props: { content: 'Price' },
                    style: { base: { fontSize: 11, textColor: '#64748b' } },
                  },
                  {
                    id: 'sc_ev_44',
                    type: 'price_tag',
                    props: { amount: 0, currency: 'R$', period: '' },
                  },
                ],
              },
            ],
          },
          {
            id: 'sc_ev_45',
            type: 'divider',
            props: { color: '#1e293b', thickness: 1 },
          },
          {
            id: 'sc_ev_46',
            type: 'map_view',
            props: { height: 140 },
            style: {
              base: {
                margin: { top: 12, right: 16, bottom: 12, left: 16 },
                border: { radius: 12 },
              },
            },
          },
          {
            id: 'sc_ev_47',
            type: 'button',
            props: {
              label: 'Back',
              variant: 'secondary',
              navigateTo: 'node_event_list',
            },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 20, left: 16 },
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
      id: 'edge_list_map',
      source: 'node_event_list',
      target: 'node_map',
      sourceHandle: 'right',
      targetHandle: 'target-left',
    },
    {
      id: 'edge_map_list',
      source: 'node_map',
      target: 'node_event_list',
      sourceHandle: 'left',
      targetHandle: 'target-right',
    },
    {
      id: 'edge_list_detail',
      source: 'node_event_list',
      target: 'node_detail',
      sourceHandle: 'bottom',
    },
    {
      id: 'edge_map_detail',
      source: 'node_map',
      target: 'node_detail',
      sourceHandle: 'bottom',
      targetHandle: 'target-right',
    },
  ],
};
