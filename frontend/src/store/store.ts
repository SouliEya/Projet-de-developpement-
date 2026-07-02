import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import storyReducer from './slices/storySlice';
import testcaseReducer from './slices/testcaseSlice';
import bugReducer from './slices/bugSlice';
import campaignReducer from './slices/campaignSlice';
import executionReducer from './slices/executionSlice';
import testplanReducer from './slices/testplanSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stories: storyReducer,
    testcases: testcaseReducer,
    bugs: bugReducer,
    campaigns: campaignReducer,
    testplans: testplanReducer,
    executions: executionReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
