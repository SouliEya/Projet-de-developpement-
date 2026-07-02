import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { executionAPI } from '../../services/api';

interface ExecutionState {
  executions: any[];
  total: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ExecutionState = {
  executions: [], total: 0, loading: false, submitting: false, error: null,
};

export const fetchExecutions = createAsyncThunk('executions/fetchAll', async (params: any, { rejectWithValue }) => {
  try { const res = await executionAPI.getResults(params); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const runExecution = createAsyncThunk('executions/run', async (data: any, { rejectWithValue }) => {
  try { const res = await executionAPI.run(data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const executionSlice = createSlice({
  name: 'executions',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExecutions.pending, (state) => { state.loading = true; })
      .addCase(fetchExecutions.fulfilled, (state, action) => {
        state.loading = false;
        state.executions = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchExecutions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(runExecution.pending, (state) => { state.submitting = true; })
      .addCase(runExecution.fulfilled, (state, action) => {
        state.submitting = false;
        state.executions.unshift(action.payload);
        state.total++;
      })
      .addCase(runExecution.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });
  },
});

export const { clearError } = executionSlice.actions;
export default executionSlice.reducer;
