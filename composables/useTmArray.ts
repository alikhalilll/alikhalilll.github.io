export function useTmArray() {
  const { tm } = useI18n();
  return (key: string): string[] => {
    const raw = tm(key) as unknown;
    return Array.isArray(raw) ? (raw as string[]) : [];
  };
}
