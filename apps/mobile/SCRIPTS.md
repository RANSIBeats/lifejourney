# Available Scripts

This document describes all available npm scripts for the React Native mobile app.

## Development Scripts

### `npm start`
**Start Expo development server**

Launches the Expo CLI with interactive menu:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator  
- Press `w` to open web preview
- Press `c` to clear cache
- Press `r` to reload app

```bash
npm start
npm start -- --port 19001  # Use different port if needed
npm start -- --clear       # Clear bundler cache
```

### `npm run ios`
**Open app in iOS Simulator**

Requires macOS with Xcode and iOS Simulator running.

```bash
npm run ios
```

### `npm run android`
**Open app in Android Emulator**

Requires Android Studio and emulator running.

```bash
npm run android
```

### `npm run web`
**Preview app in web browser**

Limited functionality - mainly for development preview.

```bash
npm run web
```

## Code Quality Scripts

### `npm run lint`
**Run ESLint on source code**

Checks code style and potential errors.

```bash
npm run lint                # Check all files
npm run lint -- --fix       # Auto-fix issues
npm run lint -- src/App.tsx # Check specific file
```

### `npm run type-check`
**Run TypeScript type checking**

Verifies type safety without building.

```bash
npm run type-check
```

### `npm run format`
**Format code with Prettier**

Auto-formats all TypeScript and React files.

```bash
npm run format
```

### `npm test`
**Run Jest tests**

Discovers and runs test files.

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm test -- App.test.tsx   # Run specific test
```

## Building Scripts

### `npm run eject`
**Eject from Expo managed workflow**

⚠️ **Warning**: This is irreversible. Only use if you need full native control.

```bash
npm run eject
```

## Workflow Examples

### Full Development Cycle

```bash
# 1. Start development server
npm start

# 2. In another terminal, check code quality
npm run lint
npm run type-check

# 3. Format code
npm run format

# 4. Run tests
npm test
```

### Before Committing

```bash
npm run lint -- --fix
npm run type-check
npm run format
npm test
```

### Continuous Development

```bash
npm start        # Terminal 1 - Keep running
npm test -- --watch  # Terminal 2 - Run tests in watch mode
```

## Environment-Specific Scripts

### Development

```bash
npm start          # Standard development
npm run ios        # iOS focus
npm run android    # Android focus
```

### Testing & QA

```bash
npm run lint
npm run type-check
npm test
npm run format
```

## Monorepo Scripts

From the root directory:

```bash
npm install:all    # Install all workspace dependencies
npm run lint       # Run linting from root (if configured)
npm run test       # Run tests from root (if configured)
```

## Performance Tips

- Use `--watch` mode during development for faster feedback
- Use `--clear` flag if you encounter caching issues
- Run type-check before committing to catch errors early
- Use ESLint `--fix` to auto-correct common issues

## Troubleshooting

### Script Not Found

Ensure you're in the `apps/mobile` directory:

```bash
cd apps/mobile
npm start
```

### Permission Denied

On Unix/Linux/macOS:

```bash
chmod +x ./node_modules/.bin/expo
npm start
```

### Need Specific Node Version

Use nvm or similar:

```bash
nvm use 18    # Use Node.js 18
npm install
npm start
```

## Additional Information

See the full documentation:
- [README.md](./README.md) - Project overview
- [SETUP.md](../SETUP.md) - Complete setup guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guidelines
- [package.json](./package.json) - Full script definitions

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm start` | Start development server |
| `npm run ios` | Open iOS Simulator |
| `npm run android` | Open Android Emulator |
| `npm run lint` | Check code style |
| `npm run type-check` | Check TypeScript |
| `npm run format` | Format code |
| `npm test` | Run tests |
