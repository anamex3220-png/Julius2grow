import type { User } from "@prisma/client";

export function publicUser(user: User) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}
