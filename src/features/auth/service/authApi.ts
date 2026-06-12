import {
  AuthProvider,
  AuthSession,
  UserProfileResponse,
} from "@/features/auth/model/auth";
import { clearAuthSession, persistAuthSession } from "@/features/auth/service/authSession";
import { apiRequest } from "@/shared/lib/apiClient";

export const getAuthStartUrl = (provider: AuthProvider) => `/auth/${provider}`;

export const fetchMyProfile = async (accessToken: string) =>
  apiRequest<UserProfileResponse>("/users/me", {
    accessToken,
    cache: "no-store",
  });

export const logout = async (accessToken: string) =>
  apiRequest<{ success: boolean }>("/auth/logout", {
    method: "POST",
    accessToken,
  });

export const syncSessionProfile = async (session: AuthSession) => {
  const profile = await fetchMyProfile(session.accessToken);
  const nextSession: AuthSession = {
    ...session,
    user: profile,
  };

  persistAuthSession(nextSession);
  return nextSession;
};

export const clearSessionOnUnauthorized = () => {
  clearAuthSession();
};
