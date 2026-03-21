# Add New App Templates

## Priority
P2

## Category
template

## Description
Orchestra currently has 3 templates (TODO List, BnB Rentals, Event Distance) plus Blank. To demonstrate the platform's versatility and help users get started faster, more templates covering common app archetypes are needed.

## Current State
- Blank (empty project)
- TODO List (task manager with list + form)
- BnB Rentals (property listing with browse, detail, booking)
- Event Distance (map-based event discovery)

## Proposed State — New Templates
### High Priority
- **Restaurant Finder**: Menu browse, dish detail, order/cart, order history. Tests e-commerce patterns.
- **Fitness Tracker**: Dashboard with stats, workout log (form), exercise library (gallery), progress charts. Tests data visualization.
- **Social Feed**: Post feed (list), post detail, create post (form), user profile (detail). Tests social patterns.

### Medium Priority
- **E-Commerce Store**: Product catalog, product detail, cart, checkout. Most requested app type.
- **Chat/Messaging**: Conversation list, chat room, contact profile. Tests real-time patterns.
- **News/Blog Reader**: Article feed, article detail, bookmarks, categories. Tests content-heavy patterns.

### Lower Priority
- **Weather App**: Current weather, forecast, location search. Tests API integration patterns.
- **Portfolio/Resume**: About me, projects gallery, contact form. Tests personal branding.

## Improvement Points
- Each template should exercise different component types and flow patterns
- Templates should include realistic sample data in datasources
- Restaurant Finder would be the most impactful next template (broad appeal, tests cart/ordering)

## Acceptance Criteria
- [ ] At least 2 new templates added
- [ ] Each template has 3+ screens, 1+ datasource with sample data
- [ ] Templates appear in the New Project dialog
- [ ] Each template demonstrates unique SDUI patterns not covered by existing templates

## Estimated Complexity
Medium (per template)
