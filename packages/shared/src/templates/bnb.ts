import type { ProjectTemplate } from './types';

export const BNB_TEMPLATE: ProjectTemplate = {
  id: 'bnb',
  name: 'BnB Rentals',
  description:
    'An Airbnb-style property listing app with browse, detail, and booking screens.',
  icon: '\u{1F3E0}',
  datasources: [
    {
      id: 'ds_properties',
      name: 'Properties',
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'imageUrl', label: 'Image URL', type: 'image_url' },
        { key: 'pricePerNight', label: 'Price Per Night', type: 'number' },
        { key: 'rating', label: 'Rating', type: 'number' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'guests', label: 'Guests', type: 'number' },
        { key: 'bedrooms', label: 'Bedrooms', type: 'number' },
      ],
      sampleEntries: [
        {
          title: 'Cozy Mountain Cabin',
          description:
            'A rustic retreat surrounded by pine forests with stunning mountain views.',
          imageUrl:
            'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop',
          pricePerNight: 120,
          rating: 4.8,
          location: 'Aspen, Colorado',
          guests: 4,
          bedrooms: 2,
        },
        {
          title: 'Beachfront Villa',
          description:
            'Wake up to ocean waves in this modern villa with private pool and garden.',
          imageUrl:
            'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop',
          pricePerNight: 250,
          rating: 4.9,
          location: 'Malibu, California',
          guests: 8,
          bedrooms: 4,
        },
        {
          title: 'Downtown Loft',
          description:
            'Stylish industrial loft in the heart of the city, walking distance to everything.',
          imageUrl:
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
          pricePerNight: 89,
          rating: 4.6,
          location: 'New York, NY',
          guests: 2,
          bedrooms: 1,
        },
        {
          title: 'Lakeside Cottage',
          description:
            'Peaceful waterfront cottage with private dock and kayaks included.',
          imageUrl:
            'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&h=400&fit=crop',
          pricePerNight: 175,
          rating: 4.7,
          location: 'Lake Tahoe, CA',
          guests: 6,
          bedrooms: 3,
        },
        {
          title: 'Tropical Bungalow',
          description:
            'Open-air bungalow nestled in lush tropical gardens with hammock and patio.',
          imageUrl:
            'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop',
          pricePerNight: 95,
          rating: 4.5,
          location: 'Tulum, Mexico',
          guests: 2,
          bedrooms: 1,
        },
      ],
    },
    {
      id: 'ds_bookings',
      name: 'Bookings',
      fields: [
        {
          key: 'propertyTitle',
          label: 'Property Title',
          type: 'text',
          required: true,
        },
        { key: 'checkIn', label: 'Check-in', type: 'date' },
        { key: 'checkOut', label: 'Check-out', type: 'date' },
        { key: 'guests', label: 'Guests', type: 'number' },
        { key: 'totalPrice', label: 'Total Price', type: 'number' },
      ],
      sampleEntries: [
        {
          propertyTitle: 'Cozy Mountain Cabin',
          checkIn: '2026-04-10',
          checkOut: '2026-04-15',
          guests: 2,
          totalPrice: 600,
        },
        {
          propertyTitle: 'Beachfront Villa',
          checkIn: '2026-05-01',
          checkOut: '2026-05-05',
          guests: 4,
          totalPrice: 1000,
        },
      ],
    },
  ],
  nodes: [
    /* ── Node 1: Browse (landing) ── */
    {
      id: 'node_browse',
      label: 'Browse',
      type: 'landing',
      position: { x: 100, y: 100 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_bnb_1',
            type: 'text',
            props: { content: 'Explore' },
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
            id: 'sc_bnb_2',
            type: 'text',
            props: { content: 'Find your next adventure' },
            style: {
              base: {
                fontSize: 13,
                textColor: '#94a3b8',
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
          },
          {
            id: 'sc_bnb_3',
            type: 'input',
            props: { placeholder: 'Search destinations...', type: 'text' },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 12, left: 16 },
              },
            },
          },
          {
            id: 'sc_bnb_4',
            type: 'horizontal_scroll',
            props: { gap: 8 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 4, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_bnb_5',
                type: 'chip',
                props: { label: 'Beach', variant: 'outline' },
              },
              {
                id: 'sc_bnb_6',
                type: 'chip',
                props: { label: 'Mountain', variant: 'outline' },
              },
              {
                id: 'sc_bnb_7',
                type: 'chip',
                props: { label: 'City', variant: 'outline' },
              },
              {
                id: 'sc_bnb_8',
                type: 'chip',
                props: { label: 'Lake', variant: 'outline' },
              },
              {
                id: 'sc_bnb_9',
                type: 'chip',
                props: { label: 'Tropical', variant: 'outline' },
              },
            ],
          },
          {
            id: 'sc_bnb_10',
            type: 'list',
            props: { direction: 'vertical', gap: 12 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
            datasource: {
              datasourceId: 'ds_properties',
              fieldMappings: {},
            },
            children: [
              {
                id: 'sc_bnb_11',
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
                    id: 'sc_bnb_12',
                    type: 'image',
                    props: { src: '{{imageUrl}}', alt: 'property' },
                    style: {
                      base: {
                        width: '100%',
                        height: 160,
                        border: { radius: 12 },
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_properties',
                      fieldMappings: { src: 'imageUrl' },
                    },
                  },
                  {
                    id: 'sc_bnb_13',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 8 },
                    style: {
                      base: {
                        padding: { top: 10, right: 12, bottom: 4, left: 12 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_bnb_14',
                        type: 'text',
                        props: { content: '{{location}}' },
                        style: {
                          base: {
                            fontSize: 11,
                            textColor: '#94a3b8',
                          },
                        },
                        datasource: {
                          datasourceId: 'ds_properties',
                          fieldMappings: { content: 'location' },
                        },
                      },
                      {
                        id: 'sc_bnb_15',
                        type: 'rating_stars',
                        props: { value: 4.5 },
                        datasource: {
                          datasourceId: 'ds_properties',
                          fieldMappings: { value: 'rating' },
                        },
                      },
                    ],
                  },
                  {
                    id: 'sc_bnb_16',
                    type: 'text',
                    props: { content: '{{title}}' },
                    style: {
                      base: {
                        fontSize: 16,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                        padding: { top: 0, right: 12, bottom: 4, left: 12 },
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_properties',
                      fieldMappings: { content: 'title' },
                    },
                  },
                  {
                    id: 'sc_bnb_17',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 6 },
                    style: {
                      base: {
                        padding: { top: 0, right: 12, bottom: 10, left: 12 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_bnb_18',
                        type: 'price_tag',
                        props: { amount: 99, currency: '$', period: '/night' },
                        datasource: {
                          datasourceId: 'ds_properties',
                          fieldMappings: { amount: 'pricePerNight' },
                        },
                      },
                      {
                        id: 'sc_bnb_19',
                        type: 'spacer',
                        props: { height: 1 },
                      },
                      {
                        id: 'sc_bnb_20',
                        type: 'button',
                        props: {
                          label: 'View',
                          variant: 'primary',
                          navigateTo: 'node_detail',
                        },
                        style: {
                          base: {
                            fontSize: 12,
                            padding: {
                              top: 6,
                              right: 16,
                              bottom: 6,
                              left: 16,
                            },
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
        ],
      },
    },

    /* ── Node 2: Property Detail (list) ── */
    {
      id: 'node_detail',
      label: 'Property Detail',
      type: 'list',
      position: { x: 500, y: 100 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_bnb_21',
            type: 'image',
            props: { src: '', alt: 'property detail' },
            style: {
              base: {
                width: '100%',
                height: 220,
              },
            },
          },
          {
            id: 'sc_bnb_22',
            type: 'container',
            props: { direction: 'vertical', gap: 4 },
            style: {
              base: {
                padding: { top: 16, right: 16, bottom: 0, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_bnb_23',
                type: 'container',
                props: { direction: 'horizontal', gap: 8 },
                children: [
                  {
                    id: 'sc_bnb_24',
                    type: 'text',
                    props: { content: '{{location}}' },
                    style: {
                      base: {
                        fontSize: 12,
                        textColor: '#94a3b8',
                      },
                    },
                  },
                  {
                    id: 'sc_bnb_25',
                    type: 'rating_stars',
                    props: { value: 4.5 },
                  },
                ],
              },
              {
                id: 'sc_bnb_26',
                type: 'text',
                props: { content: '{{title}}' },
                style: {
                  base: {
                    fontSize: 22,
                    fontWeight: 'bold',
                    textColor: '#f8fafc',
                  },
                },
              },
              {
                id: 'sc_bnb_27',
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
            id: 'sc_bnb_28',
            type: 'divider',
            props: { color: '#1e293b', thickness: 1 },
          },
          {
            id: 'sc_bnb_29',
            type: 'container',
            props: { direction: 'horizontal', gap: 16 },
            style: {
              base: {
                padding: { top: 12, right: 16, bottom: 12, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_bnb_30',
                type: 'container',
                props: { direction: 'vertical', gap: 2 },
                children: [
                  {
                    id: 'sc_bnb_31',
                    type: 'text',
                    props: { content: 'Guests' },
                    style: {
                      base: {
                        fontSize: 11,
                        textColor: '#64748b',
                      },
                    },
                  },
                  {
                    id: 'sc_bnb_32',
                    type: 'text',
                    props: { content: '4' },
                    style: {
                      base: {
                        fontSize: 16,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                  },
                ],
              },
              {
                id: 'sc_bnb_33',
                type: 'container',
                props: { direction: 'vertical', gap: 2 },
                children: [
                  {
                    id: 'sc_bnb_34',
                    type: 'text',
                    props: { content: 'Bedrooms' },
                    style: {
                      base: {
                        fontSize: 11,
                        textColor: '#64748b',
                      },
                    },
                  },
                  {
                    id: 'sc_bnb_35',
                    type: 'text',
                    props: { content: '2' },
                    style: {
                      base: {
                        fontSize: 16,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                  },
                ],
              },
              {
                id: 'sc_bnb_36',
                type: 'container',
                props: { direction: 'vertical', gap: 2 },
                children: [
                  {
                    id: 'sc_bnb_37',
                    type: 'text',
                    props: { content: 'Price' },
                    style: {
                      base: {
                        fontSize: 11,
                        textColor: '#64748b',
                      },
                    },
                  },
                  {
                    id: 'sc_bnb_38',
                    type: 'price_tag',
                    props: { amount: 120, currency: '$', period: '/night' },
                  },
                ],
              },
            ],
          },
          {
            id: 'sc_bnb_39',
            type: 'divider',
            props: { color: '#1e293b', thickness: 1 },
          },
          {
            id: 'sc_bnb_40',
            type: 'map_view',
            props: { height: 160 },
            style: {
              base: {
                margin: { top: 12, right: 16, bottom: 12, left: 16 },
                border: { radius: 12 },
              },
            },
          },
          {
            id: 'sc_bnb_41',
            type: 'container',
            props: { direction: 'horizontal', gap: 10 },
            style: {
              base: {
                padding: { top: 8, right: 16, bottom: 20, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_bnb_42',
                type: 'button',
                props: {
                  label: 'Book Now',
                  variant: 'primary',
                  navigateTo: 'node_booking',
                },
                style: {
                  base: {
                    backgroundColor: '#6366f1',
                  },
                },
              },
              {
                id: 'sc_bnb_43',
                type: 'button',
                props: {
                  label: 'Back',
                  variant: 'secondary',
                  navigateTo: 'node_browse',
                },
                style: {
                  base: {
                    backgroundColor: '#334155',
                  },
                },
              },
            ],
          },
        ],
      },
    },

    /* ── Node 3: Book Property (form) ── */
    {
      id: 'node_booking',
      label: 'Book',
      type: 'form',
      position: { x: 900, y: 100 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_bnb_44',
            type: 'text',
            props: { content: 'Book your stay' },
            style: {
              base: {
                fontSize: 22,
                fontWeight: 'bold',
                textColor: '#f8fafc',
                padding: { top: 20, right: 16, bottom: 4, left: 16 },
              },
            },
          },
          {
            id: 'sc_bnb_45',
            type: 'text',
            props: { content: 'Fill in the details below' },
            style: {
              base: {
                fontSize: 13,
                textColor: '#94a3b8',
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
          },
          {
            id: 'sc_bnb_46',
            type: 'container',
            props: { direction: 'vertical', gap: 12 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 0, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_bnb_47',
                type: 'text',
                props: { content: 'Check-in' },
                style: {
                  base: {
                    fontSize: 12,
                    textColor: '#94a3b8',
                  },
                },
              },
              {
                id: 'sc_bnb_48',
                type: 'input',
                props: { placeholder: 'YYYY-MM-DD', type: 'text' },
              },
              {
                id: 'sc_bnb_49',
                type: 'text',
                props: { content: 'Check-out' },
                style: {
                  base: {
                    fontSize: 12,
                    textColor: '#94a3b8',
                  },
                },
              },
              {
                id: 'sc_bnb_50',
                type: 'input',
                props: { placeholder: 'YYYY-MM-DD', type: 'text' },
              },
              {
                id: 'sc_bnb_51',
                type: 'text',
                props: { content: 'Guests' },
                style: {
                  base: {
                    fontSize: 12,
                    textColor: '#94a3b8',
                  },
                },
              },
              {
                id: 'sc_bnb_52',
                type: 'input',
                props: { placeholder: 'Number of guests', type: 'text' },
              },
            ],
          },
          {
            id: 'sc_bnb_53',
            type: 'spacer',
            props: {},
            style: {
              base: {
                height: 16,
              },
            },
          },
          {
            id: 'sc_bnb_54',
            type: 'card',
            props: {},
            style: {
              base: {
                backgroundColor: '#1e293b',
                border: { radius: 12 },
                padding: { top: 16, right: 16, bottom: 16, left: 16 },
                margin: { top: 0, right: 16, bottom: 0, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_bnb_55',
                type: 'container',
                props: { direction: 'horizontal', gap: 0 },
                children: [
                  {
                    id: 'sc_bnb_56',
                    type: 'text',
                    props: { content: 'Total' },
                    style: {
                      base: {
                        fontSize: 14,
                        textColor: '#94a3b8',
                      },
                    },
                  },
                  {
                    id: 'sc_bnb_57',
                    type: 'price_tag',
                    props: { amount: 600, currency: '$', period: 'total' },
                  },
                ],
              },
            ],
          },
          {
            id: 'sc_bnb_58',
            type: 'spacer',
            props: {},
            style: {
              base: {
                height: 8,
              },
            },
          },
          {
            id: 'sc_bnb_59',
            type: 'button',
            props: {
              label: 'Confirm Booking',
              variant: 'primary',
              navigateTo: 'node_bookings',
            },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 0, left: 16 },
                backgroundColor: '#6366f1',
              },
            },
            actions: [
              {
                trigger: 'onPress',
                type: 'DATASOURCE_ADD',
                payload: { datasourceId: 'ds_bookings' },
              },
            ],
          },
          {
            id: 'sc_bnb_60',
            type: 'button',
            props: {
              label: 'Cancel',
              variant: 'secondary',
              navigateTo: 'node_detail',
            },
            style: {
              base: {
                margin: { top: 8, right: 16, bottom: 20, left: 16 },
                backgroundColor: '#334155',
              },
            },
          },
        ],
      },
    },

    /* ── Node 4: My Bookings (list) ── */
    {
      id: 'node_bookings',
      label: 'My Bookings',
      type: 'list',
      position: { x: 500, y: 400 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_bnb_61',
            type: 'text',
            props: { content: 'My Bookings' },
            style: {
              base: {
                fontSize: 22,
                fontWeight: 'bold',
                textColor: '#f8fafc',
                padding: { top: 20, right: 16, bottom: 8, left: 16 },
              },
            },
          },
          {
            id: 'sc_bnb_62',
            type: 'list',
            props: { direction: 'vertical', gap: 10 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
            datasource: {
              datasourceId: 'ds_bookings',
              fieldMappings: {},
            },
            children: [
              {
                id: 'sc_bnb_63',
                type: 'card',
                props: {},
                style: {
                  base: {
                    backgroundColor: '#1e293b',
                    border: { radius: 12 },
                    padding: { top: 14, right: 14, bottom: 14, left: 14 },
                  },
                },
                children: [
                  {
                    id: 'sc_bnb_64',
                    type: 'text',
                    props: { content: '{{propertyTitle}}' },
                    style: {
                      base: {
                        fontSize: 15,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_bookings',
                      fieldMappings: { content: 'propertyTitle' },
                    },
                  },
                  {
                    id: 'sc_bnb_65',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 12 },
                    style: {
                      base: {
                        padding: { top: 6, right: 0, bottom: 0, left: 0 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_bnb_66',
                        type: 'container',
                        props: { direction: 'vertical', gap: 2 },
                        children: [
                          {
                            id: 'sc_bnb_67',
                            type: 'text',
                            props: { content: 'Check-in' },
                            style: {
                              base: {
                                fontSize: 10,
                                textColor: '#64748b',
                              },
                            },
                          },
                          {
                            id: 'sc_bnb_68',
                            type: 'text',
                            props: { content: '{{checkIn}}' },
                            style: {
                              base: {
                                fontSize: 12,
                                textColor: '#e2e8f0',
                              },
                            },
                            datasource: {
                              datasourceId: 'ds_bookings',
                              fieldMappings: { content: 'checkIn' },
                            },
                          },
                        ],
                      },
                      {
                        id: 'sc_bnb_69',
                        type: 'container',
                        props: { direction: 'vertical', gap: 2 },
                        children: [
                          {
                            id: 'sc_bnb_70',
                            type: 'text',
                            props: { content: 'Check-out' },
                            style: {
                              base: {
                                fontSize: 10,
                                textColor: '#64748b',
                              },
                            },
                          },
                          {
                            id: 'sc_bnb_71',
                            type: 'text',
                            props: { content: '{{checkOut}}' },
                            style: {
                              base: {
                                fontSize: 12,
                                textColor: '#e2e8f0',
                              },
                            },
                            datasource: {
                              datasourceId: 'ds_bookings',
                              fieldMappings: { content: 'checkOut' },
                            },
                          },
                        ],
                      },
                      {
                        id: 'sc_bnb_72',
                        type: 'container',
                        props: { direction: 'vertical', gap: 2 },
                        children: [
                          {
                            id: 'sc_bnb_73',
                            type: 'text',
                            props: { content: 'Total' },
                            style: {
                              base: {
                                fontSize: 10,
                                textColor: '#64748b',
                              },
                            },
                          },
                          {
                            id: 'sc_bnb_74',
                            type: 'text',
                            props: { content: '${{totalPrice}}' },
                            style: {
                              base: {
                                fontSize: 12,
                                fontWeight: '600',
                                textColor: '#6366f1',
                              },
                            },
                            datasource: {
                              datasourceId: 'ds_bookings',
                              fieldMappings: { content: 'totalPrice' },
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
          {
            id: 'sc_bnb_75',
            type: 'spacer',
            props: {},
            style: {
              base: {
                height: 8,
              },
            },
          },
          {
            id: 'sc_bnb_76',
            type: 'button',
            props: {
              label: 'Browse More',
              variant: 'primary',
              navigateTo: 'node_browse',
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
  ],
  edges: [
    {
      id: 'edge_browse_detail',
      source: 'node_browse',
      target: 'node_detail',
    },
    {
      id: 'edge_detail_booking',
      source: 'node_detail',
      target: 'node_booking',
    },
    {
      id: 'edge_booking_bookings',
      source: 'node_booking',
      target: 'node_bookings',
    },
    {
      id: 'edge_bookings_browse',
      source: 'node_bookings',
      target: 'node_browse',
    },
  ],
};
