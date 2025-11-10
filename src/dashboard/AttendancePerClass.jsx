
import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import api from '../../utils/apiService';
import { getAttendanceBarChartOptions } from './chart-data/attendance-bar-chart';

const AttendancePerClass = ({ isLoading }) => {
  const theme = useTheme();
  const user = useSelector((state) => state.user.user);

  // Initialize chartData with both options and series keys to avoid undefined errors
  const [chartData, setChartData] = useState({
    options: getAttendanceBarChartOptions(theme),
    series: [
      { name: 'Present', data: [] },
      { name: 'Absent', data: [] }
    ]
  });

  useEffect(() => { 
    if (!user?.accountId) return;
    api
      .get(`api/dashboard/getClassAttendanceByAccountId/${user.accountId}?type=TEACHER`)
      .then((response) => {
        // response.data is expected to be an array of { className, presentCount, absentCount }
        const data = response.data || [];
        const categories = data.map(item => item.className);
        const presentData = data.map(item => item.presentCount);
        const absentData = data.map(item => item.absentCount);

        setChartData(prev => ({
          ...prev,
          options: {
            ...prev.options,
            xaxis: {
              ...prev.options.xaxis,
              categories
            }
          },
          series: [
            { name: 'Present', data: presentData },
            { name: 'Absent', data: absentData }
          ]
        }));
      })
      .catch((err) => {
        setChartData(prev => ({
          ...prev,
          series: [
            { name: 'Present', data: [] },
            { name: 'Absent', data: [] }
          ],
          options: {
            ...prev.options,
            xaxis: { ...prev.options.xaxis, categories: [] }
          }
        }));
      });
  }, [user]);

  return (
    <MainCard>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h5">Attendance Per Class</Typography>
        </Grid>
        <Grid item>
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={350}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default AttendancePerClass;