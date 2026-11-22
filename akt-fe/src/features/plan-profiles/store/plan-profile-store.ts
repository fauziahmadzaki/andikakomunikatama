import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/lib/uuid";

import { seedPlanProfiles, seedRouterIpPools } from "../data/seed";
import type { PlanProfile, RouterIpPool, SavePlanProfileInput } from "../data/types";

type PlanProfileState = {
  profiles: PlanProfile[];
  ipPools: RouterIpPool[];
  addProfile: (input: SavePlanProfileInput) => PlanProfile;
  updateProfile: (id: string, input: SavePlanProfileInput) => void;
  toggleProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  resetPlanProfiles: () => void;
};

function id() {
  return generateUUID();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const usePlanProfileStore = create<PlanProfileState>()(
  persist(
    (set) => ({
      profiles: seedPlanProfiles,
      ipPools: seedRouterIpPools,

      addProfile: (input) => {
        const { newPool, ipPoolId, ...profileInput } = input;
        const profileId = id();
        let resolvedPoolId = ipPoolId ?? "";
        let createdPool: RouterIpPool | undefined;

        if (newPool) {
          createdPool = { ...newPool, id: id() };
          resolvedPoolId = createdPool.id;
        }

        const profile: PlanProfile = {
          ...profileInput,
          id: profileId,
          ipPoolId: resolvedPoolId,
          createdAt: today(),
        };

        set((state) => ({
          profiles: [profile, ...state.profiles],
          ipPools: createdPool
            ? [createdPool, ...state.ipPools]
            : state.ipPools,
        }));

        return profile;
      },

      updateProfile: (profileId, input) => {
        const { newPool, ipPoolId, ...profilePatch } = input;
        let resolvedPoolId = ipPoolId;
        let createdPool: RouterIpPool | undefined;

        if (newPool) {
          createdPool = { ...newPool, id: id() };
          resolvedPoolId = createdPool.id;
        }

        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId
              ? {
                  ...profile,
                  ...profilePatch,
                  ipPoolId: resolvedPoolId ?? profile.ipPoolId,
                }
              : profile
          ),
          ipPools: createdPool
            ? [createdPool, ...state.ipPools]
            : state.ipPools,
        }));
      },

      toggleProfile: (profileId) => {
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId
              ? { ...profile, isActive: !profile.isActive }
              : profile
          ),
        }));
      },

      deleteProfile: (profileId) => {
        set((state) => ({
          profiles: state.profiles.filter((profile) => profile.id !== profileId),
        }));
      },

      resetPlanProfiles: () => {
        set({
          profiles: seedPlanProfiles,
          ipPools: seedRouterIpPools,
        });
      },
    }),
    {
      name: "muranet-plan-profiles",
      skipHydration: true,
      version: 3,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<PlanProfileState>;
        const existingProfiles = Array.isArray(state.profiles)
          ? state.profiles
          : [];
        const existingIds = new Set(
          existingProfiles.map((profile) => profile.id)
        );
        const missingSeeds = seedPlanProfiles.filter(
          (profile) => !existingIds.has(profile.id)
        );
        const seedById = new Map(
          seedPlanProfiles.map((profile) => [profile.id, profile])
        );
        const normalizedProfiles = existingProfiles.map((profile) => {
          const seed = seedById.get(profile.id);
          if (!seed) {
            return { ...profile, parentQueueId: profile.parentQueueId ?? "" };
          }
          return {
            ...profile,
            type: seed.type,
            rateLimit: seed.rateLimit,
            parentQueueId: profile.parentQueueId || seed.parentQueueId,
          };
        });

        return {
          ...state,
          profiles: [...normalizedProfiles, ...missingSeeds],
          ipPools: Array.isArray(state.ipPools)
            ? state.ipPools
            : seedRouterIpPools,
        } as PlanProfileState;
      },
    }
  )
);
