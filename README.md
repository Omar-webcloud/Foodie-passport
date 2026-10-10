# Foodie Passport

A Bangladesh food exploration app built with Next.js, TypeScript, Tailwind CSS, and Zustand. The app helps users discover regional foods across Bangladesh, track what they have tried, and build a personalized "passport" of culinary experiences.

## Overview

Foodie Passport is a local-first travel-and-food tracker for Bangladesh. Users can:

- browse and search Bangladesh's 64 districts
- explore district-level food highlights
- search/filter districts at all times; expand or collapse the district names list
- view district names in Bengali with a bundled Noto Sans Bengali font
- mark foods as tried
- track overall progress across the catalog
- view milestone achievements
- share a visual passport card

This project is intentionally backend-free and stores user progress in the browser via localStorage.
Passport sharing creates a public snapshot URL containing the tried-food total and covered district IDs; it does not expose the owner's local food-by-food records.

## Features

### District exploration
- quick district selection from the searchable district list
- persistent division filtering and district search in English or Bengali, with the list expanding on search focus

### Food tracking
- check off dishes and specialties per district
- progress tracked per district and globally
- total food count, explored districts, and completion percentage

### Dashboard and achievements
- overview cards for explored foods and districts
- completion meter
- recent discoveries feed
- textless progress map on the share card: unexplored districts are green and covered districts are red
- milestone achievements such as "First Bite" and "Bangladesh Food Master"

### Sharing and download
- reset saved passport progress
- download a crisp, portrait passport card as a PNG, rendered independently of the phone's screen layout
- open the responsive share dialog to share a public passport snapshot through Facebook, WhatsApp, or a copied link
- provide Open Graph and Twitter preview images with the shared progress map

For deployed social previews, set `NEXT_PUBLIC_SITE_URL` to the canonical public site origin (for example, `https://example.com`). Facebook and WhatsApp fetch the `/share` page and its generated `/api/og` image directly, so localhost links cannot produce public previews. Social networks may cache previews after the first fetch.

The production canonical URL defaults to `https://foodie-passport-bd.vercel.app`. Basic SEO metadata, a sitemap, a robots file, and the passport emblem favicon are configured in the App Router.
The Bangladesh passport emblem in `public/Bangladesh_Passport_Emblem.png` is also used in the downloadable card and social preview.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand for state management
- SVG and Canvas APIs for consistent PNG card generation across mobile browsers
- Noto Sans Bengali via Fontsource for Bengali text rendering
- lucide-react for icons

## Project Structure

```text
foodie-passport/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── share/page.tsx
│   │   ├── api/og/route.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── data/
│   │   ├── bangladesh-district-boundaries.json
│   │   └── districts.ts
│   ├── components/
│   │   ├── HomePage.tsx
│   │   └── DistrictProgressMap.tsx
│   ├── lib/
│   │   ├── progress-map.ts
│   │   ├── share-progress.ts
│   │   └── site.ts
│   └── store/
│       └── useFoodPassportStore.ts
├── package.json
├── public/
│   └── Bangladesh_Passport_Emblem.png
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
- a district is considered covered once any one of its listed foods is marked as tried
- selected district state is also persisted

## Notes and assumptions

- The app is a client-first experience and does not use a backend or database.
- The share card uses simplified GeoBoundaries district polygons sourced from Bangladesh Bureau of Statistics (BBS) / OCHA ROAP data, distributed under [CC BY 3.0 IGO](https://creativecommons.org/licenses/by/3.0/igo/). Districts are colored green until at least one food is checked, then red. Source: [geoBoundaries Bangladesh ADM2](https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM2/).
- The catalog is intentionally a curated, app-focused dataset for demo and UX exploration rather than an authoritative geographic or culinary source.
- Browser-only APIs such as `navigator.clipboard`, `window.localStorage`, and `document` are used only in client-side interactions.

## Future enhancements

Potential next improvements include:

- a larger and more accurate district/food catalog
- richer achievement logic and analytics
- accessibility and keyboard navigation polish
- support for multiple language labels and Bengali localization

## License

This project is for educational and prototype use unless otherwise specified by the repository owner.
