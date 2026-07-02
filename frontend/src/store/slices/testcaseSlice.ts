import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { testcasesAPI } from '../../services/api';

interface TestCaseState {
  testcases: any[];
  total: number;
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: TestCaseState = {
  testcases: [], total: 0, loading: false, generating: false, error: null,
};

export const fetchTestCases = createAsyncThunk('testcases/fetchAll', async (params: any, { rejectWithValue }) => {
  try { const res = await testcasesAPI.getAll(params); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const generateTestCases = createAsyncThunk('testcases/generate', async (userStoryId: string, { rejectWithValue }) => {
  try { const res = await testcasesAPI.generate(userStoryId); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const createTestCase = createAsyncThunk('testcases/create', async (data: any, { rejectWithValue }) => {
  try { const res = await testcasesAPI.create(data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const updateTestCase = createAsyncThunk('testcases/update', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try { const res = await testcasesAPI.update(id, data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const deleteTestCase = createAsyncThunk('testcases/delete', async (id: string, { rejectWithValue }) => {
  try { await testcasesAPI.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const testcaseSlice = createSlice({
  name: 'testcases',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestCases.pending, (state) => { state.loading = true; })
      .addCase(fetchTestCases.fulfilled, (state, action) => {
        state.loading = false;
        state.testcases = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchTestCases.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(generateTestCases.pending, (state) => { state.generating = true; })
      .addCase(generateTestCases.fulfilled, (state, action) => {
        state.generating = false;
        state.testcases = [...action.payload.testCases, ...state.testcases];
        state.total += action.payload.count;
      })
      .addCase(generateTestCases.rejected, (state, action) => { state.generating = false; state.error = action.payload as string; })
      .addCase(createTestCase.fulfilled, (state, action) => {
        state.testcases.unshift(action.payload);
        state.total++;
      })
      .addCase(updateTestCase.fulfilled, (state, action) => {
        const idx = state.testcases.findIndex((t: any) => t._id === action.payload._id);
        if (idx !== -1) state.testcases[idx] = action.payload;
      })
      .addCase(deleteTestCase.fulfilled, (state, action) => {
        state.testcases = state.testcases.filter((t: any) => t._id !== action.payload);
        state.total--;
      });
  },
});

export const { clearError } = testcaseSlice.actions;
export default testcaseSlice.reducer;
