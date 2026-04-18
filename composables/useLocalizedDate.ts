export function useLocalizedDate() {
  const { locale, t } = useI18n();

  const toDate = (value: string | number | Date) =>
    value instanceof Date ? value : new Date(value);

  const formatDate = (
    value: string | Date,
    opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  ) => toDate(value).toLocaleDateString(locale.value, opts);

  const formatMonthYear = (value: string | Date) => {
    const d = toDate(value);
    const month = new Intl.NumberFormat(locale.value, { minimumIntegerDigits: 2 }).format(
      d.getMonth() + 1
    );
    const year = new Intl.NumberFormat(locale.value, { useGrouping: false }).format(
      d.getFullYear()
    );
    return `${month}/${year}`;
  };

  const formatPeriod = (start: string | Date, end?: string | Date | null) => {
    // Isolate each date token so `/` stays between month and year (numerics
    // are weak LTR and would reorder in an RTL paragraph otherwise). The
    // surrounding separator and "Present" word flow with the paragraph.
    const iso = (s: string) => `\u2066${s}\u2069`;
    const s = iso(formatMonthYear(start));
    const e = end ? iso(formatMonthYear(end)) : t('common.present');
    return `${s} — ${e}`;
  };

  const formatYear = (value: string | number | Date) => {
    const year = typeof value === 'number' ? value : toDate(value).getFullYear();
    return new Intl.NumberFormat(locale.value, { useGrouping: false }).format(year);
  };

  return { formatDate, formatMonthYear, formatPeriod, formatYear };
}
