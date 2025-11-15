// src/store/scdSlice.js
import { createSlice } from "@reduxjs/toolkit";
import api, { userDetails } from "../utils/apiService";

const initialState = {
  schools: [],
  classes: [],
  divisions: [],
  loading: false,
  error: null,
};

const scdSlice = createSlice({
  name: "scd",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSchools: (state, action) => {
      state.schools = action.payload;
      state.loading = false;
    },
    setClasses: (state, action) => {
      state.classes = action.payload;
      state.loading = false;
    },
    setDivisions: (state, action) => {
      state.divisions = action.payload;
      state.loading = false;
    },
  },
});

export const { setSchools, setClasses, setDivisions, setLoading, setError } =
  scdSlice.actions;

// Async thunk to fetch all SCD data
export const fetchScdData = () => async (dispatch, getState) => {
  const { scd } = getState();
  // Only fetch if data is not already loaded
  if (
    scd.schools.length > 0 &&
    scd.classes.length > 0 &&
    scd.divisions.length > 0
  ) {
    return;
  }

  // Wait for accountId to become available because SCDProvider may mount
  // before AuthProvider finishes initializing on mobile devices.
  const maxAttempts = 6;
  const delayMs = 500;
  let accountId = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    accountId = await userDetails.getAccountId();
    if (accountId) break;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, delayMs));
  }

  if (!accountId) {
    console.warn(
      "fetchScdData: accountId not available after retries; scheduling one retry"
    );
    // Schedule one delayed retry — avoids silent failure when auth finishes slightly later.
    setTimeout(() => {
      try {
        dispatch(fetchScdData());
      } catch {
        // swallow
      }
    }, 10000);
    return;
  }

  dispatch(setLoading(true));
  try {
    const payload = { page: 0, size: 1000, sortBy: "id", sortDir: "asc" };
    const [schoolsRes, classesRes, divisionsRes] = await Promise.all([
      api.post(`/api/schoolBranches/getAll/${accountId}`, payload),
      api.post(`/api/schoolClasses/getAll/${accountId}`, payload),
      api.post(`/api/divisions/getAll/${accountId}`, payload),
    ]);

    dispatch(setSchools(schoolsRes.data.content || []));
    dispatch(setClasses(classesRes.data.content || []));
    dispatch(setDivisions(divisionsRes.data.content || []));
    console.log("Fetched SCD data successfully");
  } catch (error) {
    console.error("Failed to fetch SCD data:", error);
    dispatch(setError("Failed to fetch school, class, and division data."));
  }
};

export default scdSlice.reducer;
