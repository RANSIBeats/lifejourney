# Contributing Guide

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code Standards

### TypeScript

- All code must be written in TypeScript
- Use strict mode (`strict: true` in tsconfig.json)
- Export types and interfaces when they're used across modules
- Prefer explicit types over `any`

### Naming Conventions

- **Components**: PascalCase (e.g., `LoginScreen.tsx`)
- **Functions/Variables**: camelCase (e.g., `handleLogin`, `userEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `AuthState`, `UserData`)

### Project Structure

Follow the existing directory structure:

```
src/
├── screens/          # Screen components organized by feature
├── components/       # Reusable UI components
├── services/         # API and external services
├── store/            # Zustand stores
├── navigation/       # Navigation configuration
├── themes/           # Theme tokens and styling
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Import Paths

Always use path aliases for imports:

```typescript
// ✅ Good
import Button from '@components/Button';
import { useAuthStore } from '@store/authStore';
import theme from '@themes/index';

// ❌ Bad
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
```

## Code Quality

### Linting

Before committing, run the linter:

```bash
npm run lint
```

Fix issues automatically where possible:

```bash
npm run lint -- --fix
```

### Formatting

Code is automatically formatted with Prettier. Run manually:

```bash
npm run format
```

### Type Checking

Always ensure TypeScript is happy:

```bash
npm run type-check
```

## Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/feature-name
   ```

2. **Make your changes** following code standards

3. **Run tests and checks**:
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

4. **Commit with clear messages**:
   ```
   feat: Add dark theme implementation
   fix: Resolve navigation stack initialization
   docs: Update README with setup instructions
   ```

5. **Push and create a pull request**

6. **Address review feedback** before merging

## Style Guide

### React Components

- Use functional components with hooks
- Use TypeScript for component props
- Memoize components if they have expensive re-renders
- Use composition over complex props

```typescript
// ✅ Good
interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ onPress, title, variant = 'primary' }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};
```

### State Management

- Use Zustand stores for global state
- Keep stores focused on a single concern
- Use descriptive action names
- Include TypeScript interfaces for state

```typescript
// ✅ Good
interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### Styling

- Use theme tokens for all styling
- Avoid hardcoded colors and spacing
- Use StyleSheet for better performance

```typescript
// ✅ Good
<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
  <Text style={styles.title}>{title}</Text>
</View>

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    color: theme.colors.text,
  },
});
```

## Testing

Write tests for:
- Utility functions
- Store logic
- Component interactions
- Navigation flows

```bash
npm test
```

## Documentation

- Update README when adding major features
- Add JSDoc comments for complex functions
- Document component props thoroughly
- Keep inline comments minimal and meaningful

## Performance Tips

- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers passed to children
- Avoid inline function definitions in styles
- Use FlatList for long lists with `keyExtractor`

## Common Issues

### TypeScript Errors

Ensure path aliases are configured in:
- `tsconfig.json` (paths)
- `babel.config.js` (alias)
- `jest.config.js` (moduleNameMapper)

### Navigation Not Working

- Check `RootNavigator` has all required stacks
- Verify screen names match navigation types
- Use proper type annotations for navigation props

### Styling Issues

- Use theme tokens instead of hardcoded values
- Verify responsive sizing works on different devices
- Test on both iOS and Android

## Getting Help

- Check existing issues and PRs
- Review the documentation
- Ask in discussions
- Reach out to maintainers

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report inappropriate behavior

Thank you for contributing! 🎉
