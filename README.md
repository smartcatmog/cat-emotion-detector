# Cat Emotion Detector - Frontend

A React 18 + TypeScript + Vite web application for analyzing cat emotions from images and videos.

## Project Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Project Structure

```
src/
├── main.tsx          # Application entry point
├── App.tsx           # Root component
├── App.css           # Root styles
└── index.css         # Global styles
```

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Redux Toolkit**: State management
- **Axios**: HTTP client
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Configuration Files

- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build configuration
- `.eslintrc.cjs`: ESLint rules
- `.prettierrc`: Prettier formatting rules
- `.gitignore`: Git ignore patterns

## Features (To be implemented)

- Image and video upload with preview
- Cat emotion detection and analysis
- Results display with recommendations
- Analysis history and tracking
- Responsive design for mobile and desktop
- Accessibility compliance (WCAG AA)
- Offline support with Service Workers
