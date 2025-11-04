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
  const accountId = await userDetails.getAccountId();

  // Only fetch if data is not already loaded
  if (
    scd.schools.length > 0 &&
    scd.classes.length > 0 &&
    scd.divisions.length > 0
  ) {
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
    console.log("Schools:", schoolsRes.data.content || []);
    console.log("Classes:", classesRes.data.content || []);
    console.log("Divisions:", divisionsRes.data.content || []);
  } catch (error) {
    console.error("Failed to fetch SCD data:", error);
    dispatch(setError("Failed to fetch school, class, and division data."));
  }
};

export default scdSlice.reducer;
