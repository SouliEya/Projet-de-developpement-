import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storiesAPI } from '../../services/api';

interface StoryState {
  stories: any[];
  currentStory: any | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: StoryState = {
  stories: [], currentStory: null, total: 0, loading: false, error: null,
};

export const fetchStories = createAsyncThunk('stories/fetchAll', async (params: any, { rejectWithValue }) => {
  try { const res = await storiesAPI.getAll(params); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const createStory = createAsyncThunk('stories/create', async (data: any, { rejectWithValue }) => {
  try { const res = await storiesAPI.create(data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const updateStory = createAsyncThunk('stories/update', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try { const res = await storiesAPI.update(id, data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const deleteStory = createAsyncThunk('stories/delete', async (id: string, { rejectWithValue }) => {
  try { await storiesAPI.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => { state.loading = true; })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchStories.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createStory.fulfilled, (state, action) => { state.stories.unshift(action.payload); state.total++; })
      .addCase(updateStory.fulfilled, (state, action) => {
        const idx = state.stories.findIndex((s: any) => s._id === action.payload._id);
        if (idx !== -1) state.stories[idx] = action.payload;
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.stories = state.stories.filter((s: any) => s._id !== action.payload);
        state.total--;
      });
  },
});

export const { clearError } = storySlice.actions;
export default storySlice.reducer;
