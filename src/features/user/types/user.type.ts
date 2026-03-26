export type UserRole = "ADMIN" | "USER";

export interface User {
  email: string;
  id: string;
  role: UserRole;
}
