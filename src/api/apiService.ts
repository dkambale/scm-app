import api, { endpoints } from "./index";
import { Student, Teacher, Assignment, Class } from "../types";
import { storage } from "../utils/storage";
import { publicApiClient } from "./http"; // ADDED: Import public client

class ApiService {
  // expose the underlying axios client so callers can use apiService.api.get/post when needed
 public api = api;
  
  // ADDED: New signup method using the publicApiClient
  async signup(payload: {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    address: string;
  }): Promise<any> {
    // CRUCIAL: Use publicApiClient here to bypass the Auth token injector
    const res = await publicApiClient.post(endpoints.auth.signup, payload);
    return res.data;
  }
    async getStudentsPaged(params: {
    accountId: string;
    page?: number;
    size?: number;
    search?: string;
    schoolId?: string;
    classId?: string;
    divisionId?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<{ items: Student[]; total: number }> {
    const {
      accountId,
      page = 0,
      size = 10,
      search = "",
      schoolId,
      classId,
      divisionId,
      sortBy = "id",
      sortDir = "asc",
    } = params;
    const url = `${endpoints.users.getAllByType}/${accountId}?type=STUDENT`;
    const payload = {
      page,
      size,
      sortBy,
      sortDir,
      search,
      schoolId,
      classId,
      divisionId,
    };
    const res = await api.post(url, payload);
    const items = res.data?.content || res.data?.data || res.data || [];
    const total = res.data?.totalElements ?? items.length ?? 0;
    return { items, total };
  }

  async getStudents(accountId?: string): Promise<Student[]> {
    const res = await api.get(endpoints.users.getAllByType, {
      params: { type: "STUDENT", accountId },
    });
    return res.data?.data || res.data || [];
  }

  async createStudent(payload: any): Promise<any> {
    const res = await api.post(endpoints.users.base, {
      ...payload,
      type: "STUDENT",
    });
    return res.data;
  }

  async updateStudent(id: string, payload: any): Promise<any> {
    const res = await api.put(`${endpoints.users.base}/${id}`, payload);
    return res.data;
  }

  async deleteStudent(id: string): Promise<void> {
    await api.post(endpoints.users.delete, { id });
  }

  async getTeachers(accountId?: string): Promise<Teacher[]> {
    const res = await api.get(`${endpoints.users.getAllByType}/${accountId}`, {
      params: { type: "TEACHER", accountId },
    });
    return res.data?.data || res.data || [];
  }

  async createTeacher(payload: any): Promise<any> {
    const res = await api.post(endpoints.users.base, {
      ...payload,
      type: "TEACHER",
    });
    return res.data;
  }

  async updateTeacher(id: string, payload: any): Promise<any> {
    const res = await api.put(`${endpoints.users.base}/${id}`, payload);
    return res.data;
  }

  async deleteTeacher(id: string): Promise<void> {
    await api.post(endpoints.users.delete, { id });
  }

  async getAssignments(params?: Record<string, any>): Promise<Assignment[]> {
    const res = await api.get(endpoints.assignments.base, { params });
    return res.data?.data || res.data || [];
  }

  async createAssignment(payload: any): Promise<any> {
    const res = await api.post(endpoints.assignments.base, payload);
    return res.data;
  }

  async updateAssignment(id: string, payload: any): Promise<any> {
    const res = await api.put(`${endpoints.assignments.base}/${id}`, payload);
    return res.data;
  }

  async deleteAssignment(id: string): Promise<void> {
    await api.post(endpoints.assignments.delete, { id });
  }

  async getClassById(id: string): Promise<Class> {
    const res = await api.get(`${endpoints.schools.classes.getAll}`, {
      params: { id },
    });
    return res.data?.data || res.data;
  }

  async getTimetableBy(accountId?: string, classId?: string): Promise<any> {
    const res = await api.get(endpoints.timetable.base, {
      params: { accountId, classId },
    });
    return res.data?.data || res.data;
  }

  async getRoles(accountId: string): Promise<any[]> {
    const url = `${endpoints.roles.getAll}/${accountId}`;
    const res = await api.post(url, {
      page: 0,
      size: 1000,
      sortBy: "id",
      sortDir: "asc",
      search: "",
    });
    return res.data?.content || [];
  }

  async getSchools(accountId: string): Promise<any[]> {
    const url = `${endpoints.schools.branches.getAll}/${accountId}`;
    const res = await api.post(url, {
      page: 0,
      size: 1000,
      sortBy: "id",
      sortDir: "asc",
      search: "",
    });
    return res.data?.content || [];
  }

  async getClassesList(accountId: string): Promise<any[]> {
    const url = `${endpoints.schools.classes.getAll}/${accountId}`;
    const res = await api.post(url, {
      page: 0,
      size: 1000,
      sortBy: "id",
      sortDir: "asc",
      search: "",
    });
    return res.data?.content || [];
  }

  async getDivisions(accountId: string): Promise<any[]> {
    const url = `${endpoints.schools.divisions.getAll}/${accountId}`;
    const res = await api.post(url, {
      page: 0,
      size: 1000,
      sortBy: "id",
      sortDir: "asc",
      search: "",
    });
    return res.data?.content || [];
  }

  async getStudentById(id: string): Promise<any> {
    const res = await api.get(`api/users/getById`, { params: { id } });
    return res.data;
  }

  async saveStudent(payload: any): Promise<any> {
    const res = await api.post(`api/users/save`, payload);
    return res.data;
  }

  async updateStudentFull(payload: any): Promise<any> {
    const res = await api.put(`api/users/update`, payload);
    return res.data;
  }
  async getSubjects(accountId: string): Promise<any[]> {
    const url = `${endpoints.subjects.getAll}/${accountId}`;
    const res = await api.post(url, {
      page: 0,
      size: 1000,
      sortBy: "id",
      sortDir: "asc",
      search: "",
    });
    return res.data?.content || [];
  }
  async getAssignmentSubmissions(assignmentId: string): Promise<any[]> {
    const res = await api.get(`api/assignments/submissions`, {
      params: { assignmentId },
    });
    return res.data?.data || res.data || [];
  }
  async getAssignmentById(id: string): Promise<any> {
    const res = await api.get(`${endpoints.assignments.base}/${id}`);
    return res.data;
  }
  // --- Attendance API helpers (centralized to avoid direct apiService.api usage) ---
  async getAttendanceBy(
    accountId: string,
    params: { classId?: string; divisionId?: string; subjectId?: string; date?: string }
  ): Promise<any> {
    const { classId, divisionId, subjectId, date } = params || {};
    const url = `api/attendance/getAttendanceBy/${accountId}`;
    const res = await api.get(url, { params: { classId, divisionId, subjectId, date } });
    return res.data;
  }

  async getAttendanceById(id: string): Promise<any> {
    const res = await api.get(`api/attendance/getById/${id}`);
    return res.data;
  }

  async saveAttendance(payload: any): Promise<any> {
    const res = await api.post(`api/attendance/save`, payload);
    return res.data;
  }
  async saveAssignment(
    payload: any,
    file?: { uri: string; name?: string; type?: string } | null
  ): Promise<any> {
    // If a file is provided, upload with multipart/form-data.
    if (file && file.uri) {
      const formData = new FormData();

      // Append payload fields. For objects, stringify to preserve structure.
      if (payload && typeof payload === "object") {
        Object.keys(payload).forEach((key) => {
          const val = (payload as any)[key];
          if (val !== undefined && val !== null) {
            formData.append(
              key,
              typeof val === "object" ? JSON.stringify(val) : String(val)
            );
          }
        });
      }

      // Normalize file details
      const fileName = file.name || "file";
      const fileType =
        file.type || (file as any).mimeType || "application/octet-stream";

      // Append file for RN fetch/axios compatibility
      formData.append("file", {
        uri: file.uri,
        name: fileName,
        type: fileType,
      } as any);

      // Use fetch for file uploads in RN to avoid axios multipart issues.
      try {
        const base = (api.defaults && (api.defaults.baseURL as string)) || "";
        const path = endpoints.assignments.create;
        const url = base
          ? `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
          : path;

        // Retrieve token from storage if available
        let token: string | null = null;
        try {
          const raw = await storage.getItem("SCM-AUTH");
          if (raw) {
            const parsed = JSON.parse(raw);
            token = parsed?.accessToken || null;
          }
        } catch {
          // ignore
        }

        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const resp = await fetch(url, {
          method: "POST",
          body: formData,
          headers,
        });
        const text = await resp.text();
        let data: any = text;
        try {
          data = JSON.parse(text);
        } catch {}

        if (!resp.ok) {
          console.error("[api] saveAssignment failed", {
            status: resp.status,
            body: data,
          });
          const err: any = new Error("saveAssignment failed");
          err.response = { status: resp.status, data };
          throw err;
        }

        return data;
      } catch (err: any) {
        console.error(
          "[api] upload error:",
          err?.message || err,
          err?.response || null
        );
        throw err;
      }
    }

    // Fallback: send JSON body when no file is present
    const res = await api.post(endpoints.assignments.create, payload);
    return res.data;
  }
}

export const apiService = new ApiService();
