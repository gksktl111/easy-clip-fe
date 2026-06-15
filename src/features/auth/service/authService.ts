import { fetchMyProfile } from "@/features/auth/api/authApi";
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

export const clearSessionOnUnauthorized = () => {
  clearAuthSession();
};
