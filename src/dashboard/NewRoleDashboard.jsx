import React from 'react';
import { Grid, Typography } from '@mui/material';
import ReusableBarChart from 'ui-component/charts/ReusableBarChart';
import ReusableDonutChart from 'ui-component/charts/DonutChart';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

const NewRoleDashboard = () => {
  // --- Fake Data for Bar Chart ---
  const studentEnrollmentsData = {
    series: [
      {
        name: 'Students',
        data: [65, 80, 70, 95, 85, 75]
      }
    ],
    categories: ['Class A', 'Class B', 'Class C', 'Class D', 'Class E', 'Class F']
  };

  // --- Fake Data for Donut Chart ---
  const accountStatusData = {
    series: [150, 65, 25],
    labels: ['Active', 'Inactive', 'Suspended']
  };

  return (
    <Grid container spacing={gridSpacing}>
      {/* Student Enrollments Bar Chart */}
      <Grid item xs={12} md={8}>
        {/* This check ensures the chart only renders when data is available */}
        {studentEnrollmentsData.series && studentEnrollmentsData.categories ? (
          <ReusableBarChart
            title="Student Enrollments per Class"
            series={studentEnrollmentsData.series}
            xAxisCategories={studentEnrollmentsData.categories}
            yAxisTitle="Number of Students"
          />
        ) : (
          <MainCard>
            <Typography variant="h3">Student Enrollments per Class</Typography>
            <Typography variant="body2">No data to display.</Typography>
          </MainCard>
        )}
      </Grid>

      {/* Account Status Donut Chart */}
      <Grid item xs={12} md={4}>
        {/* This check ensures the chart only renders when data is available */}
        {accountStatusData.series && accountStatusData.labels ? (
          <ReusableDonutChart
            title="Account Status"
            series={accountStatusData.series}
            labels={accountStatusData.labels}
          />
        ) : (
          <MainCard>
            <Typography variant="h3">Account Status</Typography>
            <Typography variant="body2">No data to display.</Typography>
          </MainCard>
        )}
      </Grid>
    </Grid>
  );
};

export default NewRoleDashboard;