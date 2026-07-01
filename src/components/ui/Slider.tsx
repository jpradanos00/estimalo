interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export function Slider({
  value,
  min = 0.5,
  max = 3,
  step = 0.5,
  onChange,
  label,
  showValue = true,
  formatValue,
}: SliderProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus-ring"
          aria-label={label || 'Slider'}
          style={{ minHeight: '44px' }}
        />
        {showValue && (
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 min-w-[3rem] text-right tabular-nums">
            {formatValue ? formatValue(value) : `×${value.toFixed(1)}`}
          </span>
        )}
      </div>
    </div>
  );
}
