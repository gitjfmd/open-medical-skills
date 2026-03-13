/**
 * TypeScript interfaces for the OpenFDA Drug Enforcement / Shortage data.
 *
 * The OpenFDA enforcement endpoint returns drug recall and enforcement events
 * which include shortage-related actions. We map these to a unified interface
 * that the UI components consume.
 */

/** Raw OpenFDA enforcement result from /drug/enforcement.json */
export interface FdaEnforcementResult {
  recall_number: string;
  reason_for_recall: string;
  status: string;
  distribution_pattern: string;
  product_description: string;
  code_info: string;
  recalling_firm: string;
  report_date: string;
  recall_initiation_date: string;
  termination_date?: string;
  initial_firm_notification?: string;
  event_id: string;
  product_type: string;
  product_quantity?: string;
  voluntary_mandated?: string;
  classification: string;
  city?: string;
  state?: string;
  country?: string;
  center_classification_date?: string;
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    route?: string[];
    substance_name?: string[];
    rxcui?: string[];
    spl_id?: string[];
    package_ndc?: string[];
    application_number?: string[];
  };
}

/** OpenFDA API meta block */
export interface FdaApiMeta {
  disclaimer: string;
  terms: string;
  license: string;
  last_updated: string;
  results: {
    skip: number;
    limit: number;
    total: number;
  };
}

/** Raw OpenFDA API response */
export interface FdaApiResponse {
  meta: FdaApiMeta;
  results: FdaEnforcementResult[];
  error?: {
    code: string;
    message: string;
  };
}

/** Normalized drug shortage / enforcement record for UI consumption */
export interface DrugShortage {
  id: string;
  generic_name: string;
  brand_name: string;
  status: ShortageStatus;
  classification: string;
  recalling_firm: string;
  reason: string;
  product_description: string;
  distribution_pattern: string;
  report_date: string;
  recall_initiation_date: string;
  termination_date?: string;
  product_quantity?: string;
  voluntary_mandated?: string;
  city?: string;
  state?: string;
  country?: string;
  recall_number: string;
}

export type ShortageStatus = 'all' | 'Ongoing' | 'Terminated' | 'Completed';

export interface SearchParams {
  query: string;
  status: ShortageStatus;
  classification: string;
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface ShortageStatsData {
  ongoing: number;
  terminated: number;
  total: number;
}

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  query: '',
  status: 'all',
  classification: 'all',
  page: 1,
  limit: 20,
  sort: 'report_date',
  order: 'desc',
};
