# Add Missing SDUI Components

## Priority
P2

## Category
component

## Description
The component library is solid (25+ components) but missing several common mobile UI patterns. After building the BnB Rentals app, these gaps became apparent when thinking about what other app types would need.

## Current State
Component library includes:
- **Commonly used**: Text, Button, Image, Input, Container, Card, List
- **Basic**: Icon, Spacer, Divider, Chip, Badge, Avatar
- **Inputs**: Input, Combo Box, Checkbox
- **Layout**: Container, Card, H-Scroll, Carousel, Hero/Panoramic
- **Data & Media**: List, Gallery, Video, Rating, Price Tag, Map View

## Proposed State — Missing Components
### High Priority
- **Switch/Toggle** (Inputs): For settings screens, boolean options
- **Date Picker** (Inputs): The Book screen uses plain text input for dates — needs a proper date picker
- **Slider** (Inputs): For price range filters, quantity selectors
- **Search Bar** (Commonly used): Distinct from Input — includes icon, clear button, filter affordance

### Medium Priority
- **Tab Bar / Bottom Navigation** (Layout): Essential for multi-tab mobile apps
- **Accordion/Expandable** (Layout): FAQ sections, collapsible content
- **Progress Bar / Stepper** (Basic): Multi-step forms, loading indicators
- **Snackbar/Toast** (Basic): In-app notifications within the preview

### Lower Priority
- **Calendar View** (Data & Media): Monthly calendar display
- **Chart/Graph** (Data & Media): Bar, line, pie charts for dashboards
- **QR Code** (Data & Media): Generate/display QR codes
- **Countdown Timer** (Basic): Event countdowns

## Improvement Points
- Switch/Toggle and Date Picker are the most impactful for form-heavy apps
- Tab Bar/Bottom Navigation is critical for multi-screen apps — currently no way to add persistent navigation
- Search Bar with filter integration would dramatically improve list-heavy templates

## Acceptance Criteria
- [ ] Switch/Toggle component added to Inputs category
- [ ] Date Picker component added to Inputs category
- [ ] Tab Bar component added to Layout category
- [ ] Each new component has full property editor support (Content, Appearance, Spacing, Border, Shadow)

## Estimated Complexity
Large (for all), Small (per component)
