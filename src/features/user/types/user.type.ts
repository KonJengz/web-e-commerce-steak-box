export type UserRole = "ADMIN" | "USER";

export interface User {
  email: string;
  id: string;
  image: string | null;
  name: string;
  role: UserRole;
}
