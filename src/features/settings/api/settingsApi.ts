import {
  UpdateUserSettingsDto,
  UserSettingsResponseDto,
} from "@/features/settings/model/settings.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchMySettings = async () =>
  apiRequest<UserSettingsResponseDto>("/users/me/settings", {
    cache: "no-store",
  });

export const updateMySettings = async (
  payload: UpdateUserSettingsDto,
) =>
  apiRequest<UserSettingsResponseDto>("/users/me/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
