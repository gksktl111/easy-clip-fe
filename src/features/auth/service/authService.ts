import { fetchMyProfile } from "@/features/auth/api/authApi";
import type { AuthSession } from "@/shared/auth/authSession";

export const syncSessionProfile = async () => {
  const profile = await fetchMyProfile();
  const nextSession: AuthSession = {
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
