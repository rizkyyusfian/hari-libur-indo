import assert from 'node:assert/strict';

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

async function read(route) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
  return { response, body: await response.text() };
}

const count = (value, pattern) => value.match(pattern)?.length ?? 0;

const home = await read('/');
assert.equal(home.response.status, 200, 'Homepage must return HTTP 200');
assert.equal(count(home.body, /<h1(?:\s|>)/g), 1, 'Homepage must contain exactly one H1');
assert.match(home.body, /Kalender Hari Libur Indonesia \d{4}/, 'Homepage needs crawlable title copy');
assert.match(home.body, /Ringkasan terverifikasi/, 'Homepage needs crawlable summary content');
assert.match(
  home.body,
  /penanda ini dapat beririsan dengan kategori nasional atau regional/,
  'Homepage must explain that cuti bersama overlaps the primary categories',
);
assert.ok(count(home.body, /role="row"/g) >= 2, 'Calendar grid needs explicit ARIA rows');
assert.equal(
  home.body.match(/<link rel="canonical" href="([^"]+)"/)?.[1],
  'https://hari-libur-indo.vercel.app',
  'Homepage canonical is missing',
);
assert.ok(count(home.body, /type="application\/ld\+json"/g) >= 2, 'Homepage needs WebSite and WebApplication JSON-LD');

const about = await read('/about');
assert.equal(about.response.status, 200, 'About must return HTTP 200');
assert.equal(count(about.body, /<h1(?:\s|>)/g), 1, 'About must contain exactly one H1');
assert.match(about.body, /<title>Tentang Hari Libur Indo \| Hari Libur Indo<\/title>/, 'About title must be unique');
assert.equal(
  about.body.match(/<link rel="canonical" href="([^"]+)"/)?.[1],
  'https://hari-libur-indo.vercel.app/about',
  'About canonical is missing',
);
assert.match(about.body, /type="application\/ld\+json"/, 'About JSON-LD is missing');

const robots = await read('/robots.txt');
assert.equal(robots.response.status, 200, 'robots.txt must return HTTP 200');
assert.match(robots.body, /Disallow: \/admin\//, 'robots.txt must disallow admin routes');
assert.match(robots.body, /Disallow: \/api\//, 'robots.txt must disallow API routes');
assert.match(robots.body, /Sitemap: https:\/\/hari-libur-indo\.vercel\.app\/sitemap\.xml/, 'robots.txt must advertise the sitemap');

const sitemap = await read('/sitemap.xml');
assert.equal(sitemap.response.status, 200, 'sitemap.xml must return HTTP 200');
const locations = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(locations.sort(), [
  'https://hari-libur-indo.vercel.app/',
  'https://hari-libur-indo.vercel.app/about',
]);
assert.doesNotMatch(sitemap.body, /\/admin|\/api/, 'Sitemap must not expose private or API routes');

const login = await read('/admin/login');
assert.equal(login.response.status, 200, 'Admin login must return HTTP 200');
assert.match(login.body, /<meta name="robots" content="[^"]*noindex[^"]*nofollow/, 'Admin login must be noindex, nofollow');

const missing = await read('/definitely-not-a-route');
assert.equal(missing.response.status, 404, 'Unknown route must return HTTP 404');

console.log(`SEO verification passed for ${baseUrl}`);
