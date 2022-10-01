type properties = {
  [key: string]: string | properties;
};

export default class Internationalization {
  private properties: properties = {};
  private constructor() {
    // use factory method
  }
  static async factory(locale?: string): Promise<Internationalization> {
    if (!locale) locale = getLocale();
    const i18n = new Internationalization();
    await i18n.load(locale).catch(() => i18n.load('en'));
    return i18n;
  }
  private async load(locale: string) {
    await import(`@/locales/${locale}.json`).then((properties) => {
      this.properties = properties;
    });
  }
  get(key: string, ...args: string[]): string | undefined {
    let properties = this.properties;
    for (const k of key.split('.')) {
      const item = properties[k];
      if (!item) return item;
      if (typeof item === 'string') {
        return item.replace(/{(\d+)}/g, (substring, index) => {
          return args.length > index ? args[index] : '';
        });
      }
      properties = item;
    }
  }
}

export const getLocale = (): string => {
  const search = global.location.search;
  const params = new URLSearchParams(
    search.startsWith('?') ? search.substr(1) : search
  );
  return params.get('locale') || 'en';
};
