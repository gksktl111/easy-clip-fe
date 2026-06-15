import { AuthAccountResponseDto } from "@/features/auth/model/auth.dto";

export type AuthProvider = "google" | "github";

export interface AuthSessionUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  authAccounts?: AuthAccountResponseDto[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string | null;
  user: AuthSessionUser | null;
}
