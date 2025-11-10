import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useSelector } from 'react-redux';
import MainCard from 'ui-component/cards/MainCard';
import api, { userDetails } from 'utils/apiService';
import { gridSpacing } from 'store/constant';
import { Link } from 'react-router-dom';

// Icons for card headers
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// Fee Dashboard Component
import FeeDashboard from './FeeDashboard';
import ReusableLoader from 'ui-component/loader/ReusableLoader';
import { useTranslation } from 'react-i18next'; // <-- ADDED
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalStudents: 0,
    totalStaff: 0,
    attendanceSummary: { present: 0, absent: 0 },
    latestNotifications: []
  });

  const accountId = userDetails.getAccountId();
const { t } = useTranslation('dashboard'); // <-- ADDED HOOK
  useEffect(() => {
    const fetchData = async () => {
      if (!accountId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [totalStudentsRes, totalStaffRes] = await Promise.all([
          api.get(`api/dashboard/getCounts/${accountId}?type=STUDENT`),
          api.get(`api/dashboard/getCounts/${accountId}?type=TEACHER`)
        ]);
        console.log(totalStudentsRes.data);
        console.log(totalStaffRes.data);
        const studentCount = totalStudentsRes.data?.nameVsValue?.StudentCount || 0;
        const staffCount = totalStaffRes.data?.nameVsValue?.TeacherCount || 0;

        // Use dummy data for other sections as requested
        const dummyNotifications = [
          { id: 1, title: 'New policy update on attendance', user: 'Admin', action: 'update', entityType: 'POLICY' },
          { id: 2, title: 'New holiday declared', user: 'Admin', action: 'add', entityType: 'NOTIFICATION' },
          { id: 3, title: 'Fee payment reminder sent', user: 'Accountant', action: 'send', entityType: 'FEE' }
        ];
        // Fetch today's attendance trend for the account
        // Calculate startDate (yesterday) and endDate (today) in 'YYYY-MM-DD' format
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // Format dates as 'YYYY-MM-DD'
        const pad = (n) => n.toString().padStart(2, '0');
        const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        const endDateStr = formatDate(today);
        const startDateStr = formatDate(yesterday);

        // Call attendance-trend API
        let dummyAttendance = { present: 0, absent: 0 };
        try {
          const attendanceRes = await api.get(
            `/api/dashboard/student/${accountId}/attendance-trend?startDate=${startDateStr}&endDate=${endDateStr}`
          );
          // The API returns an array, take the last (today's) entry if available
          const attendanceArr = attendanceRes.data || [];
          if (attendanceArr.length > 0) {
            // Find the entry for today (endDateStr)
            const todayEntry = attendanceArr.find((item) => item.date === endDateStr) || attendanceArr[attendanceArr.length - 1];
            dummyAttendance.present = todayEntry?.count || 0;
            dummyAttendance.absent = todayEntry?.failCount || 0;
          }
        } catch (err) {
          console.error('Error fetching attendance trend:', err);
        }

        setData({
          totalStudents: studentCount,
          totalStaff: staffCount,
          attendanceSummary: {
            present: dummyAttendance.present,
            absent: dummyAttendance.absent
          },
          latestNotifications: dummyNotifications
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  const SummaryCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', borderLeft: `5px solid ${color}` }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box sx={{ color: color }}>{icon}</Box>
          </Grid>
          <Grid item>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
return <ReusableLoader message={t('admin.loadingDashboard')} ></ReusableLoader>;  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={gridSpacing}>
        {/* Student & Staff Summary and Today's Attendance */}
        <Grid item xs={12}>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12} md={6} lg={3}>
              <SummaryCard
          title={t('admin.totalStudents')}
                value={data.totalStudents}
                icon={<SchoolOutlinedIcon sx={{ fontSize: 40 }} />}
                color="#4caf50" // Green
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <SummaryCard
  title={t('admin.totalStaff')}
                value={data.totalStaff}
                icon={<PeopleAltOutlinedIcon sx={{ fontSize: 40 }} />}
                color="#2196f3" // Blue
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <SummaryCard
             title={t('admin.todayPresent')}
                value={data.attendanceSummary.present}
                icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 40 }} />}
                color="#ff9800" // Orange
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <SummaryCard
                title={t('admin.todayAbsent')} // <-- TRANSLATED
                value={data.attendanceSummary.absent}
                icon={<CancelOutlinedIcon sx={{ fontSize: 40 }} />}
                color="#f44336" // Red
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Fee Dashboard - Summary Cards & Filters */}
        <Grid item xs={12}>
          <FeeDashboard />
        </Grid>

        {/* Latest Notifications Section */}
        <Grid item xs={12}>
        <MainCard title={t('admin.latestNotifications')}>
            {data.latestNotifications.length > 0 ? (
              <List>
                {data.latestNotifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={notification.title || notification.entityName}
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {notification.message ||
                              `${notification.user || 'A user'} ${notification.action.toLowerCase()} a ${notification.entityType}.`}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">{t('admin.noNewNotifications')}</Alert>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button component={Link} to="/masters/notifications" variant="text">
                {t('admin.viewAllNotifications')}
              </Button>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
