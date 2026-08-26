export interface CurrentUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
}

export interface AuthSession {
  user: CurrentUser | null;
}

export type AuthStatus =
  | "idle"
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "error";
