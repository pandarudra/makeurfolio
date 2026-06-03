# Contributing to makeurfolio

## Adding a New Theme

makeurfolio uses a registry-based multi-theme architecture.  
Themes are **pure presentation components** — they receive a fully-hydrated portfolio object through props and render it.

**Themes must NEVER:**
- Import Prisma or any database client
- Call `fetch()` or access any API
- Access `localStorage`, `sessionStorage`, or any browser storage
- Perform any data fetching or side effects

**Data flow is always:**
```
Route → Fetch Portfolio → Resolve Theme → Render Theme
```

### Steps to Add a Theme

1. **Create a theme folder:**  
   `src/themes/<theme-id>/`  
   (e.g., `src/themes/modern-glass/`)

2. **Implement the theme component:**  
   Create an `index.tsx` with a default export accepting `PortfolioThemeProps`:
   ```tsx
   import type { PortfolioThemeProps } from "../shared/types";

   export default function ModernGlassTheme({ portfolio }: PortfolioThemeProps) {
     return (
       // Your theme JSX here
     );
   }
   ```

3. **Add metadata to the theme manifest:**  
   In `src/themes/theme-manifest.ts`, add an entry:
   ```ts
   {
     id: "modern-glass",
     name: "Modern Glass",
     description: "Modern startup founder aesthetic with glassmorphism",
     previewImage: "/themes/modern-glass.png",
   }
   ```

4. **Register in the theme registry:**  
   In `src/themes/registry.ts`, import and register:
   ```ts
   import ModernGlassTheme from "./modern-glass";

   export const themeRegistry = {
     "minimal-editorial": MinimalEditorialTheme,
     "modern-glass": ModernGlassTheme,
   };
   ```

5. **Done.**

No route changes. No database changes. No editor changes.

### Shared Utilities

Use the helpers in `src/themes/shared/utils.ts` to avoid duplicating common logic:

- `groupSkillsByCategory(skills)` — Group skills by category
- `formatDateRange(start, end, currentlyWorking)` — Format date ranges
- `splitProjects(projects)` — Split into featured/regular
- `getPrimarySocials(links, count)` — Get top N social links
- `getTopTechString(skills, count)` — Comma-separated top tech names
