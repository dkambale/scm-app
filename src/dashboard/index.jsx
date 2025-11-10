// src/views/dashboard/index.jsx

import React, { lazy } from 'react';
import { useSelector } from 'react-redux';
import Loadable from 'ui-component/Loadable';
import Loader from 'ui-component/Loader';
// project imports
const AdminDashboard = Loadable(lazy(() => import('./adminDashboard/index')));
const TeacherDashboard = Loadable(lazy(() => import('./teacherDashboard/TeacherDashboard')));
const StudentDashboardV1 = Loadable(lazy(() => import('./studentDashboard/StudentDashboardV1')));

const DashboardDefault = () => {
  const user = useSelector((state) => state.user.user);
  const userType = user?.type;
  console.log('User Type:', userType);
  console.log('User Details:', user);

  // if (!userType) {
  //   // Show loader while userType is loading or changing
  //   return <Loader />;
  // }

  switch (userType) {
    case 'STUDENT':
      return <StudentDashboardV1 />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <Loader />;
  }
};

export default DashboardDefault;
