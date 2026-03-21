# Skill Proposal: QA Navigator

## Priority
P1

## Category
skill

## Description
A Playwright-based QA skill that autonomously navigates the Live Preview, tests component rendering, validates data binding, checks navigation flows, and reports bugs with screenshots. This would automate the manual testing done in this architect run.

## What It Would Do
1. Navigate to each screen in a project's Live Preview
2. Verify all template variables (`{{...}}`) are resolved (no raw mustache strings)
3. Verify images load (no "Image placeholder" text)
4. Test all navigation buttons (verify screen transitions work)
5. Test form inputs (fill and submit)
6. Test all responsive frames (Phone, Tablet, Desktop)
7. Screenshot each screen at each breakpoint
8. Generate a bug report with screenshots for any failures

## Why This Is Needed
- Manual testing of every screen after each code change is time-consuming
- Data binding issues (like the ones found in this run) are easy to miss
- Regression testing after template or component changes
- Could run as part of a CI/CD pipeline or as a pre-deploy check

## Trigger
`/qa` or `/qa <project-name>`

## Acceptance Criteria
- [ ] Skill navigates all screens in a project's preview
- [ ] Reports unresolved template variables as bugs
- [ ] Reports broken images as bugs
- [ ] Tests navigation between screens
- [ ] Generates screenshot-annotated bug report
- [ ] Can be run against any project, not just hardcoded ones

## Estimated Complexity
Medium
