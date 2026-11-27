import { writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { pathToFileURL } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { chromium } from 'playwright';

const [url, output] = process.argv.slice(2);
if (!url || !output) throw new Error('Usage: node scripts/benchmark.mjs <url> <output.json>');
const { default: lighthouse } = await import(
  process.env.UI_LIGHTHOUSE_ENTRY
    ? pathToFileURL(process.env.UI_LIGHTHOUSE_ENTRY).href
    : 'lighthouse'
);
const socket = createServer();
const port = await new Promise((resolve, reject) => {
  socket.once('error', reject);
  socket.listen(0, '127.0.0.1', () => {
    const address = socket.address();
    socket.close(() => resolve(address.port));
  });
});
if (!port) throw new Error('Cannot allocate a Chrome debugging port.');

const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
try {
  const results = [];
  const count = Number(process.env.UI_BENCH_RUNS || '3');
  for (let run = 0; run < count; run += 1) {
    const { lhr } = await lighthouse(url, {
      port,
      onlyCategories: ['performance'],
      logLevel: 'error',
    });
    if (lhr.runtimeError) throw new Error(lhr.runtimeError.message);
    const requests = lhr.audits['network-requests'].details.items;
    results.push({
      requests: requests.length,
      transferred: requests.reduce((total, request) => total + request.transferSize, 0),
      fcp: lhr.audits['first-contentful-paint'].numericValue,
      lcp: lhr.audits['largest-contentful-paint'].numericValue,
      tbt: lhr.audits['total-blocking-time'].numericValue,
      cls: lhr.audits['cumulative-layout-shift'].numericValue,
      performance: lhr.categories.performance.score * 100,
    });
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const origin = new URL(url).origin;
  const errors = [];
  const assets = new Map();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  page.on('response', (response) => {
    if (!response.url().startsWith(origin + '/')) return;
    const type = response.request().resourceType();
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (['document', 'script', 'stylesheet'].includes(type) && response.ok()) {
      assets.set(
        response.url(),
        response.body().then((body) => ({
          type,
          raw: body.length,
          gzip: gzipSync(body).length,
          brotli: brotliCompressSync(body).length,
        })),
      );
    }
  });
  await page.coverage.startCSSCoverage();
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  if (!response?.ok()) throw new Error(`Unexpected response: ${response?.status()}`);
  const coverage = await page.coverage.stopCSSCoverage();
  const hints = await page
    .locator('link[rel="preload"],link[rel="modulepreload"],link[rel="prefetch"]')
    .evaluateAll((links) =>
      links.map((link) => ({ rel: link.rel, as: link.as, href: link.getAttribute('href') })),
    );
  const sum = (values) => values.reduce((total, value) => total + value, 0);
  const median = Object.fromEntries(
    Object.keys(results[0]).map((key) => [
      key,
      results.map((run) => run[key]).sort((a, b) => a - b)[Math.floor(count / 2)],
    ]),
  );
  const record = {
    url,
    median,
    results,
    hints,
    coverage: {
      total: sum(coverage.map((item) => item.text.length)),
      used: sum(coverage.flatMap((item) => item.ranges.map((range) => range.end - range.start))),
    },
    assets: Object.fromEntries(
      await Promise.all([...assets].map(async ([key, data]) => [key, await data])),
    ),
    errors,
  };
  writeFileSync(output, JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify({ median, coverage: record.coverage, errors }));
} finally {
  await browser.close();
}
