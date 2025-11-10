import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import ReusableBarChart from 'ui-component/charts/ReusableBarChart';
import { gridSpacing } from 'store/constant';

// redux
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
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalStudent, setTotalStudent] = useState(0);

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    api
      .get(`api/dashboard/getStudentPerClass/${user?.data?.accountId}?type=TEACHER`)
      .then((response) => {
        console.log(response);
        processChartData(response);
      })
      .catch((err) => console.error(err));
  }, [user?.data?.accountId]);

  const processChartData = (response) => {
    const dataObj = response.data;
    const categoryList = Object.keys(dataObj);
    const dataArr = Object.values(dataObj);

    // Set chart data for ReusableBarChart
    setSeries([
      {
        name: 'Students',
        data: dataArr
      }
    ]);
    setCategories(categoryList);
    setTotalStudent(dataArr.reduce((acc, curr) => acc + curr, 0));
  };

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <ReusableBarChart
          series={series}
          xAxisCategories={categories}
          xAxisTitle="Classes"
          yAxisTitle="Number of Students"
          chartId="student-per-class-chart"
          height={480}
          customHeader={
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Grid container direction="column" spacing={1}>
                  <Grid item>
                    <Typography variant="subtitle2">Total Students</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h3">{totalStudent}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <TextField 
                  id="standard-select-currency" 
                  select 
                  value={value} 
                  onChange={(e) => setValue(e.target.value)}
                >
                  {status.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          }
        />
      )}
    </>
  );
};

StudentPerClassBarChart.propTypes = {
  isLoading: PropTypes.bool
};

export default StudentPerClassBarChart; 