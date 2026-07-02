import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { testplansAPI } from '../../services/api';

interface TestPlanState {
  testplans: any[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: TestPlanState = {
  testplans: [], total: 0, loading: false, error: null,
};

export const fetchTestPlans = createAsyncThunk('testplans/fetchAll', async (params: any, { rejectWithValue }) => {
  try { const res = await testplansAPI.getAll(params); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const createTestPlan = createAsyncThunk('testplans/create', async (data: any, { rejectWithValue }) => {
  try { const res = await testplansAPI.create(data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const updateTestPlan = createAsyncThunk('testplans/update', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try { const res = await testplansAPI.update(id, data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const deleteTestPlan = createAsyncThunk('testplans/delete', async (id: string, { rejectWithValue }) => {
  try { await testplansAPI.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const testplanSlice = createSlice({
  name: 'testplans',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestPlans.pending, (state) => { state.loading = true; })
      .addCase(fetchTestPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.testplans = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchTestPlans.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createTestPlan.fulfilled, (state, action) => {
        state.testplans.unshift(action.payload);
        state.total++;
      })
      .addCase(updateTestPlan.fulfilled, (state, action) => {
        const idx = state.testplans.findIndex((p: any) => p._id === action.payload._id);
        if (idx !== -1) state.testplans[idx] = action.payload;
      })
      .addCase(deleteTestPlan.fulfilled, (state, action) => {
        state.testplans = state.testplans.filter((p: any) => p._id !== action.payload);
        state.total--;
      });
  },
});

export const { clearError } = testplanSlice.actions;
export default testplanSlice.reducer;
