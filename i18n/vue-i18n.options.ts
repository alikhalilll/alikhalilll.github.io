import { defaultLocale } from '../constants/i18n';

export default defineI18nConfig(() => ({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  missingWarn: false,
  fallbackWarn: false,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
}));
