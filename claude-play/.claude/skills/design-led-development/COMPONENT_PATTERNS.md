# Component Patterns

Reusable patterns for building consistent, accessible UI components.

## Button Component

### Required States

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  disabledReason?: string; // Required when isDisabled is true
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

function Button({
  variant,
  size,
  isLoading,
  isDisabled,
  disabledReason,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isDisabled || isLoading}
      aria-disabled={isDisabled || isLoading}
      aria-busy={isLoading}
      title={isDisabled ? disabledReason : undefined}
      {...props}
    >
      {isLoading ? <Spinner aria-label="Loading" /> : children}
    </button>
  );
}
```

### Size Scale

| Size | Height | Padding | Font Size | Min Touch Target |
|------|--------|---------|-----------|------------------|
| sm | 32px | 8px 12px | 14px | 44px (via margin) |
| md | 40px | 10px 16px | 16px | 44px |
| lg | 48px | 12px 24px | 18px | 48px |

## Input Component

### Required States

```tsx
interface InputProps {
  label: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

function Input({
  label,
  error,
  hint,
  isRequired,
  isDisabled,
  ...props
}: InputProps) {
  const inputId = useId();
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  
  return (
    <div>
      <label htmlFor={inputId}>
        {label}
        {isRequired && <span aria-hidden="true">*</span>}
        {isRequired && <span className="sr-only">(required)</span>}
      </label>
      
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        aria-required={isRequired}
        disabled={isDisabled}
        {...props}
      />
      
      {error && (
        <span id={errorId} role="alert" className="error">
          {error}
        </span>
      )}
      
      {hint && !error && (
        <span id={hintId} className="hint">
          {hint}
        </span>
      )}
    </div>
  );
}
```

## Modal/Dialog

### Accessibility Requirements

```tsx
function Modal({ isOpen, onClose, title, children }) {
  const titleId = useId();
  
  // Trap focus inside modal
  // Return focus to trigger on close
  // Close on Escape key
  
  return (
    <dialog
      open={isOpen}
      aria-labelledby={titleId}
      aria-modal="true"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <header>
        <h2 id={titleId}>{title}</h2>
        <button
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
      </header>
      
      <div>{children}</div>
    </dialog>
  );
}
```

### Focus Management

1. On open: Move focus to first focusable element (or close button)
2. While open: Trap Tab key within modal
3. On close: Return focus to trigger element
4. Escape key: Close modal

## Loading States

### Skeleton Pattern

```tsx
function Skeleton({ width, height, variant = 'text' }) {
  return (
    <div
      className="skeleton"
      style={{ width, height }}
      aria-hidden="true"
      data-variant={variant}
    />
  );
}

// Usage: Match the shape of real content
function UserCardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading user profile">
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="40%" height={16} />
    </div>
  );
}
```

### Progress Indicators

| Duration | Pattern |
|----------|---------|
| < 1s | No indicator needed |
| 1-3s | Spinner with aria-busy |
| 3-10s | Progress bar with percentage |
| > 10s | Progress with time estimate |

```tsx
function ProgressBar({ value, label }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div style={{ width: `${value}%` }} />
    </div>
  );
}
```

## Empty States

Always include:
1. Clear explanation of why it's empty
2. Illustration or icon (optional but recommended)
3. Primary action to resolve the empty state
4. Secondary action if applicable

```tsx
function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction
}) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="empty-state-actions">
        {primaryAction && (
          <Button variant="primary" {...primaryAction} />
        )}
        {secondaryAction && (
          <Button variant="ghost" {...secondaryAction} />
        )}
      </div>
    </div>
  );
}

// Usage
<EmptyState
  icon={<SearchIcon />}
  title="No results found"
  description="Try adjusting your search terms or filters"
  primaryAction={{ label: "Clear filters", onClick: clearFilters }}
  secondaryAction={{ label: "Search tips", onClick: showTips }}
/>
```

## Error States

### Inline Field Error

```tsx
<Input
  label="Email"
  error="Please enter a valid email address"
  aria-invalid="true"
/>
```

### Page-Level Error

```tsx
function ErrorBanner({ title, message, onRetry, onDismiss }) {
  return (
    <div role="alert" className="error-banner">
      <ErrorIcon aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <div className="error-actions">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        {onDismiss && (
          <Button variant="ghost" onClick={onDismiss} aria-label="Dismiss error">
            ×
          </Button>
        )}
      </div>
    </div>
  );
}
```

### Full Page Error

```tsx
function ErrorPage({ error, onRetry }) {
  return (
    <main className="error-page">
      <h1>Something went wrong</h1>
      <p>{error.userMessage}</p>
      
      <div className="error-actions">
        <Button variant="primary" onClick={onRetry}>
          Try again
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
      
      <details>
        <summary>Technical details</summary>
        <code>{error.code}: {error.technicalMessage}</code>
      </details>
    </main>
  );
}
```

## Toast/Notification

```tsx
function Toast({ variant, message, action, onDismiss, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);
  
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={`toast toast-${variant}`}
    >
      <span>{message}</span>
      {action && (
        <button onClick={action.onClick}>{action.label}</button>
      )}
      <button onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}
```

## Confirmation Dialog

For destructive actions:

```tsx
function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p>{message}</p>
      
      <footer className="dialog-actions">
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant={isDestructive ? "danger" : "primary"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </footer>
    </Modal>
  );
}

// Usage for destructive action
<ConfirmDialog
  isOpen={showDeleteConfirm}
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteConfirm(false)}
  title="Delete project?"
  message="This will permanently delete the project and all its data. This action cannot be undone."
  confirmLabel="Delete project"
  isDestructive
/>
```
