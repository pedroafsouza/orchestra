# QA Report — Hotel & Vacation Rentals

**Date:** 2026-03-21
**Screens tested:** 5 (Browse, Property Detail, Book, My Bookings, photo_gallery)
**Breakpoints tested:** Phone, Tablet, Desktop

## Summary
- 1 issue fixed (P0), 1 minor issue remaining (P2)
- 4 screens passed
- 3 navigation flows tested (Browse->Detail, Detail->Book, Detail->Back)

## Issues Found & Fixed

### Issue 1: Property Detail image showing "Image placeholder" — FIXED
- **Screen:** Property Detail
- **Severity:** P0
- **Description:** When navigating from Browse to Property Detail via "View" button, the hero image showed "Image placeholder" text instead of the actual property photo
- **Root cause:** The image component had `src: ""` with no datasource field mappings. The navigation context entry contained the `imageUrl` field but the runtime had no fallback to resolve it.
- **Fix applied:**
  1. `PreviewRuntime.tsx` — Added image field fallback: when `src` is empty but an entry is available, the runtime now checks common image field names (`imageUrl`, `image`, `photo`, `thumbnail`, etc.)
  2. `packages/shared/src/templates/bnb.ts` — Updated template to use `{{imageUrl}}` interpolation for new projects
- **Screenshot (before):** `.claude/qa/screenshots/hotel-property-detail-phone.png`
- **Screenshot (after):** `.claude/qa/screenshots/hotel-property-detail-fixed.png`

### Issue 2: photo_gallery screen is blank
- **Screen:** photo_gallery node
- **Severity:** P2
- **Description:** The photo_gallery screen renders completely blank
- **Root cause:** The node has no `screenDefinition` in its props (`props: {}`). It was added to the flow graph but never had a screen designed.
- **Expected:** Either remove the node or design a gallery screen for it
- **Screenshot:** `.claude/qa/screenshots/hotel-photo-gallery-phone.png`

## Passed Checks
- [x] All template variables resolved (no `{{` visible in rendered text)
- [x] All images loaded (after fix)
- [x] All navigation buttons work (View, Book Now, Back, Cancel, Browse More)
- [x] All screens render at Phone breakpoint
- [x] All screens render at Tablet breakpoint
- [x] All screens render at Desktop breakpoint
- [x] Form inputs are interactive (Book screen has Check-in, Check-out, Guests fields)
- [x] Lists show datasource data (Browse: 5 properties, My Bookings: 2 bookings)
- [x] No console errors

## Screenshots
- `hotel-browse-phone.png` — Browse screen at Phone
- `hotel-browse-tablet.png` — Browse screen at Tablet
- `hotel-browse-desktop.png` — Browse screen at Desktop
- `hotel-property-detail-phone.png` — Property Detail BEFORE fix (image placeholder)
- `hotel-property-detail-fixed.png` — Property Detail AFTER fix (image showing)
- `hotel-book-phone.png` — Book screen at Phone
- `hotel-photo-gallery-phone.png` — Photo gallery (blank)
