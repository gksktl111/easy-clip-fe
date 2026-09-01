export type OAuthProvider = "google" | "github";

export interface CurrentUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
}

export interface AuthSession {
  user: CurrentUser;
}

export type AuthStatus =
  | "idle"
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "error";
