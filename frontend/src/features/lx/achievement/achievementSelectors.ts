import type { RootState } from "@/store";

export const selectAchievements = (state: RootState) => state.lxAchievement.achievements;
export const selectAchievementsLoading = (state: RootState) => state.lxAchievement.loading;
export const selectAchievementsError = (state: RootState) => state.lxAchievement.error;
export const selectAchievementsPagination = (state: RootState) => state.lxAchievement.pagination;
export const selectAchievementClubs = (state: RootState) => state.lxAchievement.clubs;
export const selectAchievementClans = (state: RootState) => state.lxAchievement.clans;
export const selectAchievementActor = (state: RootState) => state.lxAchievement.actor;
export const selectCanReviewAchievements = (state: RootState) => {
    const role = state.lxAchievement.actor?.role;
    return role === "ADMIN" || role === "LX_TEAM";
};
