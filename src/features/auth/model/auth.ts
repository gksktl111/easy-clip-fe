export type AuthProvider = "google" | "github";

export interface AuthSessionUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  authAccounts?: {
    id: string;
    provider: "GOOGLE" | "GITHUB";
    email: string;
  }[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthSessionUser | null;
}

export interface AuthSignInResponse {
  access_token: string;
  refresh_token: string;
  user: AuthSessionUser;
}

export interface UserProfileResponse {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  authAccounts: {
    id: string;
    provider: "GOOGLE" | "GITHUB";
    email: string;
  }[];
}
