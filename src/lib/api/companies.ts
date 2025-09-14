import { get } from './client';
import type { CompaniesResponse, Company } from './types';

export async function fetchCompaniesCount() {
  const json = await get<CompaniesResponse>('/api/companies');
  return json.total;
}

export async function fetchCompaniesList(): Promise<Company[]> {
  const json = await get<CompaniesResponse>('/api/companies');
  return json.data;
}
