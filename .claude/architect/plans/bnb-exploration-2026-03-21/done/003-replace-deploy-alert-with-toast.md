# Replace Deploy Alert with Toast Notification

## Priority
P1

## Category
ux-bug

## Description
The Deploy button in the Flow Editor uses a native browser `alert()` dialog to confirm deployment ("Flow deployed! Version: 1"). This is jarring, blocks the UI, and feels unprofessional. The app already has a notification/toast system (visible as "Notifications (F8)" region in the DOM), so this should use that instead.

## Current State
- Clicking Deploy triggers `alert("Flow deployed! Version: 1")`
- Browser alert blocks all interaction until dismissed
- Inconsistent with the rest of the polished UI

## Proposed State
- Deploy shows a success toast notification (green, auto-dismiss after 3-5 seconds)
- Toast includes version number: "Flow deployed successfully (v1)"
- Error cases show a red error toast
- No blocking dialogs

## Improvement Points
- The notification system already exists in the app (F8 shortcut)
- Should also show a loading state on the Deploy button during the API call
- Consider adding deploy confirmation for production deployments (optional dialog, not alert)

## Acceptance Criteria
- [ ] Deploy success shows a toast notification, not a browser alert
- [ ] Toast displays the version number
- [ ] Deploy errors show an error toast
- [ ] Deploy button shows loading state during API call

## Estimated Complexity
Small
