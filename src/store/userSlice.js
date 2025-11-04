import { createSlice } from "@reduxjs/toolkit";
// Do not call async helpers at module load time. Initialize synchronously and
// let the app populate user state after startup if needed.

const initialState = {
  isLoggedIn: false,
  user: null,
  accessToken: null,
  role: null,
  permissions: [],
  // New state for student data filtering
  allStudents: [],
  filteredStudents: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin(state, action) {
      state.isLoggedIn = true;
      state.user = action.payload;
      state.accessToken = action.payload?.accessToken || null;
      state.role = action.payload?.role || null;
      state.permissions = action.payload?.role?.permissions || [];
    },
    setLogout(state) {
      state.isLoggedIn = false;
      state.user = null;
    },
    // New reducer to set the initial list of all students
    setAllStudents(state, action) {
      state.allStudents = action.payload;
      state.filteredStudents = action.payload; // Initially, all students are the filtered students
    },
    // New reducer to apply filters to the student list
    filterStudents(state, action) {
      const { schoolId, classId, divisionId, searchTerm } = action.payload;

      let filteredData = state.allStudents;

      if (schoolId) {
        filteredData = filteredData.filter(
          (student) => student.schoolId == schoolId
        );
      }
      if (classId) {
        filteredData = filteredData.filter(
          (student) => student.classId == classId
        );
      }
      if (divisionId) {
        filteredData = filteredData.filter(
          (student) => student.divisionId == divisionId
        );
      }
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (student) =>
            student.firstName?.toLowerCase().includes(lowerCaseSearchTerm) ||
            student.lastName?.toLowerCase().includes(lowerCaseSearchTerm) ||
            student.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
            student.rollNo?.toString().includes(lowerCaseSearchTerm) ||
            student.userName?.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }

      state.filteredStudents = filteredData;
    },
  },
});

export const { setLogin, setLogout, setAllStudents, filterStudents } =
  userSlice.actions;
export default userSlice.reducer;
