export type InterpolationValues = Record<string, string | number>;

export class TranslationResolver {
  static resolve(
    key: string, 
    resources: Record<string, any>, 
    values?: InterpolationValues, 
    fallbackResources?: Record<string, any>
  ): string {
    const keys = key.split('.');
    let result: any = resources;

    for (const k of keys) {
      if (result === undefined || result === null) break;
      result = result[k];
    }

    if (result === undefined && fallbackResources) {
      result = fallbackResources;
      for (const k of keys) {
        if (result === undefined || result === null) break;
        result = result[k];
      }
    }

    if (result === undefined) {
      console.warn(`[QEOS i18n] Missing translation key: ${key}`);
      return `[${key}]`;
    }

    if (typeof result !== 'string') {
      console.warn(`[QEOS i18n] Translation key is not a string: ${key}`);
      return `[${key}]`;
    }

    if (values) {
      return this.interpolate(result, values);
    }

    return result;
  }

  static interpolate(template: string, values: InterpolationValues): string {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      return values[key] !== undefined ? String(values[key]) : match;
    });
  }
}
