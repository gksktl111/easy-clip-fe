import {
  fetchMyProfile,
  refreshAccessToken,
} from "@/features/auth/api/authApi";
import { AuthSession } from "@/features/auth/model/auth";
import {
  clearAuthSession,
  persistAuthSession,
} from "@/features/auth/service/authSession";

export const syncSessionProfile = async (session: AuthSession) => {
  const profile = await fetchMyProfile(session.accessToken);
  const nextSession: AuthSession = {
    ...session,
    user: profile,
  };

  persistAuthSession(nextSession);
  return nextSession;
};

export const restoreSessionFromRefreshCookie = async () => {
  const token = await refreshAccessToken();
  const session = await syncSessionProfile({
    accessToken: token.access_token,
    refreshToken: null,
    user: null,
  });

  return session;
};

export const clearSessionOnUnauthorized = () => {
  clearAuthSession();
};
