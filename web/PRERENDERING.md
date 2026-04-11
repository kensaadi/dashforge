# Pre-rendering Setup for Dashforge Web

## Overview

This document explains the pre-rendering setup for the Dashforge web application. Pre-rendering generates static HTML files for all routes, improving SEO, performance, and social media sharing.

**Key Feature**: Pre-rendering is now **automatically integrated** into the build process. Every time you run `pnpm nx build dashforge-web`, the app is built, pre-rendered, and sitemap is generated in one command.

## Architecture

### Approach

We use a **custom Puppeteer-based pre-rendering script** integrated with Nx build targets. This gives us:

- Full control over the rendering process
- Better compatibility with Vite 7 and React 19
- Automatic execution on every build
- Resilient error handling (builds complete even if some pages fail)
- Intelligent caching via Nx
- No complex SSR configuration needed

### How It Works

1. **Build phase**: Vite creates the standard SPA build in `dist/`
2. **Preview server**: Script automatically starts a preview server on a free port (4300-4304)
3. **Pre-rendering**: Puppeteer visits each route (with 30s timeout per page) and captures rendered HTML
4. **Error handling**: If a page fails, script continues with a warning (resilient mode)
5. **Output**: Static HTML files written to `dist/` (e.g., `/docs/components/text-field/index.html`)
6. **Sitemap**: `sitemap.xml` is automatically generated with all successfully rendered routes
7. **Cleanup**: Preview server is automatically stopped

All of this happens **automatically** when you run `pnpm nx build dashforge-web`.

## Workflow

### During Development (Daily Work)

```bash
# Start dev server with hot reload
pnpm nx run web:serve

# Or shorthand
pnpm nx serve dashforge-web

# Make changes → hot reload automatically
# NO build needed during development!
```

### Before Release (Deployment)

```bash
# 1. Build complete app (includes pre-rendering + sitemap)
pnpm nx build dashforge-web

# Expected output:
# ✅ Vite build completed (4.2s)
# 🚀 Starting preview server on port 4301...
# ✅ Preview server ready
# 📄 Found 42 routes to pre-render
# ✅ Success: 42/42 pages
# ✅ Sitemap generated (42 URLs)
# ⏱️  Total: ~30-40 seconds

# 2. Test locally
npx http-server web/dist -p 4300

# 3. Verify
# - Open http://localhost:4300
# - View source (Ctrl+U) → check meta tags
# - Disable JS → verify content visible

# 4. Deploy
scp -r web/dist/* user@server:/var/www/dashforge-ui.com/
# or
rsync -avz --delete web/dist/ user@server:/var/www/dashforge-ui.com/
```

## Files Structure

### Core Implementation Files

```
web/
├── project.json                    # Nx target configuration (build includes prerender)
├── scripts/
│   ├── generate-routes.ts         # Auto-generates route list from data
│   ├── prerender.ts               # Puppeteer-based pre-rendering (resilient)
│   └── generate-sitemap.ts        # Sitemap.xml generator
├── src/
│   ├── utils/dom.ts               # SSR-safe DOM utilities
│   └── components/seo/SEO.tsx     # SEO meta tags component
└── public/
    └── robots.txt                  # Search engine directives
```

### Generated Files (dist/)

After build, `web/dist/` contains:

```
dist/
├── index.html                      # Pre-rendered homepage
├── components/index.html           # Pre-rendered components page
├── pricing/index.html              # Pre-rendered pricing page
├── starter-kits/
│   ├── index.html
│   ├── registration-app/index.html
│   ├── admin-dashboard/index.html
│   ├── ecommerce-starter/index.html
│   └── multitenant-saas/index.html
├── docs/
│   ├── getting-started/
│   │   ├── overview/index.html
│   │   ├── installation/index.html
│   │   └── ...
│   ├── components/
│   │   ├── text-field/index.html
│   │   ├── select/index.html
│   │   └── ...
│   └── ...
├── sitemap.xml                     # Auto-generated sitemap
├── robots.txt                      # Search engine config
└── assets/                         # JS, CSS, images
```

## Routes Pre-rendered

**Total: ~42 routes**

- `/` - Homepage
- `/components` - Components overview
- `/pricing` - Pricing page
- `/starter-kits` - Starter kits listing
- `/starter-kits/:kitId` - 4 kit detail pages
- `/docs/...` - ~35 documentation pages

The exact count is determined dynamically by `generate-routes.ts` based on your data files.

## Configuration

### Nx Build Target (`web/project.json`)

```json
{
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "commands": [
          "vite build", // ← Vite build
          "npm run prerender", // ← Pre-render all pages
          "npm run sitemap" // ← Generate sitemap
        ],
        "parallel": false
      },
      "cache": true,
      "outputs": [
        "{projectRoot}/dist",
        "{projectRoot}/dist/sitemap.xml",
        "{projectRoot}/dist/docs/**/index.html"
        // ... all pre-rendered routes
      ]
    }
  }
}
```

### Preview Server Configuration

The pre-render script automatically:

- Finds a free port (tries 4300, 4301, 4302, 4303, 4304)
- Starts `vite preview` on that port
- Waits for server to be ready (polling with timeout)
- Uses that port for pre-rendering
- Kills server after completion

**No manual server management needed!**

## Error Handling

### Resilient Mode (Default)

If a page fails to render (timeout, navigation error, etc.), the build **continues** with a warning:

```bash
✅ /docs/components/text-field
⚠️  /docs/components/broken-page - Timeout after 30s
✅ /docs/components/select

========================================
PRE-RENDERING SUMMARY
========================================
✅ Success: 41/42
⚠️  Failed: 1/42
   ❌ /docs/components/broken-page - Timeout after 30s
========================================
```

**Result:**

- 41 pages are successfully pre-rendered
- Build completes (exit code 0)
- You can deploy immediately
- Investigate the failed page separately

### Common Errors

**Timeout after 30s:**

- Page takes too long to load
- Network issues
- Heavy JavaScript computation

**Solution**: Investigate the specific page, optimize loading time, or increase timeout in `prerender.ts`

**Preview server failed to start:**

- All ports (4300-4304) occupied

**Solution**:

```bash
# Kill processes on port 4300
lsof -ti:4300 | xargs kill -9
```

**Chrome not found:**

- Puppeteer Chrome not installed

**Solution**:

```bash
npx puppeteer browsers install chrome
```

## Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "react-helmet-async": "^3.0.0",
    "@mui/system": "^7.3.8",
    "@mui/styled-engine": "^7.3.8"
  }
}
```

### Development Dependencies (Workspace Root)

```json
{
  "devDependencies": {
    "puppeteer": "^24.40.0",
    "tsx": "^4.21.0",
    "get-port": "^7.0.0",
    "wait-on": "^8.0.1"
  }
}
```

## SSR-Safety

The following components were refactored to be SSR-safe:

1. **DocsPage.tsx**: Uses `scrollToTop()` wrapper instead of `window.scrollTo`
2. **DocsToc.tsx**: Uses DOM utility wrappers for scroll tracking
3. **LiveTypingCodeBlock.tsx**: Uses `matchMedia()` wrapper for reduced motion detection

All changes use `web/src/utils/dom.ts` utilities:

```typescript
import { scrollToTop, getElementById, matchMedia } from '../utils/dom';

// Safe to use during SSR/pre-rendering
scrollToTop();
const el = getElementById('my-element');
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
```

## SEO Component

**Location**: `web/src/components/seo/SEO.tsx`

Add to any page for better SEO:

```typescript
import { SEO } from '../../components/seo/SEO';

export function YourPage() {
  return (
    <>
      <SEO
        title="Page Title"
        description="Page description for search engines"
        path="/your-page"
        ogImage="/path/to/image.png" // Optional
      />
      {/* Page content */}
    </>
  );
}
```

**Includes:**

- Title and description tags
- Canonical URLs
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Plausible Analytics script (domain: `dashforge-ui.com`)

## Adding New Routes

### Step 1: Add Route Data

**For static routes**, add to `web/scripts/generate-routes.ts`:

```typescript
const routes: string[] = [
  '/',
  '/components',
  '/your-new-route', // ← Add here
];
```

**For docs routes**, add to `DocsSidebar.model.ts`:

```typescript
{
  type: 'link',
  label: 'Your New Page',
  path: '/docs/your-new-page',
}
```

**For starter kits**, add to `starterKits.ts`:

```typescript
export const starterKits: StarterKit[] = [
  {
    id: 'new-kit',
    name: 'New Kit',
    // ...
  },
];
```

### Step 2: Update Nx Outputs (IMPORTANT!)

Edit `web/project.json` and add the new route pattern to `outputs`:

```json
{
  "build": {
    "outputs": [
      "{projectRoot}/dist",
      "{projectRoot}/dist/sitemap.xml",
      "{projectRoot}/dist/your-new-route/index.html" // ← Add this
      // ... existing outputs
    ]
  }
}
```

This ensures Nx cache correctly tracks the new pre-rendered files.

### Step 3: Rebuild

```bash
pnpm nx build dashforge-web
```

The new route will be automatically:

- Pre-rendered by Puppeteer
- Included in sitemap.xml
- Cached by Nx

## Deployment

### Digital Ocean / Static Hosting

1. **Build locally:**

   ```bash
   pnpm nx build dashforge-web
   ```

2. **Upload files:**

   ```bash
   # Using SCP
   scp -r web/dist/* user@server:/var/www/dashforge-ui.com/

   # Using rsync (recommended)
   rsync -avz --delete web/dist/ user@server:/var/www/dashforge-ui.com/
   ```

3. **Configure server** (see below)

### Nginx Configuration

```nginx
server {
    server_name dashforge-ui.com;
    root /var/www/dashforge-ui.com;

    index index.html;

    # Try file, then directory, then directory/index.html, finally fallback to /index.html
    location / {
        try_files $uri $uri/ $uri/index.html /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Allow robots.txt and sitemap.xml
    location = /robots.txt { }
    location = /sitemap.xml { }
}
```

### Apache (.htaccess)

```apache
RewriteEngine On

# If file/directory exists, serve it
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Otherwise fallback to index.html
RewriteRule ^ /index.html [L]
```

## Validation (Pre-Deploy Checklist)

Before deploying, verify locally:

```bash
# 1. Check files exist
ls -la web/dist/docs/components/text-field/index.html
ls -la web/dist/sitemap.xml

# 2. Verify HTML is pre-rendered (should be >100 lines, not 56)
wc -l web/dist/index.html

# 3. Check meta tags present
grep "og:title" web/dist/index.html
grep "og:description" web/dist/index.html

# 4. Count sitemap URLs (should be ~42)
grep -c "<loc>" web/dist/sitemap.xml

# 5. Test with http-server
npx http-server web/dist -p 4300

# 6. Open browser and verify:
#    - View source shows rendered HTML (not empty)
#    - Disable JavaScript → content still visible
#    - Meta tags present in <head>
```

### After Deployment

1. **View source** - HTML should contain rendered content
2. **Check meta tags** - Title, description, OG tags present
3. **Test social sharing**:
   - [Facebook Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
4. **Verify sitemap** - `https://dashforge-ui.com/sitemap.xml`
5. **Check robots.txt** - `https://dashforge-ui.com/robots.txt`
6. **Run Lighthouse** - Should score 100 on SEO

## Troubleshooting

### "Nx cache is stale, files missing from dist/"

**Problem**: Nx used cached build but `dist/` was deleted manually.

**Solution**:

```bash
pnpm nx reset
pnpm nx build dashforge-web
```

### "Build is slow (~40 seconds)"

**Expected behavior**. Pre-rendering 42 pages with Puppeteer takes time.

**Optimization**: Use `pnpm nx serve dashforge-web` during development (instant hot reload). Only run `build` before deployment.

### "Some pages fail with timeout"

**Diagnosis**: Check which pages failed in the pre-rendering summary.

**Solutions**:

- Optimize page loading (reduce bundle size, lazy load components)
- Increase timeout in `web/scripts/prerender.ts` (change `timeout: 30000` to higher value)
- Check for infinite loops or heavy computations on that page

### "Preview server port conflict"

**Problem**: All ports 4300-4304 are occupied.

**Solution**:

```bash
# Find and kill processes
lsof -ti:4300 | xargs kill -9
lsof -ti:4301 | xargs kill -9
```

Or extend the port range in `prerender.ts`:

```typescript
const port = await getPort({
  port: [4300, 4301, 4302, 4303, 4304, 4305, 4306],
});
```

### "window is not defined" errors

**Problem**: Component accesses browser APIs during pre-rendering.

**Solution**: Use SSR-safe wrappers from `web/src/utils/dom.ts`:

```typescript
// ❌ Bad
window.scrollTo(0, 0);

// ✅ Good
import { scrollToTop } from '../utils/dom';
scrollToTop();
```

## Performance Notes

**Build time breakdown:**

- Vite build: ~4 seconds
- Pre-rendering (42 pages): ~25-35 seconds
- Sitemap generation: ~1 second
- **Total: ~30-40 seconds**

This is **acceptable** since you only build before deployment (not during development).

**Development workflow** remains fast:

- `pnpm nx serve dashforge-web` - Instant startup, hot reload
- No build needed during development

## Analytics

Plausible Analytics is included in the SEO component for privacy-friendly analytics:

```html
<script
  defer
  data-domain="dashforge-ui.com"
  src="https://plausible.io/js/script.js"
></script>
```

Configure the domain in `web/src/components/seo/SEO.tsx` if needed.

## Next Steps (Optional Enhancements)

- [ ] Add SEO components to remaining pages (ComponentsPage, PricingPage, DocsPage with dynamic titles)
- [ ] Implement dynamic OG images per route (using Vercel OG Image or similar)
- [ ] Add structured data (JSON-LD) for richer search results
- [ ] Set up Google Search Console
- [ ] Monitor Plausible Analytics dashboard
- [ ] Add sitemap to Google Search Console and Bing Webmaster Tools

## References

- [react-helmet-async documentation](https://github.com/staylor/react-helmet-async)
- [Puppeteer documentation](https://pptr.dev/)
- [Sitemap protocol](https://www.sitemaps.org/protocol.html)
- [Open Graph protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Nx caching](https://nx.dev/concepts/how-caching-works)
