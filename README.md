# Foodie Passport

A Bangladesh food exploration app built with Next.js, TypeScript, Tailwind CSS, Zustand, and Leaflet. The app helps users discover regional foods across Bangladesh, track what they have tried, and build a personalized "passport" of culinary experiences.

## Overview

Foodie Passport is a local-first travel-and-food tracker for Bangladesh. Users can:

- browse a map of Bangladesh districts
- explore district-level food highlights
- mark foods as tried
- track overall progress across the catalog
- view milestone achievements
- export/import progress as JSON
- share a visual passport card

This project is intentionally backend-free and stores user progress in the browser via localStorage.

## Features

### District map exploration
- interactive map with district markers/polygons across Bangladesh
- quick district selection from the map or district list
- division-based filtering and district search

### Food tracking
- check off dishes and specialties per district
- progress tracked per district and globally
- total food count, explored districts, and completion percentage

### Dashboard and achievements
- overview cards for explored foods and districts
- completion meter
- recent discoveries feed
- milestone achievements such as "First Bite" and "Bangladesh Food Master"

### Share and export functionality
- export progress as JSON for backup or transfer
- import previously exported progress
- reset saved passport progress
- generate a shareable food passport card as a PNG
- optional native share support when available in the browser

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand for state management
- Leaflet + react-leaflet for map rendering
- html-to-image for exportable PNG card generation
- lucide-react for icons

## Project Structure

```text
foodie-passport/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── data/
│   │   └── districts.ts
│   └── store/
│       └── useFoodPassportStore.ts
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── .eslintrc.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Install dependencies

```bash
npm install
```

### Run the app in development mode

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Build for production

```bash
npm run build
```

### Start the production server

```bash
npm run start
```

## Data and persistence model

The app uses a static district catalog defined in `src/data/districts.ts` to provide district metadata, food examples, and geographic coordinates. Progress is tracked in a Zustand store with persistence enabled in the browser.

Key behaviors:

- progress is stored in localStorage under `foodie-passport-progress`
- checked foods are keyed as `districtId:foodId`
- selected district state is also persisted
- export/import only handles progress JSON and is designed for local transfer between browsers

## Notes and assumptions

- The app is a client-first experience and does not use a backend or database.
- The map uses simplified district polygon overlays rather than a full official district boundary dataset.
- The catalog is intentionally a curated, app-focused dataset for demo and UX exploration rather than an authoritative geographic or culinary source.
- Browser-only APIs such as `navigator.share`, `window.localStorage`, and `document` are used only in client-side interactions.

## Future enhancements

Potential next improvements include:

- real GeoJSON district boundaries for Bangladesh
- a larger and more accurate district/food catalog
- richer achievement logic and analytics
- improved import validation UX
- accessibility and keyboard navigation polish
- support for multiple language labels and Bengali localization

## License

This project is for educational and prototype use unless otherwise specified by the repository owner.
