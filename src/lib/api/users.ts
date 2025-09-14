import { get } from './client';
import type { UsersResponse, User } from './types';

export async function fetchUsersCount() {
  const json = await get<UsersResponse>('/api/users');
  return json.total;
}

export async function fetchUsersList(): Promise<User[]> {
  const json = await get<UsersResponse>('/api/users');
  return json.data;
}
