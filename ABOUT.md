## Project overview

This is a Vite + React + TypeScript example that demonstrates Adobe Spectrum 2 (React Spectrum S2) with style-macro rules compiled at build time. It shows how to:

- Use the style() macro from `@react-spectrum/s2/style` to generate atomic CSS
- Apply styles via `className` (for native elements) and `styles` (for S2 components)
- Configure the Vite macros plugin (`unplugin-parcel-macros`) and optimize CSS bundling
- Build interactive UIs using a wide set of S2 components

The demo includes lazy-loaded examples and data-driven collections (e.g. `CardView`) that fetch content from the Unsplash API.

## Tech stack

- React 18 + TypeScript 5
- Vite 5 with `@vitejs/plugin-react`
- React Spectrum S2 (`@react-spectrum/s2` >= 0.4.0)
- Macros: `unplugin-parcel-macros`
- CSS minifier: `lightningcss`
- Async collections: `react-stately` (for `useAsyncList` in examples)

## How styles work (style-macro)

The project uses the style macro from Spectrum 2 to compile style objects into atomic CSS at build time. Import the macro with the import attribute and pass style objects to `className` or `styles` props.

```jsx
import { style } from "@react-spectrum/s2/style" with { type: "macro" };

<div className={style({ marginStart: 16 })}>Hello Spectrum 2!</div>
<Button styles={style({ marginStart: 16 })}>Hello Spectrum 2!</Button>
```

At build time, these objects are converted into minimal, de-duplicated CSS rules.

## Vite configuration highlights

- The macros plugin is enabled in `vite.config.ts`:

```ts
import macros from "unplugin-parcel-macros";
export default defineConfig({
  plugins: [macros.vite(), react()],
});
```

- Build optimizations:
  - `target: ['es2022']`
  - CSS minified by `lightningcss`
  - Manual chunking groups all S2 and style-macro generated CSS into a single `s2-styles` bundle for better deduplication across pages.

## Theming and required CSS

Include the page-level theme CSS once at the app root to enable light/dark themes and core variables:

```ts
import "@react-spectrum/s2/page.css";
```

This is already done in `src/App.tsx` and `src/Lazy.tsx`.

## Running and building

From the repository root:

```bash
yarn install
yarn dev
```

- Dev server: http://localhost:5173
- Build: `yarn build`
- Preview production build: `yarn preview`

## Project structure (selected files)

- `index.html` – Vite entry HTML
- `vite.config.ts` – React + macros plugin, build targets, CSS chunking
- `postcss.config.js` – PostCSS config (empty plugin list in this example)
- `tsconfig.json` – strict TS config optimized for bundlers
- `src/main.tsx` – React entry point
- `src/App.tsx` – Primary demo UI using many S2 components, `style()` macro, and lazy loading
- `src/Lazy.tsx` – Additional S2 component examples loaded on demand
- `src/components/Section.jsx` – Simple section wrapper with heading and layout
- `src/components/CardViewExample.jsx` – `CardView` backed by Unsplash photos via `useAsyncList`
- `src/components/CollectionCardsExample.jsx` – Topic `CardView` backed by Unsplash topics

Note: `CardViewExample.jsx` also exports a `CollectionCardsExample`; the app imports the dedicated `src/components/CollectionCardsExample.jsx` version.

## Data fetching

The `CardView` examples use the Unsplash API (public client id is embedded for demonstration) to load photos and topics. Network access is required to see live data; when loading or fetching more items, skeleton content is displayed.

## Licensing

Several files include an Apache-2.0 license header from Adobe. Refer to individual file headers (and any top-level license file, if added) for the definitive licensing terms.
