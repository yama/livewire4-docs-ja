import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [, , url, outputArg = '/tmp/web-ui-review'] = process.argv;

if (!url) {
  console.error('Usage: node capture-web-ui.mjs <URL> [output-directory]');
  process.exit(1);
}

const outputDir = resolve(outputArg);
mkdirSync(outputDir, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.screenshot({
      path: join(outputDir, `${viewport.name}.png`),
      fullPage: true,
    });

    const data = await page.evaluate(() => {
      const visible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };

      const unionBox = (selector) => {
        const boxes = [...document.querySelectorAll(selector)]
          .filter(visible)
          .map((element) => element.getBoundingClientRect());
        if (!boxes.length) return null;
        const left = Math.min(...boxes.map((box) => box.left));
        const top = Math.min(...boxes.map((box) => box.top));
        const right = Math.max(...boxes.map((box) => box.right));
        const bottom = Math.max(...boxes.map((box) => box.bottom));
        return { x: Math.round(left), y: Math.round(top), width: Math.round(right - left), height: Math.round(bottom - top) };
      };

      const rhythmSelectors = [
        ['header', 'header'],
        ['hero-title', '.VPHero .heading'],
        ['hero-tagline', '.VPHero .tagline'],
        ['hero-cta', '.VPHero .VPButton'],
        ['features', '.VPFeatures'],
        ['main-copy', '.vp-doc'],
        ['footer', 'footer'],
      ];
      const rhythm = rhythmSelectors.map(([name, selector]) => ({ name, selector, box: unionBox(selector) }));
      const gaps = rhythm.slice(1).map((current, index) => {
        const previous = rhythm[index];
        if (!previous.box || !current.box) return { from: previous.name, to: current.name, gap: null };
        return {
          from: previous.name,
          to: current.name,
          gap: current.box.y - (previous.box.y + previous.box.height),
        };
      });

      const paragraphs = [...document.querySelectorAll('.vp-doc p')].filter(visible).map((element) => {
        const box = element.getBoundingClientRect();
        return { text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 160), box: { y: Math.round(box.y), height: Math.round(box.height) } };
      });
      const paragraphGaps = paragraphs.slice(1).map((current, index) => ({
        from: index,
        to: index + 1,
        gap: current.box.y - (paragraphs[index].box.y + paragraphs[index].box.height),
      }));

      const typeSelectors = 'h1,h2,h3,h4,h5,h6,p,a,button,.VPHero .name,.VPHero .text,.VPHero .tagline';
      const typography = [...document.querySelectorAll(typeSelectors)].filter(visible).map((element) => {
        const style = getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100),
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          color: style.color,
        };
      });
      const styleGroups = Object.values(typography.reduce((groups, item) => {
        const key = [item.fontSize, item.fontWeight, item.lineHeight, item.color].join('|');
        groups[key] ??= { ...item, count: 0, examples: [] };
        groups[key].count += 1;
        if (groups[key].examples.length < 5) groups[key].examples.push(item.text);
        return groups;
      }, {}));

      const selectors = [
        'header', 'nav', 'main', 'footer', 'h1', 'h2', 'h3',
        '.VPHero .name', '.VPHero .text', '.VPHero .tagline', '.VPHero .actions',
        'article', '.VPFeatures .box', 'p', 'button', 'a', '[class*="card"]', '[class*="feature"]',
      ];
      const elements = selectors.flatMap((selector) =>
        [...document.querySelectorAll(selector)].slice(0, 30).map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            selector,
            tag: element.tagName.toLowerCase(),
            text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 160),
            box: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
            style: {
              display: style.display,
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              lineHeight: style.lineHeight,
              color: style.color,
              backgroundColor: style.backgroundColor,
              margin: style.margin,
              padding: style.padding,
              gap: style.gap,
              borderRadius: style.borderRadius,
            },
          };
        }),
      );

      return {
        title: document.title,
        viewport: { width: innerWidth, height: innerHeight },
        scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
        headings: [...document.querySelectorAll('h1, h2, h3, h4')].map((element) => ({
          level: element.tagName.toLowerCase(),
          text: element.textContent?.trim().replace(/\s+/g, ' '),
        })),
        spacingRhythm: { landmarks: rhythm, gaps, paragraphs, paragraphGaps },
        typography: { items: typography, groups: styleGroups },
        elements,
      };
    });

    results.push({ viewport, data });
    await page.close();
  }
} finally {
  await browser.close();
}

writeFileSync(join(outputDir, 'metrics.json'), `${JSON.stringify({ url, results }, null, 2)}\n`);
console.log(JSON.stringify({ url, outputDir, viewports: viewports.map(({ name }) => name) }, null, 2));
