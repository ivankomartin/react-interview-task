import { get } from "./client";
import type { UsersResponse, User } from "./types";

export async function fetchUsersCount(): Promise<number> {
  const json = await get<UsersResponse>("/api/users");

  if (!json.success) {
    throw new Error(`Failed to fetch users count: ${json.error}`);
  }

  return json.total;
}

export async function fetchUsersList(): Promise<User[]> {
  const json = await get<UsersResponse>("/api/users");

  if (!json.success) {
    throw new Error(`Failed to fetch users list: ${json.error}`);
  }

  return json.data;
}
