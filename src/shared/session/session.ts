export interface CurrentUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
}

export interface UserSession {
  user: CurrentUser | null;
}

export type SessionStatus =
  | "idle"
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "error";
