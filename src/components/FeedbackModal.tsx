import { useState, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { supabase } from '../lib/supabase';

interface Props {
  onClose: () => void;
}

type FeedbackType = 'bug' | 'feature';

export function FeedbackModal({ onClose }: Props) {
  const { t } = useI18n();
  const [type, setType] = useState<FeedbackType>('feature');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setSending(true);
    setError(false);

    try {
      const { error: fnErr } = await supabase.functions.invoke('send-feedback', {
        body: {
          type,
          description: description.trim(),
          email: email.trim() || null,
        },
      });

      if (fnErr) throw fnErr;

      setSent(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl motion-safe:animate-fade-in text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-slate-900 dark:text-white font-medium mb-4">{t.feedback.sent}</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors focus-ring min-h-[44px]"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl motion-safe:animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.feedback.title}</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setType('feature')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors focus-ring min-h-[44px] ${
              type === 'feature'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {t.feedback.feature}
          </button>
          <button
            onClick={() => setType('bug')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors focus-ring min-h-[44px] ${
              type === 'bug'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {t.feedback.bug}
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="feedback-description" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            {t.feedback.description}
          </label>
          <textarea
            ref={textareaRef}
            id="feedback-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.feedback.descriptionPlaceholder}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm resize-none"
            autoFocus
          />
        </div>

        <div className="mb-5">
          <label htmlFor="feedback-email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            {t.feedback.email}
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.feedback.emailPlaceholder}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">{t.feedback.error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-ring min-h-[44px]"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!description.trim() || sending}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring min-h-[44px]"
          >
            {sending ? t.feedback.sending : t.feedback.send}
          </button>
        </div>
      </div>
    </div>
  );
}
