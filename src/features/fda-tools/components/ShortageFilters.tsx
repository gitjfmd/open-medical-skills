/**
 * ShortageFilters — Status pills and classification dropdown.
 *
 * Status filter: All | Ongoing | Terminated | Completed
 * Classification filter: All | Class I | Class II | Class III
 */

import type { ShortageStatus } from '../lib/fda-types';

interface ShortageFiltersProps {
  status: ShortageStatus;
  classification: string;
  onStatusChange: (status: ShortageStatus) => void;
  onClassificationChange: (classification: string) => void;
}

const STATUS_OPTIONS: { value: ShortageStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Terminated', label: 'Terminated' },
  { value: 'Completed', label: 'Completed' },
];

const CLASSIFICATION_OPTIONS = [
  { value: 'all', label: 'All Classifications' },
  { value: 'Class I', label: 'Class I (Dangerous)' },
  { value: 'Class II', label: 'Class II (Moderate)' },
  { value: 'Class III', label: 'Class III (Low Risk)' },
];

export default function ShortageFilters({
  status,
  classification,
  onStatusChange,
  onClassificationChange,
}: ShortageFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status pills */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by status">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onStatusChange(opt.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Classification dropdown */}
      <div className="flex-shrink-0">
        <select
          value={classification}
          onChange={(e) => onClassificationChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-primary"
          aria-label="Filter by classification"
        >
          {CLASSIFICATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
