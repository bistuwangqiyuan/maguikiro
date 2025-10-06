# Project Structure

## Directory Organization

```
/
├── src/
│   ├── routes/              # SvelteKit pages and layouts
│   │   ├── +layout.svelte   # Root layout with instrument shell
│   │   ├── +page.svelte     # Main page (waveform + data table)
│   │   ├── dashboard/       # Real-time monitoring dashboard
│   │   ├── history/         # Historical records management
│   │   ├── settings/        # System settings
│   │   ├── calibration/     # Calibration wizard
│   │   └── reports/         # Report generation and viewing
│   │
│   ├── lib/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── InstrumentShell.svelte
│   │   │   ├── WaveformChart.svelte
│   │   │   ├── GateOverlay.svelte
│   │   │   ├── DataTable.svelte
│   │   │   ├── ParameterPanel.svelte
│   │   │   └── NavigationMenu.svelte
│   │   │
│   │   ├── services/        # Business logic and API clients
│   │   │   ├── supabase.ts  # Supabase client singleton
│   │   │   ├── signal-generator.ts
│   │   │   ├── signal-processor.ts
│   │   │   ├── data-acquisition.ts
│   │   │   ├── report-generator.ts
│   │   │   └── data-exporter.ts
│   │   │
│   │   ├── stores/          # Svelte stores for state management
│   │   │   ├── testing.ts   # Current testing session state
│   │   │   ├── settings.ts  # User settings and parameters
│   │   │   └── auth.ts      # Authentication state
│   │   │
│   │   ├── types/           # TypeScript type definitions
│   │   │   ├── signal.ts
│   │   │   ├── session.ts
│   │   │   ├── gate.ts
│   │   │   └── database.ts
│   │   │
│   │   └── utils/           # Helper functions
│   │       ├── validation.ts
│   │       ├── formatting.ts
│   │       └── constants.ts
│   │
│   ├── app.html             # HTML template
│   └── service-worker.ts    # PWA service worker
│
├── static/                  # Static assets
│   ├── images/
│   └── fonts/
│
├── supabase/                # Supabase configuration (optional)
│   └── migrations/          # Database migration files
│
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env                     # Environment variables (not in git)
├── .gitignore
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Naming Conventions

- **Components**: PascalCase (e.g., `WaveformChart.svelte`)
- **Services**: kebab-case (e.g., `signal-generator.ts`)
- **Stores**: camelCase (e.g., `testingStore`)
- **Types/Interfaces**: PascalCase (e.g., `SignalData`, `TestingSession`)
- **Utilities**: camelCase (e.g., `validateParameters`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_GAIN_DB`)

## Component Organization

Components are organized by feature and reusability:

- **Layout components**: Instrument shell, panels, navigation
- **Visualization components**: Charts, gauges, indicators
- **Form components**: Parameter inputs, settings panels
- **Data components**: Tables, lists, cards
- **Modal components**: Dialogs, wizards, confirmations

## State Management

- **Local component state**: Use Svelte's reactive declarations
- **Shared state**: Use Svelte stores in `src/lib/stores/`
- **Server state**: Managed by Supabase with real-time subscriptions
- **Offline state**: Stored in IndexedDB via Dexie.js

## Routing

SvelteKit file-based routing:
- `+page.svelte` - Page component
- `+layout.svelte` - Layout wrapper
- `+server.ts` - API endpoints (if needed)
- `+page.ts` - Page load function

## Database Schema

Key Supabase tables:
- `profiles` - User profiles and roles
- `testing_sessions` - Detection session metadata
- `signal_data` - Raw signal measurements
- `defects` - Detected defects/anomalies
- `calibrations` - Calibration records
- `reports` - Report metadata

All tables use Row Level Security (RLS) for access control.
