import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "@/lib/api-client";
import type {
  PlanProfile,
  RouterIpPool,
  RouterSyncResult,
  SavePlanProfileInput,
} from "../data/types";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type SaveProfileResult = {
  profile: ApiPlanProfile;
  pool?: RouterIpPool;
  routerSync?: RouterSyncResult;
};

type MutationResult = {
  profile: PlanProfile;
  routerSync?: RouterSyncResult;
};

type ApiPlanProfile = Omit<PlanProfile, "ipPoolId"> & {
  ipPoolId: string | null;
};

function normalizeProfile(profile: ApiPlanProfile): PlanProfile {
  return { ...profile, ipPoolId: profile.ipPoolId ?? "" };
}

type PlanProfileState = {
  profiles: PlanProfile[];
  ipPools: RouterIpPool[];
  isLoading: boolean;
  fetchPlanProfiles: () => Promise<void>;
  addProfile: (input: SavePlanProfileInput) => Promise<MutationResult>;
  updateProfile: (
    id: string,
    input: SavePlanProfileInput
  ) => Promise<MutationResult>;
  toggleProfile: (id: string) => Promise<MutationResult>;
  syncProfile: (id: string) => Promise<RouterSyncResult>;
  deleteProfile: (id: string) => Promise<boolean>;
  resetPlanProfiles: () => void;
};

export const usePlanProfileStore = create<PlanProfileState>()(
  persist(
    (set) => ({
      profiles: [],
      ipPools: [],
      isLoading: false,

      fetchPlanProfiles: async () => {
        set({ isLoading: true });
        try {
          const [profilesResponse, poolsResponse] = await Promise.all([
            apiClient.get<ApiEnvelope<ApiPlanProfile[]>>("/plan-profiles"),
            apiClient.get<ApiEnvelope<RouterIpPool[]>>(
              "/plan-profiles/ip-pools"
            ),
          ]);

          set({
            profiles: profilesResponse.data.data.map(normalizeProfile),
            ipPools: poolsResponse.data.data,
            isLoading: false,
          });
        } catch (error) {
          console.warn("Gagal mengambil data paket dari backend:", error);
          set({ isLoading: false });
        }
      },

      addProfile: async (input) => {
        const response = await apiClient.post<ApiEnvelope<SaveProfileResult>>(
          "/plan-profiles",
          input
        );
        const { profile, pool, routerSync } = response.data.data;
        const normalized = normalizeProfile(profile);

        set((state) => ({
          profiles: [normalized, ...state.profiles],
          ipPools: pool ? [pool, ...state.ipPools] : state.ipPools,
        }));

        return { profile: normalized, routerSync };
      },

      updateProfile: async (id, input) => {
        const response = await apiClient.put<ApiEnvelope<SaveProfileResult>>(
          `/plan-profiles/${id}`,
          input
        );
        const { profile, pool, routerSync } = response.data.data;
        const normalized = normalizeProfile(profile);

        set((state) => ({
          profiles: state.profiles.map((item) =>
            item.id === id ? normalized : item
          ),
          ipPools: pool ? [pool, ...state.ipPools] : state.ipPools,
        }));

        return { profile: normalized, routerSync };
      },

      toggleProfile: async (id) => {
        const response = await apiClient.patch<
          ApiEnvelope<{ profile: ApiPlanProfile; routerSync?: RouterSyncResult }>
        >(`/plan-profiles/${id}/toggle`);
        const profile = normalizeProfile(response.data.data.profile);

        set((state) => ({
          profiles: state.profiles.map((item) =>
            item.id === id ? profile : item
          ),
        }));

        return { profile, routerSync: response.data.data.routerSync };
      },

      syncProfile: async (id) => {
        const response = await apiClient.post<ApiEnvelope<RouterSyncResult>>(
          `/plan-profiles/${id}/sync`
        );
        return response.data.data;
      },

      deleteProfile: async (id) => {
        await apiClient.delete(`/plan-profiles/${id}`);
        set((state) => ({
          profiles: state.profiles.filter((item) => item.id !== id),
        }));
        return true;
      },

      resetPlanProfiles: () => {
        set({ profiles: [], ipPools: [] });
      },
    }),
    {
      name: "muranet-plan-profiles",
      skipHydration: true,
      version: 4,
      migrate: () =>
        ({ profiles: [], ipPools: [] }) as unknown as PlanProfileState,
    }
  )
);
