import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import api from '../../utils/apiService';
import donutchartData from './chart-data/donutchartData';

const GenderChart = ({ isLoading } ) => {
  const user = useSelector((state) => state.user.user);
  const [genderData, setGenderData] = useState(donutchartData);
  const [totalStudent, setTotalStudent] = useState(0);
  useEffect(() => {
    // Replace with your actual API endpoint for gender data
    api
      .get(`api/dashboard/getGenderCount/${user?.accountId}?type=TEACHER`)
      .then((response) => {
        // Assume response.data = { Male: 10, Female: 15 }
        const data = response.data || {};
        setGenderData((prev) => ({
          ...prev,
          series: [data.Male || 0, data.Female || 0]
        }));
      })
      .catch((err) => {
        setGenderData((prev) => ({
          ...prev,
          series: [0, 0]
        }));
      });
  }, [user]);
  const theme = useTheme();


  return (
    <MainCard>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Typography variant="h5">Gender Distribution</Typography>
        </Grid>
        <Grid item>
          <Chart
            options={genderData.options}
            series={genderData.series}
            type="donut"
            height={300}
          />
        </Grid>
        <Grid item>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Typography variant="subtitle2" color={theme.palette.primary.main}>
                Male: {genderData.series[0]}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2" color={theme.palette.secondary.main}>
                Female: {genderData.series[1]}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default GenderChart;
