# 240 Score Tracker

Live site: [https://example.github.io/240-score-tracker/](https://example.github.io/240-score-tracker/)

240 Score Tracker is a local-first darts scoring web app. It runs completely in the browser and stores players, boards, games, and game history locally using IndexedDB.

## Features

- Create and manage players
- Built-in guest players
- Support for 301 and 501 games
- Single, double, and master entry modes
- Single, double, and master exit modes
- Support for 180 and 240 dartboards
- Custom board data stored locally
- Save and continue running games
- Game history and detailed game views
- Player statistics
- Offline-friendly static web app
- Dark and light themes

## Technology

- Svelte 5
- TypeScript
- Vite
- Tailwind CSS
- DaisyUI
- Dexie
- IndexedDB
- svelte-spa-router

## Local Development

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## GitHub Pages

The Vite base path must match the GitHub repository name:

```ts
base: "/240-score-tracker/"
```

Deploy the current version with:

```bash
npm run deploy
```

The deployment command builds the app and publishes the `dist` folder to the `gh-pages` branch.

## Data Storage

The app uses IndexedDB through Dexie. All application data is stored locally in the browser.

The main database tables are:

- `players`
- `boards`
- `games`

Clearing the site's browser data will also remove locally stored players, boards, games, and statistics.

## Project Status

The project is under active development. Features, models, and the user interface may still change.