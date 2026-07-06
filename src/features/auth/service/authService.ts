import { fetchMyProfile } from "@/features/auth/api/authApi";
import { AuthSession } from "@/features/auth/model/auth";
import {
  clearAuthSession,
  persistAuthSession,
} from "@/features/auth/service/authSession";

export const syncSessionProfile = async () => {
  const profile = await fetchMyProfile();
  const nextSession: AuthSession = {
    user: profile,
  };

  persistAuthSession(nextSession);
  return nextSession;
};

export const restoreSessionFromRefreshCookie = () => syncSessionProfile();

export const clearSessionOnUnauthorized = () => {
  clearAuthSession();
};
