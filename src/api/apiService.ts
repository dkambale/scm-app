import api, { endpoints } from './index';
import { Student, Teacher, Assignment, Class } from '../types';

class ApiService {
  async getStudents(accountId?: string): Promise<Student[]> {
    const res = await api.get(endpoints.users.getAllByType, { params: { type: 'STUDENT', accountId } });
    return res.data?.data || res.data || [];
  }

  async createStudent(payload: any): Promise<any> {
    const res = await api.post(endpoints.users.base, { ...payload, type: 'STUDENT' });
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
    const res = await api.get(endpoints.users.getAllByType, { params: { type: 'TEACHER', accountId } });
    return res.data?.data || res.data || [];
  }

  async createTeacher(payload: any): Promise<any> {
    const res = await api.post(endpoints.users.base, { ...payload, type: 'TEACHER' });
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
    const res = await api.get(`${endpoints.schools.classes.getAll}`, { params: { id } });
    return res.data?.data || res.data;
  }

  async getTimetableBy(accountId?: string, classId?: string): Promise<any> {
    const res = await api.get(endpoints.timetable.base, { params: { accountId, classId } });
    return res.data?.data || res.data;
  }
}

export const apiService = new ApiService();
