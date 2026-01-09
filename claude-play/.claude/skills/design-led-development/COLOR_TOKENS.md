# Color Token System

Use semantic color tokens instead of hardcoded values. This ensures consistency and enables theming.

## Semantic Tokens

### Action Colors

```css
--color-primary: /* Main brand/action color */
--color-primary-hover: /* Primary on hover */
--color-primary-active: /* Primary when pressed */

--color-danger: /* Destructive actions */
--color-danger-hover:
--color-danger-active:

--color-success: /* Confirmations, positive states */
--color-warning: /* Caution, attention needed */
--color-info: /* Neutral information */
```

### Background Colors

```css
--bg-base: /* Default page background */
--bg-elevated: /* Cards, modals, dropdowns */
--bg-overlay: /* Scrim behind dialogs (typically 50% opacity) */
--bg-subtle: /* Secondary backgrounds, zebra striping */
--bg-selected: /* Selected items in lists */
```

### Text Colors

```css
--text-primary: /* Body text on bg-base */
--text-secondary: /* Supporting text, labels */
--text-disabled: /* Inactive states */
--text-inverse: /* Text on colored backgrounds */
--text-link: /* Interactive text */
--text-link-hover:
```

### Border Colors

```css
--border-default: /* Standard dividers */
--border-focus: /* Keyboard focus indicators (min 3:1 contrast) */
--border-error: /* Validation errors */
--border-subtle: /* Light separators */
```

## Contrast Requirements

| Context | Minimum Ratio |
|---------|---------------|
| Body text | 7:1 |
| Large text (18px+ or 14px+ bold) | 4.5:1 |
| UI components | 3:1 |
| Focus indicators | 3:1 |
| Placeholder text | 4.5:1 |

## Dark Mode Strategy

```css
/* Light theme */
:root {
  --bg-base: #ffffff;
  --text-primary: #1a1a1a;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-base: #0a0a0a;
    --text-primary: #f5f5f5;
  }
}

/* Manual override class */
[data-theme="dark"] {
  --bg-base: #0a0a0a;
  --text-primary: #f5f5f5;
}
```

## State Colors Pattern

For interactive elements, define all states:

```css
.button-primary {
  --button-bg: var(--color-primary);
  --button-bg-hover: var(--color-primary-hover);
  --button-bg-active: var(--color-primary-active);
  --button-bg-disabled: var(--text-disabled);
  
  background: var(--button-bg);
}

.button-primary:hover:not(:disabled) {
  background: var(--button-bg-hover);
}

.button-primary:active:not(:disabled) {
  background: var(--button-bg-active);
}

.button-primary:disabled {
  background: var(--button-bg-disabled);
  cursor: not-allowed;
}
```

## Danger Zone

Never hardcode colors:

```css
/* ❌ DON'T */
.error { color: #ff0000; }

/* ✅ DO */
.error { color: var(--color-danger); }
```

Never use color alone to convey information:

```css
/* ❌ DON'T: Only color indicates error */
.input-error { border-color: red; }

/* ✅ DO: Color + icon + text */
.input-error {
  border-color: var(--color-danger);
}
.input-error::before {
  content: "⚠";
}
.error-message {
  color: var(--color-danger);
}
```
