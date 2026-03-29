import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalysisState, AnalysisResult } from '../../types';

const initialState: AnalysisState = {
  result: null,
  isLoading: false,
  error: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setResult: (state, action: PayloadAction<AnalysisResult>) => {
      state.result = action.payload;
      state.error = null;
      state.isLoading = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearResult: (state) => {
      state.result = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const { setLoading, setResult, setError, clearResult } = analysisSlice.actions;
export default analysisSlice.reducer;
