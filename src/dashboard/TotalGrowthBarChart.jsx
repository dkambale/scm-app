import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// project imports
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// chart data
import chartDataConfig from './chart-data/total-growth-bar-chart';
import { useSelector } from 'react-redux';
import api from '../../utils/apiService';

const status = [
  {
    value: 'today',
    label: 'Today'
  },
  {
    value: 'month',
    label: 'This Month'
  },
  {
    value: 'year',
    label: 'This Year'
  }
];

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const StudentPerClassBarChart = ({ isLoading }) => {
  const [value, setValue] = React.useState('today');
  const theme = useTheme();
  const [chartData, setChartData] = useState(chartDataConfig);
  const[totalStudent, setTotalStudent] = useState(0);

  const { primary } = theme.palette.text;
  const divider = theme.palette.divider;
  const grey500 = theme.palette.grey[500];

  const primary200 = theme.palette.primary[200];
  const primaryDark = theme.palette.primary.dark;
  const secondaryMain = theme.palette.secondary.main;
  const secondaryLight = theme.palette.secondary.light;

  const user = useSelector((state) => state.user.user);
  useEffect(() => {
    api
      .get(`api/dashboard/getStudentPerClass/${user?.data?.accountId}?type=TEACHER`)
      .then((response) => {
        console.log(response);
        replaceChartSeries(response);
      })
      .catch((err) => console.error(err));
  },  [primary200, primaryDark, secondaryMain, secondaryLight, primary, divider, isLoading, grey500]);

  const replaceChartSeries = (response) => {
    const dataObj = response.data;
    const categories = Object.keys(dataObj);
    const dataArr = Object.values(dataObj);

    const newChartData = {
      ...chartDataConfig.options,
      series: [{data: dataArr, name: 'Student' }],
      xaxis: {
        categories: categories
      }
    };
   setTotalStudent(dataArr.reduce((acc, curr) => acc + curr, 0));
  setChartData(newChartData);
    console.log('New Chart Data:', newChartData);
    ApexCharts.exec(`bar-chart`, 'updateOptions', newChartData);
  }


  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Typography variant="subtitle2">Total Student</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h3">{totalStudent}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <TextField id="standard-select-currency" select value={value} onChange={(e) => setValue(e.target.value)}>
                    {status.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                '& .apexcharts-menu.apexcharts-menu-open': {
                  bgcolor: 'background.paper'
                }
              }}
            >
              <Chart {...chartData} />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

StudentPerClassBarChart.propTypes = {
  isLoading: PropTypes.bool
};

export default StudentPerClassBarChart;
