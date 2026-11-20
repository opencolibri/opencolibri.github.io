import en from './en.json';

type LocaleCatalog = typeof en;

export type Locale = string;

const catalogModules = import.meta.glob<LocaleCatalog>('./*.json', {
  eager: true,
  import: 'default',
});

export const localeCatalogs = Object.fromEntries(
  Object.entries(catalogModules).map(([path, catalog]) => [
    path.replace(/^\.\//, '').replace(/\.json$/, ''),
    catalog,
  ]),
) as Record<Locale, LocaleCatalog>;

export const localeConfig = Object.entries(localeCatalogs)
  .map(([code, catalog]) => ({ code, ...catalog.locale }))
  .sort((a, b) => a.code.localeCompare(b.code));

export const locales = localeConfig.map((locale) => locale.code);

export const defaultLocale: Locale = 'en';

export function detectLocale(browserLanguage: string): Locale {
  const lang = browserLanguage.toLowerCase();
  for (const locale of localeConfig) {
    if (locale.match.some((prefix) => lang === prefix || lang.startsWith(`${prefix}-`))) {
      return locale.code;
    }
  }
  return defaultLocale;
}

function leafKeys(value: unknown, path = ''): string[] {
  if (path === 'locale.match') {
    return [path];
  }
  if (Array.isArray(value)) {
    return value.flatMap((child, index) => leafKeys(child, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => leafKeys(child, path ? `${path}.${key}` : key));
  }
  return [path];
}

function isPrefixList(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  return value.every((prefix) => typeof prefix === 'string' && prefix !== '');
}

function catalogProblems(code: string, catalog: LocaleCatalog, referenceKeys: Set<string>): string[] {
  const keys = new Set(leafKeys(catalog));
  const missing = [...referenceKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !referenceKeys.has(key));
  const problems = [
    ...missing.map((key) => `${code}.json: missing "${key}"`),
    ...extra.map((key) => `${code}.json: unknown "${key}"`),
  ];
  if (!isPrefixList(catalog.locale?.match)) {
    problems.push(`${code}.json: "locale.match" must be a non-empty list of language prefixes`);
  }
  return problems;
}

const referenceKeys = new Set(leafKeys(localeCatalogs[defaultLocale]));
const problems = Object.entries(localeCatalogs).flatMap(([code, catalog]) =>
  catalogProblems(code, catalog, referenceKeys),
);
if (problems.length > 0) {
  throw new Error(`Translations do not match ${defaultLocale}.json:\n  ${problems.join('\n  ')}`);
}
