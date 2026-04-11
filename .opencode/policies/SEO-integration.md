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

### ✅ Fully Implemented (42/42 routes - 100% coverage)

**Static Pages** (3 routes):

- **HomePage** (`web/src/pages/Home/HomePage.tsx`):

  - Title: "React Form Management Library"
  - Custom description highlighting enterprise features
  - Open Graph + Twitter Card tags
  - Type: `website`

- **ComponentsPage** (`web/src/pages/ComponentsPage.tsx`):

  - Title: "Components"
  - Description: Browse all Dashforge-UI components
  - Type: `website`

- **PricingPage** (`web/src/pages/PricingPage.tsx`):
  - Title: "Pricing"
  - Description: Pricing plans for teams and enterprises
  - Type: `website`

**Starter Kits** (5 routes):

- **StarterKitsPage** (`web/src/pages/StarterKits/StarterKitsPage.tsx`):

  - Title: "Starter Kits"
  - Description: Production-ready starter kits collection
  - Type: `website`

- **StarterKitDetailPage** (`web/src/pages/StarterKits/StarterKitDetailPage.tsx`):
  - **Dynamic SEO** from kit data (4 kits)
  - Title: `kit.name` (e.g., "Registration Kit", "Admin Dashboard")
  - Description: `kit.longDescription` (specific to each kit)
  - Type: `article`

**Docs Pages** (34 routes):

- **DocsPage** (`web/src/pages/Docs/DocsPage.tsx`):
  - **Dynamic SEO** with `getDocsSEO()` helper function
  - **34 specific descriptions** mapped per route
  - Type: `article`

**Docs Categories**:

- Getting Started: 5 pages (overview, why-dashforge, installation, usage, project-structure)
- UI Components: 14 pages (text-field, textarea, number-field, select, autocomplete, checkbox, radio-group, switch, date-time-picker, appshell, breadcrumbs, top-bar, confirm-dialog, snackbar, button)
- Form System: 6 pages (overview, quick-start, reactions, dynamic-forms, patterns, api)
- Access Control: 5 pages (overview, quick-start, core-concepts, dashforge, playground)
- Theme System: 1 page (design-tokens)
- Guides: 2 pages (troubleshooting, testing)
- Architecture: 1 page (project-structure)

**SEO Metadata Quality**:

- All descriptions are 120-160 characters (optimal for search results)
- All descriptions mention "Dashforge" or "DashForm" for brand recognition
- All descriptions include primary keywords (component name, features, "React", "TypeScript")
- All descriptions highlight key capabilities (validation, RBAC, form integration)
- All descriptions are technical and value-focused (no marketing fluff)

**Social Media Coverage**:

- ✅ All 42 routes have Open Graph tags (Facebook, LinkedIn)
- ✅ All 42 routes have Twitter Card tags
- ✅ All 42 routes have canonical URLs
- ✅ All 42 routes use default OG image (`/icons/icon-512x512.png`)
- ✅ Tested with Facebook Debugger and Twitter Card Validator

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

## Pages with SEO Implementation

- `web/src/pages/Home/HomePage.tsx` - Static SEO
- `web/src/pages/ComponentsPage.tsx` - Static SEO
- `web/src/pages/PricingPage.tsx` - Static SEO
- `web/src/pages/StarterKits/StarterKitsPage.tsx` - Static SEO
- `web/src/pages/StarterKits/StarterKitDetailPage.tsx` - Dynamic SEO (from kit data)
- `web/src/pages/Docs/DocsPage.tsx` - Dynamic SEO (from `getDocsSEO()` helper with 34 specific descriptions)

---

# 11. SEO Metadata Maintenance

## Adding New Docs Pages

When adding a new documentation page:

1. **Add route** to `web/src/pages/Docs/components/DocsSidebar.model.ts`
2. **Add SEO metadata** to `getDocsSEO()` function in `web/src/pages/Docs/DocsPage.tsx`:
   ```tsx
   '/docs/new-section/new-page': {
     title: 'Page Title',
     description: 'Specific description for this page (120-160 chars).',
   },
   ```
3. **Update outputs** in `web/project.json`:
   ```json
   "{workspaceRoot}/web/dist/docs/new-section/new-page/index.html"
   ```
4. **Rebuild and verify**:
   ```bash
   pnpm nx build dashforge-web
   # Verify meta tags in: web/dist/docs/new-section/new-page/index.html
   ```

## SEO Description Guidelines

All descriptions should:

- **Length**: 120-160 characters (optimal for search results)
- **Branding**: Mention "Dashforge" or "DashForm" for brand recognition
- **Keywords**: Include primary keywords (component name, feature, "React", "TypeScript")
- **Features**: Highlight key capabilities (validation, RBAC, form integration)
- **Tone**: Technical and value-focused (avoid marketing fluff)
- **Punctuation**: End with a period

**Good Example**:

```
"TextField component with form integration, validation, RBAC support, and conditional rendering. Built on Material-UI with DashForm capabilities."
```

(147 characters - mentions component name, key features, and Dashforge ecosystem)

**Bad Example**:

```
"The best TextField you'll ever use! Amazing features and incredible performance!"
```

(Too vague, no specific features, marketing fluff, no brand mention)

## Adding New Starter Kits

When adding a new starter kit:

1. **Add kit data** to `web/src/pages/StarterKits/data/starterKits.ts`:

   ```tsx
   {
     id: 'new-kit',
     name: 'Kit Name',
     longDescription: 'Detailed description for SEO (will be used as meta description)',
     // ... other fields
   }
   ```

2. **Update outputs** in `web/project.json`:

   ```json
   "{workspaceRoot}/web/dist/starter-kits/new-kit/index.html"
   ```

3. **No code changes needed** - `StarterKitDetailPage.tsx` uses dynamic SEO from kit data

4. **Rebuild and verify**:
   ```bash
   pnpm nx build dashforge-web
   # Verify: web/dist/starter-kits/new-kit/index.html
   ```

## Updating Existing SEO Metadata

To update SEO for existing pages:

1. **Static pages** (HomePage, ComponentsPage, PricingPage, StarterKitsPage):

   - Edit the `<SEO>` component props directly in the page file

2. **Docs pages**:

   - Edit the `getDocsSEO()` function in `web/src/pages/Docs/DocsPage.tsx`
   - Find the route path key and update title/description

3. **Starter kits**:

   - Edit `longDescription` field in `web/src/pages/StarterKits/data/starterKits.ts`

4. **Rebuild** after changes to see updated meta tags in pre-rendered HTML

## Testing SEO Changes

After making SEO changes:

1. **Local build**:

   ```bash
   pnpm nx build dashforge-web
   ```

2. **Verify HTML**:

   ```bash
   # Check meta tags in generated HTML
   cat web/dist/[route-path]/index.html | grep 'og:title\|og:description'
   ```

3. **Preview locally**:

   ```bash
   npx http-server web/dist -p 8080
   # Open browser and View Source
   ```

4. **Test with social media validators** (after deployment):
   - Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator

---

# Golden Rule

**Every page must be pre-rendered with full meta tags before deployment.**

If a page cannot be pre-rendered, it cannot be deployed to production.

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
