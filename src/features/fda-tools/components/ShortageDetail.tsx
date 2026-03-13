/**
 * ShortageDetail — Expandable detail row for a drug enforcement record.
 */

import type { DrugShortage } from '../lib/fda-types';
import { formatFdaDate } from '../lib/fda-api';

interface ShortageDetailProps {
  item: DrugShortage;
}

export default function ShortageDetail({ item }: ShortageDetailProps) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/50 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Product Description */}
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Product Description
          </dt>
          <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {item.product_description || 'N/A'}
          </dd>
        </div>

        {/* Reason for Recall */}
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Reason for Recall
          </dt>
          <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {item.reason || 'N/A'}
          </dd>
        </div>

        {/* Distribution Pattern */}
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Distribution Pattern
          </dt>
          <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {item.distribution_pattern || 'N/A'}
          </dd>
        </div>

        {/* Recall Number */}
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recall Number
          </dt>
          <dd className="mt-1 text-sm font-mono text-slate-700 dark:text-slate-300">
            {item.recall_number}
          </dd>
        </div>

        {/* Recall Initiation Date */}
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recall Initiated
          </dt>
          <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {formatFdaDate(item.recall_initiation_date)}
          </dd>
        </div>

        {/* Termination Date */}
        {item.termination_date && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Terminated
            </dt>
            <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {formatFdaDate(item.termination_date)}
            </dd>
          </div>
        )}

        {/* Product Quantity */}
        {item.product_quantity && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Product Quantity
            </dt>
            <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {item.product_quantity}
            </dd>
          </div>
        )}

        {/* Voluntary / Mandated */}
        {item.voluntary_mandated && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Type
            </dt>
            <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {item.voluntary_mandated}
            </dd>
          </div>
        )}

        {/* Location */}
        {(item.city || item.state || item.country) && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Firm Location
            </dt>
            <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {[item.city, item.state, item.country].filter(Boolean).join(', ')}
            </dd>
          </div>
        )}

        {/* Generic Name */}
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Generic Name
          </dt>
          <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {item.generic_name}
          </dd>
        </div>

        {/* Brand Name */}
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Brand Name
          </dt>
          <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {item.brand_name}
          </dd>
        </div>
      </div>
    </div>
  );
}
