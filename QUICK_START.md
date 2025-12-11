# Quick Start Guide

Get up and running with the React Native Expo app in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional)
cd apps/mobile
cp .env.example .env
# Edit .env with your API URL if needed

# 3. Start the development server
npm start
```

## Launch App

After running `npm start`, choose your option:

- **iOS**: Press `i`
- **Android**: Press `a`
- **Web**: Press `w`

Or run directly:

```bash
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run web        # Web preview
```

## Common Commands

```bash
# From apps/mobile/ directory
npm start              # Start dev server
npm run lint           # Check code style
npm run type-check     # Check TypeScript
npm test              # Run tests
npm run format        # Format code
```

## Project Structure

```
apps/mobile/src/
├── screens/          # App screens (Auth, Onboarding, Main)
├── components/       # Reusable UI components
├── services/         # API client
├── store/            # Global state (Zustand)
├── navigation/       # Navigation setup
├── themes/           # Dark theme tokens
├── types/            # TypeScript types
└── utils/            # Helper functions
```

## Key Features

✨ **Dark Theme** - Complete dark theme implementation  
🧭 **Navigation** - Auth, Onboarding, and Main stacks  
🔐 **Authentication** - Login, Register, Forgot Password  
📊 **State Management** - Zustand for global state  
🔄 **Data Fetching** - React Query with Axios  
📱 **Cross-Platform** - iOS and Android support

## Development Workflow

1. Make changes to files in `src/`
2. Changes hot-reload automatically
3. Check code: `npm run lint && npm run type-check`
4. Format code: `npm run format`
5. Test: `npm test`

## Troubleshooting

**Port in use?**
```bash
npm start -- --port 19001
```

**Cache issues?**
```bash
npm start -- --clear
```

**Need fresh install?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- 📖 Read [README.md](./README.md) for detailed documentation
- 🛠 See [SETUP.md](./SETUP.md) for complete setup guide
- 📝 Check [CONTRIBUTING.md](./CONTRIBUTING.md) for code standards
- 💡 Review [apps/mobile/README.md](./apps/mobile/README.md) for app-specific info

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)
- [TypeScript](https://www.typescriptlang.org/)

Happy coding! 🎉
