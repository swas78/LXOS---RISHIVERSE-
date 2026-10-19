import type { RootState } from "@/store";

export const selectExpenses = (state: RootState) => state.lxExpense.expenses;
export const selectExpensesLoading = (state: RootState) => state.lxExpense.loading;
export const selectExpensesError = (state: RootState) => state.lxExpense.error;
export const selectExpensesPagination = (state: RootState) => state.lxExpense.pagination;
