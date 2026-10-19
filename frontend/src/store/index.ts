import { combineReducers, configureStore } from "@reduxjs/toolkit";
import itemReducer from "@/features/demo/item/itemSlice";
import lxRoomReducer from "@/features/lx/room/roomSlice";
import lxClubReducer from "@/features/lx/club/clubSlice";
import lxClanReducer from "@/features/lx/clan/clanSlice";
import lxInitiativeReducer from "@/features/lx/initiative/initiativeSlice";
import lxEventReducer from "@/features/lx/event/eventSlice";
import lxAchievementReducer from "@/features/lx/achievement/achievementSlice";
import lxExpenseReducer from "@/features/lx/expense/expenseSlice";
import lxReimbursementReducer from "@/features/lx/reimbursement/reimbursementSlice";
import lxFileReducer from "@/features/lx/file/fileSlice";
import lxProductReducer from "@/features/lx/product/productSlice";
import lxActorReducer from "@/features/lx/actor/actorSlice";
import lxAccessReducer from "@/features/lx/access/accessSlice";
import lxReportReducer from "@/features/lx/report/reportSlice";
import lxDashboardReducer from "@/features/lx/dashboard/dashboardSlice";
import lxBudgetReducer from "@/features/lx/budget/budgetSlice";
import lxAnalyticsReducer from "@/features/lx/analytics/analyticsSlice";
import lxFeedReducer from "@/features/lx/feed/feedSlice";
import lxCalendarReducer from "@/features/lx/calendar/calendarSlice";
import lxApprovalReducer from "@/features/lx/approval/approvalSlice";
import lxCabinReducer from "@/features/lx/cabin/cabinSlice";
import lxLostFoundReducer from "@/features/lx/lostFound/lostFoundSlice";

export const rootReducer = combineReducers({
    demoItem: itemReducer,
    lxRoom: lxRoomReducer,
    lxCabin: lxCabinReducer,
    lxLostFound: lxLostFoundReducer,
    lxClub: lxClubReducer,
    lxClan: lxClanReducer,
    lxInitiative: lxInitiativeReducer,
    lxEvent: lxEventReducer,
    lxAchievement: lxAchievementReducer,
    lxExpense: lxExpenseReducer,
    lxReimbursement: lxReimbursementReducer,
    lxFile: lxFileReducer,
    lxProduct: lxProductReducer,
    lxActor: lxActorReducer,
    lxAccess: lxAccessReducer,
    lxReport: lxReportReducer,
    lxDashboard: lxDashboardReducer,
    lxBudget: lxBudgetReducer,
    lxAnalytics: lxAnalyticsReducer,
    lxFeed: lxFeedReducer,
    lxCalendar: lxCalendarReducer,
    lxApproval: lxApprovalReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
