import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bugsAPI } from '../../services/api';

interface BugState {
  bugs: any[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: BugState = { bugs: [], total: 0, loading: false, error: null };

export const fetchBugs = createAsyncThunk('bugs/fetchAll', async (params: any, { rejectWithValue }) => {
  try { const res = await bugsAPI.getAll(params); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const createBug = createAsyncThunk('bugs/create', async (data: any, { rejectWithValue }) => {
  try { const res = await bugsAPI.create(data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const updateBug = createAsyncThunk('bugs/update', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try { const res = await bugsAPI.update(id, data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const deleteBug = createAsyncThunk('bugs/delete', async (id: string, { rejectWithValue }) => {
  try { await bugsAPI.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const bugSlice = createSlice({
  name: 'bugs',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBugs.pending, (state) => { state.loading = true; })
      .addCase(fetchBugs.fulfilled, (state, action) => {
        state.loading = false; state.bugs = action.payload.data; state.total = action.payload.total;
      })
      .addCase(fetchBugs.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createBug.fulfilled, (state, action) => { state.bugs.unshift(action.payload); state.total++; })
      .addCase(updateBug.fulfilled, (state, action) => {
        const idx = state.bugs.findIndex((b: any) => b._id === action.payload._id);
        if (idx !== -1) state.bugs[idx] = action.payload;
      })
      .addCase(deleteBug.fulfilled, (state, action) => {
        state.bugs = state.bugs.filter((b: any) => b._id !== action.payload); state.total--;
      });
  },
});

export const { clearError } = bugSlice.actions;
export default bugSlice.reducer;
