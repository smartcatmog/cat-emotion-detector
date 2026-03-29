# Cat Emotion Detector Frontend - Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Update API URL (if needed):**
   Edit `.env.local` and set `VITE_API_URL` to your backend API URL:
   ```
   VITE_API_URL=http://localhost:3000/api/v1
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Production Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Code Quality

Run linter:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Project Structure

```
src/
├── api/
│   └── client.ts              # Axios HTTP client with interceptors
├── components/
│   ├── Layout.tsx             # Main layout with header/footer
│   ├── Upload.tsx             # File upload with drag-and-drop
│   └── Results.tsx            # Analysis results display
├── store/
│   ├── index.ts               # Redux store setup
│   └── slices/
│       └── analysisSlice.ts   # Analysis state management
├── types/
│   └── index.ts               # TypeScript type definitions
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
└── index.css                  # Tailwind CSS styles
```

## Key Features

### Upload Component
- Drag-and-drop file upload
- Native file picker
- Format validation (JPEG, PNG, WebP, GIF for images; MP4, WebM, MOV, AVI for videos)
- Size validation (50MB for images, 500MB for videos)
- Keyboard accessible
- Mobile friendly

### Results Component
- Emotion display with emoji and confidence score
- Interpretation text
- Recommended actions
- File information
- Preview (image or video)
- Navigation buttons

### Layout Component
- Responsive header with navigation
- Mobile hamburger menu
- Footer with links
- Dark mode support

## API Integration

The app communicates with the backend API at `/api/v1`:

### Endpoints Used
- `POST /analyze/image` - Analyze image file
- `POST /analyze/video` - Analyze video file
- `GET /history` - Get analysis history
- `GET /history/:id` - Get specific analysis
- `DELETE /history/:id` - Delete analysis
- `DELETE /history` - Delete all data

### Authentication
- JWT tokens stored in localStorage
- Automatic token refresh on 401 responses
- Auth header: `Authorization: Bearer {token}`

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Responsive design with mobile-first approach
- Dark mode support
- Custom colors: primary (blue-500), secondary (purple-500)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Semantic HTML
- Focus indicators
- Color contrast compliance (WCAG AA)
- Screen reader support
- Touch-friendly buttons (44x44px minimum)

## State Management

### Redux Store
- `analysis` slice for managing analysis results
- Actions: `setLoading`, `setResult`, `setError`, `clearResult`
- Centralized state for analysis data

## Environment Variables

Create `.env.local`:
```
VITE_API_URL=http://localhost:3000/api/v1
```

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will use the next available port.

### API Connection Issues
- Verify backend is running on the correct port
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`

## Performance Tips

- Use production build for deployment
- Enable gzip compression on server
- Use CDN for static assets
- Monitor bundle size with `npm run build`

## Browser Support

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Workflow

1. Create feature branch
2. Make changes
3. Run linter: `npm run lint`
4. Format code: `npm run format`
5. Test in development: `npm run dev`
6. Build for production: `npm run build`
7. Commit and push

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Static Hosting
The `dist` folder contains the production build and can be deployed to any static hosting service (Netlify, GitHub Pages, AWS S3, etc.).

## Support

For issues or questions, refer to:
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Axios Documentation](https://axios-http.com)
