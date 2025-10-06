# Technology Stack

## Frontend Framework

- **SvelteKit** - Full-stack framework with Vite build system
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **DaisyUI** - Component library for industrial UI

## Backend & Database

- **Supabase** - Backend-as-a-Service (no custom backend code)
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication (Supabase Auth)
  - Storage for PDF reports
  - Real-time subscriptions

## Key Libraries

- **Chart.js** - Real-time waveform visualization
- **chartjs-plugin-streaming** - Live data streaming
- **jsPDF** - PDF report generation
- **html2canvas** - Chart screenshot capture
- **SheetJS** - Excel export functionality
- **Dexie.js** - IndexedDB wrapper for offline storage
- **Workbox** - Service Worker and PWA support
- **svelte-i18n** - Internationalization (Chinese/English)

## Development Tools

- **Vite** - Build tool and dev server
- **Playwright** - End-to-end testing
- **Vitest** - Unit testing

## Common Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Type checking
npm run check

# Linting
npm run lint
```

## Environment Variables

Required environment variables (create `.env` file):

```
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

- **Platform**: Vercel (recommended)
- **Build Command**: `npm run build`
- **Output Directory**: `.svelte-kit`
- **Node Version**: 18.x or higher

## Performance Considerations

- Waveform data uses virtual scrolling for large datasets
- Signal processing runs in Web Workers to avoid blocking UI
- Data writes are batched (max 1 write per second)
- Code splitting and lazy loading for optimal bundle size
- Service Worker caching for offline functionality
