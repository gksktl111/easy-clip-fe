import { fetchMyProfile } from "@/features/auth/api/authApi";
import type { UserSession } from "@/shared/session/session";

export const syncSessionProfile = async () => {
  const profile = await fetchMyProfile();
  const nextSession: UserSession = {
    user: {
      id: profile.id,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      email: profile.authAccounts[0]?.email ?? null,
    },
  };

  return nextSession;
};

export const restoreSessionFromRefreshCookie = () => syncSessionProfile();
