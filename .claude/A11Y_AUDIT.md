# Accessibility Audit and Fix

You are an accessibility engineer auditing a frontend project. In this first pass you AUDIT and REPORT only. Do not change any code until I tell you how to proceed.

The visual standards in this prompt follow the command-line-chic design system.

Part A is the set of common, essential accessibility requirements every UI should meet (WCAG 2.2 Level A/AA baseline). Part B is recommended best practice beyond the baseline.

Inspect the rendered UI and the source. For each item decide whether it is Present, Missing, Partial, or Not applicable.

## Part A — Must have

### Semantic structure

- Semantic HTML throughout: real `<button>`, `<a href>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<ul>/<li>`, `<fieldset>/<legend>` — not `<div>`/`<span>` with click handlers. Flag every interactive `<div>` or `<span>`.
- One `<main>` landmark per page; navigation, header, and footer use their landmark elements. Where a landmark type repeats, each instance has a unique accessible label.
- Headings form a logical outline: one `<h1>`, no skipped levels, headings used for structure rather than styling.
- Lists use list markup; data tables use `<th>` with `scope`, not layout `<div>`s.

### Page-level basics

- Each page (or route, in a single-page app) has a descriptive `<title>` reflecting its content; a single-view app at minimum replaces the default scaffold title. In multi-route apps the title updates on navigation and routes with different purposes use different titles (convention: `Specific — App Name`).
- The page declares its language with `lang` on `<html>`; inline passages in another language carry their own `lang`.

### Text alternatives

- Informative images have `alt` text that conveys the image's meaning or function in context, not a filename or "image of …". An image that is itself a link or button describes the destination or action rather than the picture. Decorative images use `alt=""`. Complex images (charts, diagrams) have a longer description nearby.
- Icon-only controls have an accessible name (`aria-label` on the control) and the icon/SVG is marked `aria-hidden="true"` so it is not double-announced.
- Audio/video has captions or a transcript as appropriate.

### Links and link text

- Every link has discernible text. A link wrapping only an image or icon takes its name from the image `alt` or an `aria-label`; flag empty links (one of the most common failures on the web).
- Link text describes where the link goes. Avoid bare "click here" / "read more" repeated across a page; the purpose should be clear from the text or its immediate context.
- Links are distinguishable from surrounding text by more than color alone (e.g. an underline).
- A control's visible text label is contained in its accessible name (SC 2.5.3 Label in Name), so speech-input users can activate it by the name they see. Flag icon or text controls whose `aria-label` omits or contradicts the adjacent visible text.

### Forms

- Every input, select, and textarea has a programmatically associated `<label>` (or `aria-label`/`aria-labelledby`). Placeholder text is not a substitute for a label.
- Required fields and constraints are conveyed in text, not by color or `*` alone.
- Errors are identified in text and tied to their field (`aria-describedby`), and the input is marked `aria-invalid="true"` while invalid (attribute absent when valid). Where a fix is knowable, suggest it.
- Related controls are grouped with `<fieldset>`/`<legend>` (radio groups, checkbox sets).
- Inputs that collect known personal data (name, email, address, etc.) use the matching `autocomplete` token (SC 1.3.5) so browsers and assistive tech can autofill.
- If the app has authentication, no step requires a cognitive function test (puzzle CAPTCHA, transcription, memory game) without an accessible alternative, and the password field allows paste and password managers (SC 3.3.8).

### Skip link

- A "Skip to main content" link is the first focusable element, visible on focus, and moves focus to the main landmark.

### Keyboard

- Every interactive element is reachable and operable by keyboard alone using standard interaction: Tab/Shift+Tab to move, Enter/Space to activate, arrow keys for composite widgets (radio groups, menus, tabs, listboxes). No keyboard traps outside intentional dialogs.
- Tab order follows the visual/reading order; no positive `tabindex` values.
- Single character key shortcuts (only if the app has them): a shortcut bound to a single printable character, including Shift+character combos like `?`, must be able to be turned off, remapped to include a non-printable modifier (Ctrl/Alt/Cmd), or be active only while a component has focus. At minimum, suppress them while focus is in an `<input>`, `<textarea>`, or contenteditable.

### Predictable interaction

- Moving focus to a control does not by itself cause a change of context (no navigation, no popup, no submit) (SC 3.2.1).
- Changing a control's value does not automatically cause a change of context unless the user was warned; e.g. a `<select>` does not navigate or submit on change without an explicit action (SC 3.2.2).

### Focus

- All interactive elements have a visible `:focus-visible` indicator. Per the project's command-line-chic design system the focus ring is `#198eee`, 2px solid. Flag any element with `outline: none` and no replacement, and any custom control that loses its ring.
- When content opens, closes, or changes, focus is moved or restored predictably and is never dropped to the top of the page or lost on a removed element.
- A focused element is never fully hidden behind sticky headers/footers, cookie banners, or other overlays; at least part of it stays visible (SC 2.4.11 Focus Not Obscured).

### Dialogs and modals

- Prefer a native `<dialog>` opened with `showModal()`: it traps focus, closes on Escape, makes the rest of the page inert, returns focus to the trigger on close, and exposes modal semantics for free. The non-modal `.show()` does none of this; it must be `showModal()`.
- However the dialog is built, it must move focus in on open and trap it while open (Tab cycles within, never reaches the page behind), close on Escape, return focus to the triggering element on close, and keep background content inert.
- The dialog has an accessible name (`aria-labelledby` pointing at its heading, or `aria-label`) — the native `<dialog>` does not provide this automatically. A hand-rolled modal also needs `role="dialog"` and `aria-modal="true"`.

### Dynamic announcements (live regions)

- Content that changes from user interaction and is not announced by a focus move is exposed through an `aria-live` region: scores and counters, validation/correctness status, success/error messages, async load/save results, filter result counts, toasts.
- Status updates use `aria-live="polite"`; urgent errors may use `aria-live="assertive"`. Add `aria-atomic="true"` when several values update at once.
- Loading, empty, and error states are conveyed in text (e.g. `role="status"`), not a blank or spinner-only screen.

### Color and contrast

- No information conveyed by color alone; color is paired with text, an icon, or a pattern.
- Aim for the command-line-chic target of 7:1; the WCAG minimum (4.5:1 normal text, 3:1 large text) is the floor that must always be met.
- UI component boundaries, icons, and the focus indicator meet 3:1 non-text contrast.

### Pointer, touch, and gestures

- Interactive targets are at least 24×24 CSS pixels, or are spaced far enough apart that a 24px-diameter circle centered on each does not overlap a neighbor or its circle (SC 2.5.8, AA). Aim higher, at least 44×44, for comfortable touch use. Check closely spaced icon buttons, table-row actions, and tightly packed links.
- Anything operated with a path-based or multi-point gesture (swipe, drag, pinch, two-finger) also works with a single pointer such as a tap or click (SC 2.5.1). Drag-and-drop has a non-drag alternative, e.g. buttons or a select (SC 2.5.7).

### Zoom, reflow, and motion

- Content reflows without horizontal scrolling or loss of content down to a 320px-wide viewport and at 200% text zoom.
- Animation respects `prefers-reduced-motion`; any auto-playing or looping motion longer than 5s can be paused/stopped; nothing flashes more than three times per second.

## Part B — Recommended

### Disabled controls

Prefer not to disable interactive controls, especially submit/action buttons. Keep them
enabled, validate on activation, and show recoverable error messages. If a control must show
an unavailable state that users should still find and understand, use `aria-disabled="true"`
rather than the HTML `disabled` attribute, which drops the control from the tab order, is
skipped by screen-reader navigation, and is exempt from contrast rules. With `aria-disabled`
you must block the action in JavaScript (`pointer-events: none` is not enough), style it via
`[aria-disabled="true"]`, and keep it contrast-legible. Reserve the native `disabled`
attribute for form fields that are intentionally inert and excluded from submission.

### Keyboard shortcuts

Custom shortcuts are an enhancement, not a requirement. If the app adds them:

- they must satisfy the single character key shortcut rule in Part A;
- avoid binding to keys and combos the browser, OS, or assistive technology already use (Ctrl/Cmd+T, Ctrl/Cmd+W, Ctrl/Cmd+L, F5, screen-reader command keys);
- `?` (Shift+/) is the widely recognized convention for opening a keyboard shortcuts help panel. If shortcuts exist, expose a discoverable list of them and surface its existence so users do not have to guess.

## Step 2 — Report

Group findings under two headings, **Must have** and **Recommended**. Under each, one line per issue:

`Category — what is missing (file:line)`

End each group with a count.

Example:

**Must have (3)**

- Skip link — no skip-to-content link (Layout.tsx)
- Focus — custom buttons set `outline: none` with no replacement (Button.module.css:22)
- Live regions — score updates are not announced (ScoreBoard.tsx:48)

**Recommended (1)**

- Keyboard shortcuts — `j`/`k` navigation has no help panel (useKeys.ts:12)

## Step 3 — Ask before fixing

After presenting the report, stop and ask one question:

> Do you want to address these incrementally (one category or issue at a time, pausing for review after each) or in bulk (fix everything, then present the full diff for review)?

Wait for the answer before editing any code. When fixing, change only what is needed to satisfy the requirement and preserve existing behavior and styling. Prefer native HTML semantics over ARIA; only add ARIA when no native element does the job.
