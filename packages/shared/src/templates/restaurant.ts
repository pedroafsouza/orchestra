import type { ProjectTemplate } from './types';

export const RESTAURANT_TEMPLATE: ProjectTemplate = {
  id: 'restaurant',
  name: 'Restaurant Finder',
  description:
    'A food ordering app with restaurant browse, menu details, and cart screens.',
  icon: '🍽️',
  datasources: [
    {
      id: 'ds_restaurants',
      name: 'Restaurants',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'cuisine', label: 'Cuisine', type: 'text' },
        { key: 'imageUrl', label: 'Image URL', type: 'image_url' },
        { key: 'rating', label: 'Rating', type: 'number' },
        { key: 'priceRange', label: 'Price Range', type: 'text' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'deliveryTime', label: 'Delivery Time', type: 'number' },
      ],
      sampleEntries: [
        {
          name: 'Sakura Sushi',
          cuisine: 'Japanese',
          imageUrl:
            'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop',
          rating: 4.8,
          priceRange: '$$',
          location: 'Downtown, Tokyo District',
          deliveryTime: 30,
        },
        {
          name: 'Bella Pasta',
          cuisine: 'Italian',
          imageUrl:
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
          rating: 4.6,
          priceRange: '$$',
          location: 'Little Italy',
          deliveryTime: 35,
        },
        {
          name: 'Taco Fiesta',
          cuisine: 'Mexican',
          imageUrl:
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop',
          rating: 4.5,
          priceRange: '$',
          location: 'Mission District',
          deliveryTime: 20,
        },
        {
          name: 'Le Petit Bistro',
          cuisine: 'French',
          imageUrl:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
          rating: 4.9,
          priceRange: '$$$',
          location: 'Uptown, 5th Avenue',
          deliveryTime: 45,
        },
        {
          name: 'Spice Garden',
          cuisine: 'Indian',
          imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
          rating: 4.7,
          priceRange: '$$',
          location: 'Curry Lane',
          deliveryTime: 25,
        },
      ],
    },
    {
      id: 'ds_cart',
      name: 'Cart',
      fields: [
        { key: 'itemName', label: 'Item Name', type: 'text', required: true },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'quantity', label: 'Quantity', type: 'number' },
      ],
      sampleEntries: [
        {
          itemName: 'Salmon Nigiri (x4)',
          price: 16,
          quantity: 1,
        },
        {
          itemName: 'Miso Soup',
          price: 5,
          quantity: 2,
        },
      ],
    },
  ],
  nodes: [
    /* ── Node 1: Browse Restaurants (landing) ── */
    {
      id: 'node_browse',
      label: 'Browse',
      type: 'landing',
      position: { x: 100, y: 100 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_rest_1',
            type: 'text',
            props: { content: 'Discover' },
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
            id: 'sc_rest_2',
            type: 'text',
            props: { content: 'Find the best restaurants near you' },
            style: {
              base: {
                fontSize: 13,
                textColor: '#94a3b8',
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
          },
          {
            id: 'sc_rest_3',
            type: 'input',
            props: { placeholder: 'Search restaurants...', type: 'text' },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 12, left: 16 },
              },
            },
          },
          {
            id: 'sc_rest_4',
            type: 'horizontal_scroll',
            props: { gap: 8 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 4, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_rest_5',
                type: 'chip',
                props: { label: 'Japanese', variant: 'outline' },
              },
              {
                id: 'sc_rest_6',
                type: 'chip',
                props: { label: 'Italian', variant: 'outline' },
              },
              {
                id: 'sc_rest_7',
                type: 'chip',
                props: { label: 'Mexican', variant: 'outline' },
              },
              {
                id: 'sc_rest_8',
                type: 'chip',
                props: { label: 'French', variant: 'outline' },
              },
              {
                id: 'sc_rest_9',
                type: 'chip',
                props: { label: 'Indian', variant: 'outline' },
              },
            ],
          },
          {
            id: 'sc_rest_10',
            type: 'list',
            props: { direction: 'vertical', gap: 12 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
            datasource: {
              datasourceId: 'ds_restaurants',
              fieldMappings: {},
            },
            children: [
              {
                id: 'sc_rest_11',
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
                    id: 'sc_rest_12',
                    type: 'image',
                    props: { src: '{{imageUrl}}', alt: 'restaurant' },
                    style: {
                      base: {
                        width: '100%',
                        height: 160,
                        border: { radius: 12 },
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_restaurants',
                      fieldMappings: { src: 'imageUrl' },
                    },
                  },
                  {
                    id: 'sc_rest_13',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 8 },
                    style: {
                      base: {
                        padding: { top: 10, right: 12, bottom: 4, left: 12 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_rest_14',
                        type: 'text',
                        props: { content: '{{cuisine}}' },
                        style: {
                          base: {
                            fontSize: 11,
                            textColor: '#94a3b8',
                          },
                        },
                        datasource: {
                          datasourceId: 'ds_restaurants',
                          fieldMappings: { content: 'cuisine' },
                        },
                      },
                      {
                        id: 'sc_rest_15',
                        type: 'rating_stars',
                        props: { value: 4.5 },
                        datasource: {
                          datasourceId: 'ds_restaurants',
                          fieldMappings: { value: 'rating' },
                        },
                      },
                    ],
                  },
                  {
                    id: 'sc_rest_16',
                    type: 'text',
                    props: { content: '{{name}}' },
                    style: {
                      base: {
                        fontSize: 16,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                        padding: { top: 0, right: 12, bottom: 4, left: 12 },
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_restaurants',
                      fieldMappings: { content: 'name' },
                    },
                  },
                  {
                    id: 'sc_rest_17',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 6 },
                    style: {
                      base: {
                        padding: { top: 0, right: 12, bottom: 4, left: 12 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_rest_18',
                        type: 'text',
                        props: { content: '{{priceRange}}' },
                        style: {
                          base: {
                            fontSize: 12,
                            fontWeight: '600',
                            textColor: '#6366f1',
                          },
                        },
                        datasource: {
                          datasourceId: 'ds_restaurants',
                          fieldMappings: { content: 'priceRange' },
                        },
                      },
                      {
                        id: 'sc_rest_19',
                        type: 'text',
                        props: { content: '{{deliveryTime}} min' },
                        style: {
                          base: {
                            fontSize: 11,
                            textColor: '#64748b',
                          },
                        },
                        datasource: {
                          datasourceId: 'ds_restaurants',
                          fieldMappings: { content: 'deliveryTime' },
                        },
                      },
                    ],
                  },
                  {
                    id: 'sc_rest_20',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 6 },
                    style: {
                      base: {
                        padding: { top: 0, right: 12, bottom: 10, left: 12 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_rest_21',
                        type: 'spacer',
                        props: { height: 1 },
                      },
                      {
                        id: 'sc_rest_22',
                        type: 'button',
                        props: {
                          label: 'View Menu',
                          variant: 'primary',
                          navigateTo: 'node_menu',
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

    /* ── Node 2: Restaurant Menu (list) ── */
    {
      id: 'node_menu',
      label: 'Menu',
      type: 'list',
      position: { x: 500, y: 100 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_rest_23',
            type: 'container',
            props: { direction: 'vertical', gap: 4 },
            style: {
              base: {
                padding: { top: 20, right: 16, bottom: 0, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_rest_24',
                type: 'text',
                props: { content: '{{name}}' },
                style: {
                  base: {
                    fontSize: 22,
                    fontWeight: 'bold',
                    textColor: '#f8fafc',
                  },
                },
              },
              {
                id: 'sc_rest_25',
                type: 'text',
                props: { content: '{{cuisine}} cuisine' },
                style: {
                  base: {
                    fontSize: 13,
                    textColor: '#94a3b8',
                    padding: { top: 0, right: 0, bottom: 8, left: 0 },
                  },
                },
              },
            ],
          },
          {
            id: 'sc_rest_26',
            type: 'divider',
            props: { color: '#1e293b', thickness: 1 },
          },
          {
            id: 'sc_rest_27',
            type: 'text',
            props: { content: 'Menu Items' },
            style: {
              base: {
                fontSize: 16,
                fontWeight: '600',
                textColor: '#f8fafc',
                padding: { top: 12, right: 16, bottom: 8, left: 16 },
              },
            },
          },
          {
            id: 'sc_rest_28',
            type: 'list',
            props: { direction: 'vertical', gap: 10 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_rest_29',
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
                    id: 'sc_rest_30',
                    type: 'text',
                    props: { content: 'Salmon Nigiri' },
                    style: {
                      base: {
                        fontSize: 15,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                  },
                  {
                    id: 'sc_rest_31',
                    type: 'text',
                    props: {
                      content:
                        'Fresh Atlantic salmon over pressed vinegared rice',
                    },
                    style: {
                      base: {
                        fontSize: 12,
                        textColor: '#94a3b8',
                        padding: { top: 2, right: 0, bottom: 6, left: 0 },
                      },
                    },
                  },
                  {
                    id: 'sc_rest_32',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 8 },
                    children: [
                      {
                        id: 'sc_rest_33',
                        type: 'price_tag',
                        props: { amount: 16, currency: '$' },
                      },
                      {
                        id: 'sc_rest_34',
                        type: 'spacer',
                        props: { height: 1 },
                      },
                      {
                        id: 'sc_rest_35',
                        type: 'button',
                        props: {
                          label: 'Add to Cart',
                          variant: 'primary',
                          navigateTo: 'node_cart',
                        },
                        style: {
                          base: {
                            fontSize: 12,
                            padding: {
                              top: 6,
                              right: 14,
                              bottom: 6,
                              left: 14,
                            },
                            backgroundColor: '#6366f1',
                            border: { radius: 8 },
                          },
                        },
                        actions: [
                          {
                            trigger: 'onPress',
                            type: 'DATASOURCE_ADD',
                            payload: { datasourceId: 'ds_cart' },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'sc_rest_36',
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
                    id: 'sc_rest_37',
                    type: 'text',
                    props: { content: 'Miso Soup' },
                    style: {
                      base: {
                        fontSize: 15,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                  },
                  {
                    id: 'sc_rest_38',
                    type: 'text',
                    props: {
                      content:
                        'Traditional Japanese soup with tofu, seaweed, and green onion',
                    },
                    style: {
                      base: {
                        fontSize: 12,
                        textColor: '#94a3b8',
                        padding: { top: 2, right: 0, bottom: 6, left: 0 },
                      },
                    },
                  },
                  {
                    id: 'sc_rest_39',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 8 },
                    children: [
                      {
                        id: 'sc_rest_40',
                        type: 'price_tag',
                        props: { amount: 5, currency: '$' },
                      },
                      {
                        id: 'sc_rest_41',
                        type: 'spacer',
                        props: { height: 1 },
                      },
                      {
                        id: 'sc_rest_42',
                        type: 'button',
                        props: {
                          label: 'Add to Cart',
                          variant: 'primary',
                          navigateTo: 'node_cart',
                        },
                        style: {
                          base: {
                            fontSize: 12,
                            padding: {
                              top: 6,
                              right: 14,
                              bottom: 6,
                              left: 14,
                            },
                            backgroundColor: '#6366f1',
                            border: { radius: 8 },
                          },
                        },
                        actions: [
                          {
                            trigger: 'onPress',
                            type: 'DATASOURCE_ADD',
                            payload: { datasourceId: 'ds_cart' },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'sc_rest_43',
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
                    id: 'sc_rest_44',
                    type: 'text',
                    props: { content: 'Tempura Platter' },
                    style: {
                      base: {
                        fontSize: 15,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                  },
                  {
                    id: 'sc_rest_45',
                    type: 'text',
                    props: {
                      content:
                        'Crispy battered shrimp and vegetables with dipping sauce',
                    },
                    style: {
                      base: {
                        fontSize: 12,
                        textColor: '#94a3b8',
                        padding: { top: 2, right: 0, bottom: 6, left: 0 },
                      },
                    },
                  },
                  {
                    id: 'sc_rest_46',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 8 },
                    children: [
                      {
                        id: 'sc_rest_47',
                        type: 'price_tag',
                        props: { amount: 22, currency: '$' },
                      },
                      {
                        id: 'sc_rest_48',
                        type: 'spacer',
                        props: { height: 1 },
                      },
                      {
                        id: 'sc_rest_49',
                        type: 'button',
                        props: {
                          label: 'Add to Cart',
                          variant: 'primary',
                          navigateTo: 'node_cart',
                        },
                        style: {
                          base: {
                            fontSize: 12,
                            padding: {
                              top: 6,
                              right: 14,
                              bottom: 6,
                              left: 14,
                            },
                            backgroundColor: '#6366f1',
                            border: { radius: 8 },
                          },
                        },
                        actions: [
                          {
                            trigger: 'onPress',
                            type: 'DATASOURCE_ADD',
                            payload: { datasourceId: 'ds_cart' },
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
            id: 'sc_rest_50',
            type: 'button',
            props: {
              label: 'Back',
              variant: 'secondary',
              navigateTo: 'node_browse',
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

    /* ── Node 3: Cart (form) ── */
    {
      id: 'node_cart',
      label: 'Cart',
      type: 'form',
      position: { x: 900, y: 100 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_rest_51',
            type: 'text',
            props: { content: 'Your Cart' },
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
            id: 'sc_rest_52',
            type: 'text',
            props: { content: 'Review your order before placing it' },
            style: {
              base: {
                fontSize: 13,
                textColor: '#94a3b8',
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
          },
          {
            id: 'sc_rest_53',
            type: 'list',
            props: { direction: 'vertical', gap: 10 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
            datasource: {
              datasourceId: 'ds_cart',
              fieldMappings: {},
            },
            children: [
              {
                id: 'sc_rest_54',
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
                    id: 'sc_rest_55',
                    type: 'text',
                    props: { content: '{{itemName}}' },
                    style: {
                      base: {
                        fontSize: 15,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                    datasource: {
                      datasourceId: 'ds_cart',
                      fieldMappings: { content: 'itemName' },
                    },
                  },
                  {
                    id: 'sc_rest_56',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 12 },
                    style: {
                      base: {
                        padding: { top: 6, right: 0, bottom: 0, left: 0 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_rest_57',
                        type: 'price_tag',
                        props: { amount: 0, currency: '$' },
                        datasource: {
                          datasourceId: 'ds_cart',
                          fieldMappings: { amount: 'price' },
                        },
                      },
                      {
                        id: 'sc_rest_58',
                        type: 'text',
                        props: { content: 'Qty: {{quantity}}' },
                        style: {
                          base: {
                            fontSize: 12,
                            textColor: '#94a3b8',
                          },
                        },
                        datasource: {
                          datasourceId: 'ds_cart',
                          fieldMappings: { content: 'quantity' },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'sc_rest_59',
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
                id: 'sc_rest_60',
                type: 'container',
                props: { direction: 'horizontal', gap: 0 },
                children: [
                  {
                    id: 'sc_rest_61',
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
                    id: 'sc_rest_62',
                    type: 'price_tag',
                    props: { amount: 26, currency: '$', period: 'total' },
                  },
                ],
              },
            ],
          },
          {
            id: 'sc_rest_63',
            type: 'spacer',
            props: {},
            style: {
              base: {
                height: 8,
              },
            },
          },
          {
            id: 'sc_rest_64',
            type: 'button',
            props: {
              label: 'Place Order',
              variant: 'primary',
              navigateTo: 'node_orders',
            },
            style: {
              base: {
                margin: { top: 0, right: 16, bottom: 0, left: 16 },
                backgroundColor: '#6366f1',
              },
            },
          },
          {
            id: 'sc_rest_65',
            type: 'button',
            props: {
              label: 'Back to Menu',
              variant: 'secondary',
              navigateTo: 'node_menu',
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

    /* ── Node 4: Order History (list) ── */
    {
      id: 'node_orders',
      label: 'Orders',
      type: 'list',
      position: { x: 500, y: 400 },
      screen: {
        backgroundColor: '#0f172a',
        rootComponents: [
          {
            id: 'sc_rest_66',
            type: 'text',
            props: { content: 'Order History' },
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
            id: 'sc_rest_67',
            type: 'list',
            props: { direction: 'vertical', gap: 10 },
            style: {
              base: {
                padding: { top: 0, right: 16, bottom: 16, left: 16 },
              },
            },
            children: [
              {
                id: 'sc_rest_68',
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
                    id: 'sc_rest_69',
                    type: 'text',
                    props: { content: 'Order #1042' },
                    style: {
                      base: {
                        fontSize: 15,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                  },
                  {
                    id: 'sc_rest_70',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 12 },
                    style: {
                      base: {
                        padding: { top: 6, right: 0, bottom: 0, left: 0 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_rest_71',
                        type: 'text',
                        props: { content: 'Sakura Sushi' },
                        style: {
                          base: {
                            fontSize: 12,
                            textColor: '#94a3b8',
                          },
                        },
                      },
                      {
                        id: 'sc_rest_72',
                        type: 'text',
                        props: { content: '3 items' },
                        style: {
                          base: {
                            fontSize: 12,
                            textColor: '#64748b',
                          },
                        },
                      },
                      {
                        id: 'sc_rest_73',
                        type: 'text',
                        props: { content: '$37.00' },
                        style: {
                          base: {
                            fontSize: 12,
                            fontWeight: '600',
                            textColor: '#6366f1',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 'sc_rest_74',
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
                    id: 'sc_rest_75',
                    type: 'text',
                    props: { content: 'Order #1038' },
                    style: {
                      base: {
                        fontSize: 15,
                        fontWeight: '600',
                        textColor: '#f8fafc',
                      },
                    },
                  },
                  {
                    id: 'sc_rest_76',
                    type: 'container',
                    props: { direction: 'horizontal', gap: 12 },
                    style: {
                      base: {
                        padding: { top: 6, right: 0, bottom: 0, left: 0 },
                      },
                    },
                    children: [
                      {
                        id: 'sc_rest_77',
                        type: 'text',
                        props: { content: 'Bella Pasta' },
                        style: {
                          base: {
                            fontSize: 12,
                            textColor: '#94a3b8',
                          },
                        },
                      },
                      {
                        id: 'sc_rest_78',
                        type: 'text',
                        props: { content: '2 items' },
                        style: {
                          base: {
                            fontSize: 12,
                            textColor: '#64748b',
                          },
                        },
                      },
                      {
                        id: 'sc_rest_79',
                        type: 'text',
                        props: { content: '$28.50' },
                        style: {
                          base: {
                            fontSize: 12,
                            fontWeight: '600',
                            textColor: '#6366f1',
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
            id: 'sc_rest_80',
            type: 'spacer',
            props: {},
            style: {
              base: {
                height: 8,
              },
            },
          },
          {
            id: 'sc_rest_81',
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
      id: 'edge_browse_menu',
      source: 'node_browse',
      target: 'node_menu',
    },
    {
      id: 'edge_menu_cart',
      source: 'node_menu',
      target: 'node_cart',
    },
    {
      id: 'edge_cart_orders',
      source: 'node_cart',
      target: 'node_orders',
    },
    {
      id: 'edge_orders_browse',
      source: 'node_orders',
      target: 'node_browse',
    },
  ],
};
