// src/views/dashboard/studentDashboard/StudentAttendanceChart.jsx

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import ReusableBarChart from 'ui-component/charts/ReusableBarChart';
import api from 'utils/apiService';
import { useTranslation } from 'react-i18next'; // <-- add


const StudentAttendanceChart = ({ studentId }) => {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ present: 0, absent: 0 });
  const { t } = useTranslation('dashboard'); // <-- add

  useEffect(() => {
    const fetchStudentAttendance = async () => {
      if (!user?.accountId || !studentId) return;

      setLoading(true);
      try {
        const response = await api.post(
          `/api/attendance/getStudentAttendance/${user.accountId}/${studentId}`,
          {
            page: 0,
            size: 1000,
            sortBy: 'id',
            sortDir: 'asc',
          }
        );

        const attendanceRecords = response.data?.content || [];

        let presentCount = 0;
        let absentCount = 0;

        attendanceRecords.forEach(record => {
          if (record.studentAttendanceMappings && record.studentAttendanceMappings.length > 0) {
            const status = record.studentAttendanceMappings[0].vailable;
            if (status === true) {
              presentCount++;
            } else if (status === false) {
              absentCount++;
            }
          }
        });

        setChartData({ present: presentCount, absent: absentCount });
      } catch (err) {
        console.error('Failed to fetch student attendance data:', err);
        setChartData({ present: 0, absent: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAttendance();
  }, [user, studentId]);

  if (loading) {
    return (
      <MainCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  const series = [
    { name: 'Present', data: [chartData.present] },
    { name: 'Absent', data: [chartData.absent] }
  ];

  const categories = ['Attendance'];

  return (
    <MainCard title={t('student.attendanceOverviewTitle')}>
      {chartData.present === 0 && chartData.absent === 0 ? (
        <Typography variant="body1" align="center">
          {t('student.noAttendanceData')}
        </Typography>
      ) : (
        <ReusableBarChart
          series={series}
          xAxisCategories={categories}
          xAxisTitle="Status"
          yAxisTitle="Number of Days"
          height={300}
          chartId="student-attendance-chart"
          colors={['#00E676', '#FF1744']}
          plotOptions={{ bar: { horizontal: false, columnWidth: '50%', stacked: true } }}
        />
      )}
    </MainCard>
  );
};

export default StudentAttendanceChart;