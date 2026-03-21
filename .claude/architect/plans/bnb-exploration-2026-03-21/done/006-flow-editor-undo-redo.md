# Add Undo/Redo to Flow Editor

## Priority
P2

## Category
flow-editor

## Description
The Flow Editor has no undo/redo functionality. Users who accidentally delete a node, move it to the wrong position, or remove an edge have no way to revert. This is a standard expectation for any visual editor.

## Current State
- No undo/redo buttons visible
- No keyboard shortcut support for Cmd+Z / Cmd+Shift+Z
- Accidental changes are permanent until manually reverted

## Proposed State
- Undo/Redo buttons in the toolbar or control panel
- Cmd+Z (undo) and Cmd+Shift+Z (redo) keyboard shortcuts
- Undo stack tracks: node add/delete/move, edge add/delete, property changes
- Visual indicator of undo/redo availability (disabled state when stack is empty)

## Improvement Points
- React Flow has built-in support for tracking state changes
- Consider using a command pattern or state snapshot approach
- Limit undo stack to ~50 actions to prevent memory issues
- Group rapid changes (e.g., dragging = single undo entry, not one per pixel)

## Acceptance Criteria
- [ ] Cmd+Z undoes the last action in the flow editor
- [ ] Cmd+Shift+Z redoes the last undone action
- [ ] Undo/redo works for node creation, deletion, and movement
- [ ] Undo/redo works for edge creation and deletion
- [ ] Undo stack is bounded (max 50 entries)

## Estimated Complexity
Medium
