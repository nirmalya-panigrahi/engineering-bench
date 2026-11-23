import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

const HTML_PATH = path.resolve(__dirname, '../index.html');
const rawHtml = fs.readFileSync(HTML_PATH, 'utf-8');

/**
 * Pure WCAG 2.1 relative luminance & contrast ratio helpers for palette verification.
 */
function srgbToLinear(channel255: number): number {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function createDom(options?: {
  reducedMotion?: boolean;
  breakStorage?: boolean;
  removeIntersectionObserver?: boolean;
}) {
  const dom = new JSDOM(rawHtml, {
    runScripts: 'dangerously',
    url: 'https://nirmalya-panigrahi.github.io/Engineering-Benches/',
    beforeParse(window) {
      window.matchMedia = ((query: string) => ({
        matches:
          query.includes('prefers-reduced-motion') && Boolean(options?.reducedMotion),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;

      if (options?.breakStorage) {
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new DOMException('Storage disabled', 'SecurityError');
          },
        });
      }

      if (options?.removeIntersectionObserver) {
        Reflect.deleteProperty(window, 'IntersectionObserver');
      }
    },
  });
  return dom;
}

describe('Engineering Benches Folio — Blue Pill (Happy Path)', () => {
  it('contains valid SEO metadata, canonical link, and 4-tool ItemList JSON-LD', () => {
    const dom = createDom();
    const doc = dom.window.document;

    expect(doc.title).toBe('Engineering Benches – Four Browser Engineering Tools');
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc!.length).toBeGreaterThanOrEqual(100);

    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(canonical).toContain('Engineering-Benches');

    const ldScript = doc.querySelector('script[type="application/ld+json"]');
    expect(ldScript).not.toBeNull();
    const jsonLd = JSON.parse(ldScript!.textContent || '{}');
    expect(jsonLd['@type']).toBe('ItemList');
    expect(jsonLd.numberOfItems).toBe(4);
    expect(jsonLd.itemListElement).toHaveLength(4);
    expect(jsonLd.itemListElement[0].url).toBe(
      'https://nirmalya-panigrahi.github.io/Structural-Engineering-Bench/'
    );
    expect(jsonLd.itemListElement[3].url).toBe(
      'https://nirmalya-panigrahi.github.io/Circuit-Bench-Lab/'
    );
  });

  it('renders single H1, title block strip, 4 index rows, 4 plates, and exact footer', () => {
    const dom = createDom();
    const doc = dom.window.document;

    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelector('.tb-sheet')?.textContent).toContain('Sheet 1 of 4');
    expect(doc.querySelector('.tb-brand')?.textContent).toContain('Engineering Benches');
    expect(doc.querySelector('.tb-nav')).toBeNull();

    const indexRows = doc.querySelectorAll('.index-row');
    expect(indexRows).toHaveLength(4);
    expect(indexRows[0].getAttribute('href')).toBe('#plate-1');
    expect(indexRows[1].getAttribute('href')).toBe('#plate-2');
    expect(indexRows[2].getAttribute('href')).toBe('#plate-3');
    expect(indexRows[3].getAttribute('href')).toBe('#plate-4');

    const plates = doc.querySelectorAll('.plate');
    expect(plates).toHaveLength(4);

    const buttons = Array.from(doc.querySelectorAll('.btn-bench'));
    expect(buttons).toHaveLength(4);
    expect(buttons.map((b) => b.getAttribute('href'))).toEqual([
      'https://nirmalya-panigrahi.github.io/Structural-Engineering-Bench/',
      'https://nirmalya-panigrahi.github.io/Process-Engineering-Bench/',
      'https://nirmalya-panigrahi.github.io/Control-Engg-Bench/',
      'https://nirmalya-panigrahi.github.io/Circuit-Bench-Lab/',
    ]);

    const footerText = doc.querySelector('.folio-footer')?.textContent?.trim();
    expect(footerText).toBe('Find more tools at: https://nirmalya-panigrahi.github.io/');
    expect(doc.querySelector('.folio-footer a')?.getAttribute('href')).toBe(
      'https://nirmalya-panigrahi.github.io/'
    );
  });

  it('toggles between Daylight Parchment and Lamplit Dark theme cleanly', () => {
    const dom = createDom();
    const doc = dom.window.document;
    const toggle = doc.getElementById('theme-toggle') as HTMLButtonElement;
    const label = doc.getElementById('theme-toggle-label')!;

    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(label.textContent).toBe('Lamplit');

    toggle.click();
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(label.textContent).toBe('Daylight');
    expect(dom.window.localStorage.getItem('benches-theme')).toBe('dark');

    toggle.click();
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(label.textContent).toBe('Lamplit');
  });

  it('marks hero and plates drawn immediately when prefers-reduced-motion is active', () => {
    const dom = createDom({ reducedMotion: true });
    const doc = dom.window.document;

    expect(doc.getElementById('hero')?.classList.contains('is-drawn')).toBe(true);
    const plates = Array.from(doc.querySelectorAll('.plate'));
    expect(plates.every((p) => p.classList.contains('is-drawn'))).toBe(true);
  });

  it('meets WCAG AA (>= 4.5:1) contrast for all readable text tokens in light & dark themes', () => {
    // Light theme parchment #F1E8D4
    expect(contrastRatio('#3B3A38', '#F1E8D4')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#5C5A55', '#F1E8D4')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#1F4E79', '#F1E8D4')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#8A5A2B', '#F1E8D4')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#9E442F', '#F1E8D4')).toBeGreaterThanOrEqual(4.5);

    // Dark theme lamplit paper #26211A
    expect(contrastRatio('#D8D2C4', '#26211A')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#B2AA9B', '#26211A')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#7FB0DB', '#26211A')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#1A1611', '#7FB0DB')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#E58C75', '#26211A')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('Engineering Benches Folio — Red Pill (Adversarial & Edge Cases)', () => {
  it('survives disabled localStorage (SecurityError) without crashing theme toggle', () => {
    const dom = createDom({ breakStorage: true });
    const doc = dom.window.document;
    const toggle = doc.getElementById('theme-toggle') as HTMLButtonElement;

    expect(() => toggle.click()).not.toThrow();
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('gracefully reveals all plates when IntersectionObserver is unavailable', () => {
    const dom = createDom({ removeIntersectionObserver: true });
    const doc = dom.window.document;

    expect(doc.getElementById('hero')?.classList.contains('is-drawn')).toBe(true);
    const plates = Array.from(doc.querySelectorAll('.plate'));
    expect(plates.every((p) => p.classList.contains('is-drawn'))).toBe(true);
  });

  it('contains zero CSS gradients, zero external framework scripts, and proper aria-hidden on decorative SVGs', () => {
    expect(rawHtml).not.toMatch(/linear-gradient|radial-gradient|conic-gradient/i);
    expect(rawHtml).not.toMatch(/react|vue|svelte|angular|tailwind/i);

    const dom = createDom();
    const doc = dom.window.document;

    const decorativeSvgs = Array.from(
      doc.querySelectorAll('.plate-svg, .hero-instruments svg, .hero-ruler-svg, .paper-grain, .drawn-pin')
    );
    expect(decorativeSvgs.length).toBeGreaterThanOrEqual(6);
    for (const svg of decorativeSvgs) {
      const hiddenParent = svg.closest('[aria-hidden="true"]');
      expect(svg.getAttribute('aria-hidden') === 'true' || hiddenParent !== null).toBe(true);
    }
  });
});
