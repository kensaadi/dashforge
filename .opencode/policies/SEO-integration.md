# Dashforge SEO Integration Policy

## Scope

This policy applies to all pages in the Dashforge Web application that need to be discoverable by search engines and shareable on social media.

**Domain**: `dashforge-ui.com` (not dashforge.dev)  
**Analytics**: Plausible Analytics (already integrated in SEO component)  
**Total Routes**: 42 pre-rendered routes

---

# 1. Pre-Rendering System (Automatic SSG)

## 1.1 Architecture

The Dashforge Web app uses **automatic static site generation (SSG)** integrated into the build process.

**Build Command**: `pnpm nx build dashforge-web`

This command executes 3 sequential steps (configured in `web/project.json`):

1. **Vite Build** → Generates production bundle in `web/dist/`
2. **Pre-Rendering** → Renders all 42 routes to static HTML with full meta tags
3. **Sitemap Generation** → Creates `web/dist/sitemap.xml` with all URLs

**Development Workflow**:

- Development: `pnpm nx serve dashforge-web` (hot reload, no pre-rendering)
- Production Build: `pnpm nx build dashforge-web` (automatic pre-rendering)

---

## 1.2 Pre-Rendering Implementation

**Location**: `web/scripts/prerender.ts`

**Key Features**:

- Automatic preview server management (auto-finds free port 4300-4304)
- Waits for server ready with 30s timeout using `wait-on`
- Renders each route with Puppeteer (30s timeout per page)
- Resilient error handling (continues if some pages fail, exit code 0)
- Detailed summary report (success/failed counts, lists failed pages)
- Automatic server cleanup in `finally` block

**Dependencies**:

- `puppeteer@^24.40.0` - Headless Chrome rendering
- `get-port@^7.0.0` - Auto-find free port
- `wait-on@^8.0.1` - Wait for server ready
- `tsx` - TypeScript execution

**Chrome Installation** (required once):

```bash
npx puppeteer browsers install chrome
```

---

## 1.3 Route Discovery

**Location**: `web/scripts/generate-routes.ts`

Routes are **dynamically generated** from data files:

- **Homepage**: `/` (static)
- **Starter Kits**: `/starter-kits/:slug` (from `web/src/pages/StarterKits/data/starterKits.ts`)
- **Docs Pages**: `/docs/**/*` (from `web/src/pages/Docs/components/DocsSidebar.model.ts`)
- **Components**: `/components` (static)
- **Pricing**: `/pricing` (static)

**Total**: 42 routes

---

## 1.4 Sitemap Generation

**Location**: `web/scripts/generate-sitemap.ts`

Generates `web/dist/sitemap.xml` with:

- All 42 URLs (using `dashforge-ui.com` domain)
- `lastmod`: Current build date
- `changefreq`: Weekly
- `priority`: 0.8 (all pages equal priority)

---

## 1.5 Nx Build Configuration

**Location**: `web/project.json`

```json
{
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "commands": ["vite build", "npm run prerender", "npm run sitemap"],
        "cwd": "web",
        "parallel": false
      },
      "outputs": [
        "{workspaceRoot}/web/dist",
        "{workspaceRoot}/web/dist/index.html",
        "{workspaceRoot}/web/dist/sitemap.xml"
        // ... all 42 pre-rendered routes listed ...
      ],
      "cache": true
    }
  }
}
```

**Cache Invalidation**:

- Nx caches build outputs
- Cache invalidates when:
  - Source code changes
  - Pre-rendering scripts change (`web/scripts/*.ts`)
  - Route data changes (`starterKits.ts`, `DocsSidebar.model.ts`)

---

# 2. SEO Component Integration

## 2.1 SEO Component

**Location**: `web/src/components/seo/SEO.tsx`

**Usage**:

```tsx
import { SEO } from '@/components/seo/SEO';

function MyPage() {
  return (
    <>
      <SEO
        title="Page Title"
        description="Page description for search engines and social media"
        canonical="/page-path"
        keywords={['keyword1', 'keyword2']}
      />
      {/* Page content */}
    </>
  );
}
```

**Generated Meta Tags**:

- `<title>` - Page title + site name
- `<meta name="description">` - Page description
- `<link rel="canonical">` - Canonical URL (using `dashforge-ui.com`)
- `<meta name="keywords">` - Comma-separated keywords
- **Open Graph** (Facebook, LinkedIn):
  - `og:title`, `og:description`, `og:url`, `og:type`, `og:image`
- **Twitter Card**:
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- **Plausible Analytics** script tag

**Helmet Provider**:
`react-helmet-async` is initialized in `web/src/main.tsx` with `<HelmetProvider>`.

---

## 2.2 Current SEO Implementation Status

### ✅ Fully Implemented

- **HomePage** (`web/src/pages/Home/HomePage.tsx`):
  - Custom title, description, keywords
  - Open Graph + Twitter Card tags
  - Canonical URL: `/`

### ⚠️ Using Default SEO (Needs Custom Tags)

- **ComponentsPage** (`web/src/pages/Components/ComponentsPage.tsx`)

  - Currently no `<SEO>` component
  - Should add custom title/description

- **PricingPage** (`web/src/pages/Pricing/PricingPage.tsx`)

  - Currently no `<SEO>` component
  - Should add custom title/description

- **DocsPage** (`web/src/pages/Docs/DocsPage.tsx`)

  - Currently no `<SEO>` component
  - Should add **dynamic** SEO based on current doc route
  - Example: "TextField - Dashforge Docs" for `/docs/components/text-field`

- **Starter Kit Pages** (`web/src/pages/StarterKits/StarterKitDetailPage.tsx`)
  - Currently no `<SEO>` component
  - Should add **dynamic** SEO based on starter kit data
  - Example: "E-Commerce Starter Kit - Dashforge"

---

# 3. SSR-Safety Rules (Mandatory)

All components must be **SSR-safe** (no DOM access during render).

## 3.1 SSR-Safe Utilities

**Location**: `web/src/utils/dom.ts`

Use these wrappers for DOM access:

```tsx
import { scrollToTop, matchMedia } from '@/utils/dom';

// Instead of window.scrollTo()
scrollToTop();

// Instead of window.matchMedia()
const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
```

**Other SSR-Safe Patterns**:

- Use `useEffect()` for DOM access (runs only client-side)
- Check `typeof window !== 'undefined'` before DOM operations
- Use `react-helmet-async` for `<head>` modifications

---

## 3.2 Current SSR-Safe Components

These components were refactored to be SSR-safe:

- **DocsPage** (`web/src/pages/Docs/DocsPage.tsx`):
  - Uses `scrollToTop()` wrapper
- **DocsToc** (`web/src/pages/Docs/components/DocsToc.tsx`):

  - Uses DOM utility wrappers

- **LiveTypingCodeBlock** (`web/src/components/live-code/LiveTypingCodeBlock.tsx`):
  - Uses `matchMedia()` wrapper

---

# 4. Adding New Routes (Mandatory Checklist)

When adding a new page to the app, follow these steps:

## Step 1: Create the Page Component

Ensure the component is **SSR-safe** (see section 3).

## Step 2: Add SEO Component

```tsx
import { SEO } from '@/components/seo/SEO';

function NewPage() {
  return (
    <>
      <SEO
        title="New Page Title"
        description="Description for search engines and social media"
        canonical="/new-page"
        keywords={['keyword1', 'keyword2']}
      />
      {/* Page content */}
    </>
  );
}
```

## Step 3: Add Route to Data File

**For Starter Kits**:
Add to `web/src/pages/StarterKits/data/starterKits.ts`

**For Docs Pages**:
Add to `web/src/pages/Docs/components/DocsSidebar.model.ts`

**For Static Pages**:
Add to `web/scripts/generate-routes.ts` directly

## Step 4: Update Nx Cache Outputs

Add the new route to `web/project.json` in the `outputs` array:

```json
{
  "targets": {
    "build": {
      "outputs": ["{workspaceRoot}/web/dist/new-page/index.html"]
    }
  }
}
```

This ensures Nx cache invalidation works correctly.

## Step 5: Test Pre-Rendering

```bash
pnpm nx build dashforge-web
```

Verify:

1. Build completes successfully
2. Pre-rendering shows `43/43 pages successful` (or new total)
3. `web/dist/new-page/index.html` exists
4. HTML contains full meta tags
5. Sitemap shows new URL

## Step 6: Test Locally

```bash
npx http-server web/dist -p 8080
```

Open `http://localhost:8080/new-page` and verify:

- Page loads correctly
- View source shows pre-rendered HTML (not empty `<div id="root">`)
- Meta tags are present in `<head>`

---

# 5. Deployment Requirements

## 5.1 Build Output

**Directory**: `web/dist/`

**Contents**:

- `index.html` (pre-rendered homepage)
- `sitemap.xml` (all 42 URLs)
- `robots.txt` (search engine directives)
- `assets/` (JS, CSS bundles)
- 42 pre-rendered route directories with `index.html` files

## 5.2 Server Configuration (Nginx)

**Required**: SPA fallback for client-side navigation

```nginx
server {
  listen 80;
  server_name dashforge-ui.com;
  root /var/www/dashforge/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

**Why**: Pre-rendered HTML serves on first load, SPA router handles client-side navigation.

## 5.3 Pre-Deploy Validation Checklist

Before deploying, verify:

1. ✅ Build completes: `pnpm nx build dashforge-web`
2. ✅ All routes pre-render successfully (42/42)
3. ✅ Sitemap generated: `web/dist/sitemap.xml`
4. ✅ Local preview works: `npx http-server web/dist -p 8080`
5. ✅ View source shows full HTML (not empty `<div id="root">`)
6. ✅ Meta tags present in all pages
7. ✅ No console errors in browser

---

# 6. Testing Standards

## 6.1 Pre-Rendering Tests

Currently **no automated tests** for pre-rendering (manual verification only).

**Future**: Consider adding:

- Integration tests for `prerender.ts` (mock Puppeteer)
- Snapshot tests for generated HTML structure
- Meta tag validation tests

## 6.2 SEO Component Tests

Currently **no automated tests** for SEO component.

**Future**: Consider adding:

- Unit tests for `<SEO>` component rendering
- Tests verifying Helmet generates correct meta tags

---

# 7. Troubleshooting

## 7.1 Pre-Rendering Fails

**Error**: `Error: Failed to launch the browser process`

**Solution**:

```bash
npx puppeteer browsers install chrome
```

---

**Error**: `TimeoutError: Waiting for selector #root > * failed: timeout 30000ms exceeded`

**Solution**:

- Check if page component has SSR-unsafe code (see section 3)
- Verify page renders correctly in browser
- Check browser console for errors

---

**Error**: `EADDRINUSE: address already in port 4300`

**Solution**:

- Pre-rendering script auto-finds free port (4300-4304)
- If all ports busy, kill preview servers: `killall node`

---

## 7.2 Routes Not Pre-Rendering

**Issue**: New route added but not pre-rendering

**Solution**:

1. Verify route added to data file (see section 4, step 3)
2. Verify `generate-routes.ts` includes the route
3. Run `pnpm nx build dashforge-web` and check summary report
4. If route fails, check browser console in Puppeteer screenshot

---

## 7.3 Meta Tags Not Appearing

**Issue**: View source shows empty `<head>`

**Solution**:

1. Verify `<SEO>` component used in page
2. Verify `<HelmetProvider>` wraps app in `main.tsx`
3. Check if pre-rendering completed successfully (see build log)
4. Verify `web/dist/[route]/index.html` contains meta tags

---

# 8. Performance Benchmarks

Current build performance (as of last test):

- **Vite Build**: ~4 seconds
- **Pre-Rendering**: ~30 seconds (42 routes)
- **Sitemap**: ~1 second
- **Total Build Time**: ~40 seconds

**Acceptable Timeout**: 30 seconds per page

---

# 9. Future Enhancements (Optional)

## 9.1 Open Graph Images

Currently using placeholder images in meta tags.

**Todo**:

- Design custom OG images for homepage, starter kits, docs
- Generate dynamic OG images per page (e.g., using `@vercel/og`)

## 9.2 Structured Data (JSON-LD)

Add structured data for better search engine understanding:

- `Organization` schema for homepage
- `Article` schema for docs pages
- `Product` schema for starter kits

## 9.3 RSS Feed

Currently not implemented.

**Todo**: Generate `rss.xml` feed for blog/changelog (if added in future)

---

# 10. References

## Documentation

- `web/PRERENDERING.md` - Developer workflow documentation
- `.opencode/policies/SEO-integration.md` - This file

## Implementation Files

- `web/scripts/prerender.ts` - Pre-rendering script
- `web/scripts/generate-sitemap.ts` - Sitemap generator
- `web/scripts/generate-routes.ts` - Route discovery
- `web/src/components/seo/SEO.tsx` - SEO component
- `web/src/utils/dom.ts` - SSR-safe utilities
- `web/project.json` - Nx build configuration

## Data Files (Route Sources)

- `web/src/pages/StarterKits/data/starterKits.ts` - Starter kit routes
- `web/src/pages/Docs/components/DocsSidebar.model.ts` - Docs routes

---

# Golden Rule

**Every page must be pre-rendered with full meta tags before deployment.**

If a page cannot be pre-rendered, it cannot be deployed to production.
