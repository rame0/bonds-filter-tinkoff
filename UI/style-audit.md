# Style Audit

This file captures the initial UI styling split before the Tailwind-first migration.

## Tailwind pipeline

- `src/assets/tailwind.css` loads the Tailwind layers.
- `postcss.config.js` runs `tailwindcss` and `autoprefixer`.
- `tailwind.config.js` scans `index.html` and `src/**/*.{vue,ts,tsx,js,jsx}`.

## App-owned styles to migrate

These files are owned by the app and should move toward Tailwind utilities or plain CSS:

- `src/assets/index.scss`
- `src/views/HomeView.vue`
- `src/views/PortfolioView.vue`
- `src/components/UI/BaseHeader.vue`
- `src/components/UI/LinksToExchange.vue`
- `src/components/UI/LoadingOverlay.vue`
- `src/components/UI/BondFlags.vue`
- `src/components/UI/BondOptionsSelect.vue`
- `src/components/UI/BondOptionsChecks.vue`
- `src/components/UI/BondOptionsRadios.vue`

## Element Plus dependent UI

These files currently depend on `Element Plus` components and are likely replacement targets:

- `src/App.vue`
- `src/components/BondsFilter.vue`
- `src/components/BondsTable.vue`
- `src/components/PortfolioTable.vue`
- `src/components/UI/BaseHeader.vue`
- `src/components/UI/BaseSide.vue`
- `src/components/UI/BondFlags.vue`
- `src/components/UI/LinksToExchange.vue`
- `src/components/UI/LoadingOverlay.vue`
- `src/components/UI/LiquidityArrow.vue`
- `src/components/UI/RiskStars.vue`

## Sass retained only for Element Plus

These files exist to customize the `Element Plus` theme and should be removed together with the library:

- `src/assets/element/index.scss`
- `src/assets/element/dark.scss`

## Migration order

1. Replace app-level layout and utility styles with Tailwind classes.
2. Replace `Element Plus` widgets with app-owned Vue components and native elements.
3. Remove the Sass theme bridge and any remaining Element Plus imports.
