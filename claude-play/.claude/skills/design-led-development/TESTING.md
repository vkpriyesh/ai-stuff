# Testing Strategy

Comprehensive testing approach for design-led development.

## Test Pyramid

```
         ╱╲
        ╱  ╲     E2E Tests (few)
       ╱────╲    User flows, critical paths
      ╱      ╲
     ╱ Integr. ╲  Integration Tests (some)
    ╱──────────╲  API contracts, component interaction
   ╱            ╲
  ╱  Unit Tests  ╲ Unit Tests (many)
 ╱────────────────╲ Pure logic, edge cases, error paths
```

## Unit Tests

### What to Test

```typescript
// ✅ DO: Pure functions with edge cases
describe('calculateDiscount', () => {
  it('applies percentage discount correctly', () => {
    expect(calculateDiscount(100, 0.1)).toBe(90);
  });
  
  it('handles zero price', () => {
    expect(calculateDiscount(0, 0.1)).toBe(0);
  });
  
  it('clamps discount to 100%', () => {
    expect(calculateDiscount(100, 1.5)).toBe(0);
  });
  
  it('throws for negative values', () => {
    expect(() => calculateDiscount(-100, 0.1)).toThrow('Price must be positive');
  });
});
```

### Error Path Testing

```typescript
// ✅ DO: Test all error branches
describe('fetchUser', () => {
  it('returns user on success', async () => {
    mockApi.getUser.mockResolvedValue(mockUser);
    const result = await fetchUser('123');
    expect(result).toEqual({ success: true, data: mockUser });
  });
  
  it('returns error on network failure', async () => {
    mockApi.getUser.mockRejectedValue(new NetworkError());
    const result = await fetchUser('123');
    expect(result).toEqual({
      success: false,
      error: expect.objectContaining({
        message: 'Unable to load user profile'
      })
    });
  });
  
  it('returns error on 404', async () => {
    mockApi.getUser.mockRejectedValue(new NotFoundError());
    const result = await fetchUser('123');
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('USER_NOT_FOUND');
  });
});
```

## Integration Tests

### Component Integration

```typescript
describe('LoginForm', () => {
  it('submits credentials and redirects on success', async () => {
    render(<LoginForm />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  it('shows error message on invalid credentials', async () => {
    mockAuth.login.mockRejectedValue(new InvalidCredentialsError());
    render(<LoginForm />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The email or password doesn't match our records"
    );
  });
});
```

### API Contract Tests

```typescript
describe('Users API', () => {
  it('POST /users creates user with expected schema', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' });
    
    expect(response.status).toBe(201);
    expect(response.body).toMatchSchema({
      type: 'object',
      required: ['id', 'email', 'name', 'createdAt'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    });
  });
});
```

## Accessibility Tests

### Automated (axe-core)

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Keyboard Navigation

```typescript
describe('Modal keyboard navigation', () => {
  it('traps focus within modal', async () => {
    render(<Modal isOpen><Button>First</Button><Button>Last</Button></Modal>);
    
    const firstButton = screen.getByRole('button', { name: 'First' });
    const lastButton = screen.getByRole('button', { name: 'Last' });
    
    firstButton.focus();
    await userEvent.tab();
    expect(lastButton).toHaveFocus();
    
    await userEvent.tab();
    expect(firstButton).toHaveFocus(); // Wraps around
  });
  
  it('closes on Escape key', async () => {
    const onClose = jest.fn();
    render(<Modal isOpen onClose={onClose}><p>Content</p></Modal>);
    
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
```

### Screen Reader Testing Checklist

Manual testing required with:
- [ ] VoiceOver (macOS/iOS)
- [ ] NVDA (Windows)
- [ ] JAWS (Windows) for enterprise

Test these flows:
- [ ] Can navigate to all interactive elements
- [ ] Form labels are announced correctly
- [ ] Error messages are announced when they appear
- [ ] Dynamic content changes are announced (aria-live)
- [ ] Modal focus management works correctly

## Visual Regression Tests

### Setup with Playwright

```typescript
import { test, expect } from '@playwright/test';

test('button states', async ({ page }) => {
  await page.goto('/components/button');
  
  // Default state
  await expect(page.locator('.button-primary')).toHaveScreenshot('button-default.png');
  
  // Hover state
  await page.locator('.button-primary').hover();
  await expect(page.locator('.button-primary')).toHaveScreenshot('button-hover.png');
  
  // Focus state
  await page.locator('.button-primary').focus();
  await expect(page.locator('.button-primary')).toHaveScreenshot('button-focus.png');
});
```

### Component State Matrix

Test all combinations:

```typescript
const states = ['default', 'hover', 'active', 'focus', 'disabled', 'loading'];
const variants = ['primary', 'secondary', 'danger', 'ghost'];
const sizes = ['sm', 'md', 'lg'];

for (const variant of variants) {
  for (const size of sizes) {
    for (const state of states) {
      test(`button-${variant}-${size}-${state}`, async ({ page }) => {
        await page.goto(`/test/button?variant=${variant}&size=${size}&state=${state}`);
        await expect(page.locator('.button')).toHaveScreenshot();
      });
    }
  }
}
```

## Performance Tests

### Lighthouse CI

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

### Bundle Size Tracking

```typescript
// bundlesize.config.js
module.exports = {
  files: [
    {
      path: './dist/main.js',
      maxSize: '100 kB',
      compression: 'gzip',
    },
    {
      path: './dist/vendor.js',
      maxSize: '200 kB',
      compression: 'gzip',
    },
  ],
};
```

## Test Coverage Strategy

### What to Cover

| Area | Coverage Target | Rationale |
|------|-----------------|-----------|
| Business logic | 90%+ | Core functionality |
| Error handling | 100% | User-facing failures |
| Accessibility | 100% components | Legal/ethical requirement |
| Happy paths | 80%+ | Common scenarios |
| Edge cases | Case-by-case | Risk-based |

### What Not to Test

```typescript
// ❌ DON'T: Test implementation details
it('calls internal helper', () => {
  const spy = jest.spyOn(component, '_internalHelper');
  component.publicMethod();
  expect(spy).toHaveBeenCalled();
});

// ❌ DON'T: Test framework code
it('renders a div', () => {
  const { container } = render(<Component />);
  expect(container.querySelector('div')).toBeInTheDocument();
});

// ❌ DON'T: Snapshot everything
it('matches snapshot', () => {
  expect(render(<HugeComponent />)).toMatchSnapshot();
});
```

## Test Data Management

```typescript
// ✅ DO: Use factories for test data
const createUser = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  name: faker.name.fullName(),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});

// ✅ DO: Use meaningful test data
const invalidEmails = [
  'notanemail',
  'missing@domain',
  '@nodomain.com',
  'spaces in@email.com',
];

// ❌ DON'T: Use meaningless test data
const user = { name: 'test', email: 'test@test.com' };
```
