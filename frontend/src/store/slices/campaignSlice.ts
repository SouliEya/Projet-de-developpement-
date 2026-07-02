import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignsAPI } from '../../services/api';

interface CampaignState {
  campaigns: any[];
  currentCampaign: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: CampaignState = {
  campaigns: [], currentCampaign: null, loading: false, error: null,
};

export const fetchCampaigns = createAsyncThunk('campaigns/fetchAll', async (params: any, { rejectWithValue }) => {
  try { const res = await campaignsAPI.getAll(params); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const fetchCampaignById = createAsyncThunk('campaigns/fetchById', async (id: string, { rejectWithValue }) => {
  try { const res = await campaignsAPI.getById(id); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const createCampaign = createAsyncThunk('campaigns/create', async (data: any, { rejectWithValue }) => {
  try { const res = await campaignsAPI.create(data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const updateCampaign = createAsyncThunk('campaigns/update', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try { const res = await campaignsAPI.update(id, data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const deleteCampaign = createAsyncThunk('campaigns/delete', async (id: string, { rejectWithValue }) => {
  try { await campaignsAPI.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCurrent: (state) => { state.currentCampaign = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => { state.loading = true; })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
      })
      .addCase(fetchCampaigns.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchCampaignById.fulfilled, (state, action) => { state.currentCampaign = action.payload; })
      .addCase(createCampaign.fulfilled, (state, action) => { state.campaigns.unshift(action.payload); })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const idx = state.campaigns.findIndex((c: any) => c._id === action.payload._id);
        if (idx !== -1) state.campaigns[idx] = action.payload;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((c: any) => c._id !== action.payload);
      });
  },
});

export const { clearError, clearCurrent } = campaignSlice.actions;
export default campaignSlice.reducer;
