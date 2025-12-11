# Setup Guide

Complete guide for setting up the development environment for the React Native Expo app.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher (download from [nodejs.org](https://nodejs.org/))
- **npm** 8.0.0 or higher (comes with Node.js)
- **Git** (download from [git-scm.com](https://git-scm.com/))

### For iOS Development

- **macOS** (required for iOS development)
- **Xcode** 14.0 or higher (from App Store)
  ```bash
  xcode-select --install
  ```
- **CocoaPods** (installed with Xcode)

### For Android Development

- **Android Studio** (download from [developer.android.com](https://developer.android.com/studio))
- **Android SDK** (installed via Android Studio)
- **Java Development Kit (JDK)** 11 or higher

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Install Global Dependencies

Install Expo CLI globally:

```bash
npm install -g expo-cli
```

Verify installation:

```bash
expo --version
```

### 3. Install Project Dependencies

From the project root:

```bash
npm install:all
```

Or navigate to the mobile app directory and install:

```bash
cd apps/mobile
npm install
```

### 4. Setup Environment Variables

Create a `.env` file in `apps/mobile/` based on `.env.example`:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Edit `apps/mobile/.env` and configure your API endpoint:

```env
EXPO_PUBLIC_API_URL=https://api.your-domain.com
EXPO_PUBLIC_ENV=development
```

## Running the App

### Using Expo CLI

From the `apps/mobile` directory:

```bash
npm start
```

This opens the Expo CLI menu with options:

- **`i`** - Open iOS Simulator
- **`a`** - Open Android Emulator
- **`w`** - Open web preview
- **`c`** - Clear cache and rebuild
- **`r`** - Reload app

### iOS Simulator

Requirements:
- macOS
- Xcode installed

Run:

```bash
npm run ios
```

### Android Emulator

Requirements:
- Android Studio installed
- Emulator created and running

Run:

```bash
npm run android
```

### Web (Preview Only)

```bash
npm run web
```

## Development Workflow

### 1. Start Development Server

```bash
cd apps/mobile
npm start
```

### 2. Open in Simulator/Emulator

- Press `i` for iOS
- Press `a` for Android

### 3. Make Code Changes

The app will hot reload when you save files.

### 4. Run Linting and Type Checks

```bash
npm run lint        # Check code style
npm run type-check  # Check TypeScript
npm test           # Run tests
```

### 5. Format Code

```bash
npm run format
```

## Troubleshooting

### Port Already in Use

Expo uses port 19000 by default. If it's busy:

```bash
npm start -- --port 19001
```

### Clear Metro Bundler Cache

```bash
npm start -- --clear
```

Or:

```bash
expo start -c
```

### Reinstall Dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issues on macOS

If you have permission issues:

```bash
sudo chown -R $(whoami) ~/.npm
```

### iOS Simulator Not Found

Reset simulator:

```bash
xcrun simctl erase all
```

### Android Emulator Issues

Ensure Android SDK is set up:

```bash
# Check ANDROID_HOME is set
echo $ANDROID_HOME

# If not set, add to ~/.bashrc, ~/.zshrc, or equivalent:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then reload shell:

```bash
source ~/.bashrc  # or ~/.zshrc on newer macOS
```

## IDE Setup

### Visual Studio Code

1. Install extensions:
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint
   - Thunder Client (for API testing)

2. Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["typescript", "typescriptreact"]
}
```

### IntelliJ/WebStorm

1. Enable Prettier:
   - Settings > Languages & Frameworks > JavaScript > Prettier
   - Check "Run on save"

2. Configure ESLint:
   - Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint
   - Enable ESLint

## Git Configuration

### Pre-commit Hooks (Optional)

Install husky for pre-commit checks:

```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

## Testing Setup

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm test -- --watch
```

Coverage report:

```bash
npm test -- --coverage
```

## Building for Production

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

First-time setup requires EAS CLI:

```bash
npm install -g eas-cli
eas login
```

## Next Steps

1. Read the [README.md](./README.md) for feature overview
2. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for code standards
3. Review the app structure in `apps/mobile/src/`
4. Start developing! 🚀

## Common Commands Reference

```bash
# Development
npm start              # Start Expo dev server
npm run ios           # Run on iOS
npm run android       # Run on Android
npm run web           # Run web preview

# Code Quality
npm run lint          # Check linting
npm run type-check    # Check TypeScript
npm run format        # Format code
npm test              # Run tests

# Building
npm run eject         # Eject from Expo (not recommended)
```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - Your environment (Node version, OS, etc.)

Happy coding! 🎉
