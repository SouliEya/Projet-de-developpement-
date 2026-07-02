import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

interface DashboardState {
  stats: any | null;
  kpis: any | null;
  loading: boolean;
}

const initialState: DashboardState = { stats: null, kpis: null, loading: false };

export const fetchStatistics = createAsyncThunk('dashboard/stats', async (_, { rejectWithValue }) => {
  try { const res = await dashboardAPI.getStatistics(); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const fetchKpis = createAsyncThunk('dashboard/kpis', async (_, { rejectWithValue }) => {
  try { const res = await dashboardAPI.getKpis(); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatistics.pending, (state) => { state.loading = true; })
      .addCase(fetchStatistics.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchStatistics.rejected, (state) => { state.loading = false; })
      .addCase(fetchKpis.fulfilled, (state, action) => { state.kpis = action.payload; });
  },
});

export default dashboardSlice.reducer;
