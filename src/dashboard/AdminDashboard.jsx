import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import api from 'utils/apiService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/admin');
        setStats(response.data.stats);
        setMonthlyData(response.data.monthlyData);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Total Students
              </Typography>
              <Typography variant="h3" color="text.secondary">
                {stats.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Total Teachers
              </Typography>
              <Typography variant="h3" color="text.secondary">
                {stats.totalTeachers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Total Courses
              </Typography>
              <Typography variant="h3" color="text.secondary">
                {stats.totalCourses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Activity Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                Monthly New Enrollments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;