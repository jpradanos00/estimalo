import { useI18n } from '../../hooks/useI18n';

export function LangToggle() {
  const { locale, setLocale } = useI18n();

  const next = locale === 'es' ? 'en' : 'es';

  return (
    <button
      onClick={() => setLocale(next)}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold uppercase transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus-ring text-slate-500 dark:text-slate-400"
      aria-label={`Switch to ${next === 'es' ? 'Spanish' : 'English'}`}
    >
      {next === 'es' ? 'ES' : 'EN'}
    </button>
  );
}
