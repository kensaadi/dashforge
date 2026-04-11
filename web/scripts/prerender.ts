import puppeteer, { Browser } from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import getPort from 'get-port';
import waitOn from 'wait-on';
import { generateRoutes } from './generate-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');

interface RenderResult {
  route: string;
  success: boolean;
  error?: string;
}

/**
 * Start preview server on a free port
 */
async function startPreviewServer(): Promise<{ port: number; process: any }> {
  // Find a free port (try 4300-4304)
  const port = await getPort({ port: [4300, 4301, 4302, 4303, 4304] });

  console.log(`🚀 Starting preview server on port ${port}...`);

  // Start preview server
  const previewProcess = exec(`vite preview --port ${port}`, {
    cwd: join(__dirname, '..'),
  });

  // Attach output handlers for debugging
  previewProcess.stdout?.on('data', (data) => {
    // Suppress vite output unless there's an error
    if (data.includes('error') || data.includes('Error')) {
      console.error(data.toString());
    }
  });

  previewProcess.stderr?.on('data', (data) => {
    console.error(data.toString());
  });

  try {
    // Wait for server to be ready (max 30 seconds)
    await waitOn({
      resources: [`http://localhost:${port}`],
      timeout: 30000,
      interval: 500,
      window: 1000,
    });

    console.log(`✅ Preview server ready on port ${port}\n`);
    return { port, process: previewProcess };
  } catch (error) {
    previewProcess.kill();
    throw new Error(`Failed to start preview server: ${error.message}`);
  }
}

/**
 * Pre-render a single page
 */
async function prerenderPage(
  browser: Browser,
  route: string,
  port: number
): Promise<void> {
  const page = await browser.newPage();

  try {
    const url = `http://localhost:${port}${route}`;

    // Navigate with 30 second timeout
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for React to render
    await page.waitForSelector('#root > *', { timeout: 5000 });

    // Get complete HTML
    const html = await page.content();

    // Determine output path
    const outputPath =
      route === '/'
        ? join(DIST_DIR, 'index.html')
        : join(DIST_DIR, route, 'index.html');

    // Create directory if needed
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write HTML file
    writeFileSync(outputPath, html, 'utf-8');
  } catch (error: any) {
    throw new Error(
      error.name === 'TimeoutError'
        ? 'Timeout after 30s'
        : error.message || 'Unknown error'
    );
  } finally {
    await page.close();
  }
}

/**
 * Print summary report
 */
function printSummary(results: RenderResult[]): void {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('\n========================================');
  console.log('PRE-RENDERING SUMMARY');
  console.log('========================================');
  console.log(`✅ Success: ${successful.length}/${results.length}`);

  if (failed.length > 0) {
    console.log(`⚠️  Failed: ${failed.length}/${results.length}`);
    failed.forEach(({ route, error }) => {
      console.log(`   ❌ ${route} - ${error}`);
    });
  }

  console.log('========================================\n');
}

/**
 * Pre-render all routes
 */
async function prerenderRoutes() {
  console.log('🚀 Starting pre-rendering process...\n');

  const routes = await generateRoutes();
  const results: RenderResult[] = [];

  let previewProcess: any;
  let port: number;

  try {
    // Start preview server
    const server = await startPreviewServer();
    port = server.port;
    previewProcess = server.process;

    console.log(`📄 Found ${routes.length} routes to pre-render\n`);

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      // Pre-render each route
      for (const route of routes) {
        console.log(`  Rendering: ${route}`);

        try {
          await prerenderPage(browser, route, port);
          console.log(`  ✅ ${route}`);
          results.push({ route, success: true });
        } catch (error: any) {
          console.warn(`  ⚠️  ${route} - ${error.message}`);
          results.push({
            route,
            success: false,
            error: error.message || 'Unknown error',
          });
        }
      }
    } finally {
      await browser.close();
    }
  } finally {
    // Always kill preview server
    if (previewProcess) {
      previewProcess.kill();
    }
  }

  // Print summary
  printSummary(results);

  // Exit with code 0 even if some pages failed (warning + continue)
  process.exit(0);
}

prerenderRoutes().catch((error) => {
  console.error('❌ Pre-rendering failed:', error);
  process.exit(1);
});
