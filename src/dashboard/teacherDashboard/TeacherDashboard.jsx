import React, { useState } from 'react';
import { Grid, Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dashboard as DashboardIcon, People as PeopleIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import api, { userDetails } from 'utils/apiService';
import TeacherTimetableCard from './TeacherTimetableCard';
import TeacherAssignmentChart from './TeacherAssignmentChart';
import TeacherQuickActionsCard from './TeacherQuickActionsCard';
import TeacherStudentDashboard from './TeacherStudentDashboard';
import { useTranslation } from 'react-i18next'; // <-- ADDED 
import TodayBirthdaysCard from '../../dashboard/TodayBirthdaysCard'; // <-- ADDED
const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard'); // <-- ADDED HOOK
  const [showStudentDashboard, setShowStudentDashboard] = useState(false);

  const accountId = userDetails.getAccountId();

  const handleStudentDashboardToggle = () => {
    setShowStudentDashboard(!showStudentDashboard);
  };

  if (showStudentDashboard) {
    return (
      <Box sx={{ padding: 2 }}>
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Typography variant="h4" sx={{ mb: { xs: 2, sm: 0 } }}>
            {t('studentDashboard.studentDashboardTitle')}
          </Typography>
          <Button variant="outlined" onClick={handleStudentDashboardToggle} startIcon={<DashboardIcon />}>
            {t('studentDashboard.backToMainDashboard')}
          </Button>
        </Box>
        <TeacherStudentDashboard />
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ padding: 2 }}>
      {/* Student Dashboard Access Card */}
      <Grid item xs={12}>
        <Card
          sx={{
            bgcolor: 'primary.light',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4
            }
          }}
          onClick={handleStudentDashboardToggle}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: { xs: 2, sm: 0 } }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {t('studentDashboard.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('studentDashboard.text2')}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', sm: 'flex-end' }
                }}
              >
                <Box textAlign="center">
                  <TrendingUpIcon color="success" />
                  <Typography variant="caption" display="block">
                    {t('studentDashboard.tabs.performance')}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <PeopleIcon color="info" />
                  <Typography variant="caption" display="block">
                    {t('studentDashboard.tabs.attendance')}
                  </Typography>
                </Box>
                <Button variant="contained" color="primary" onClick={handleStudentDashboardToggle}>
                    {t('studentDashboard.tabs.openDashboard')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Existing Dashboard Components */}
      <Grid item xs={12} sm={12} md={6}>
        <TeacherTimetableCard />
      </Grid>
      <Grid item xs={12} sm={12} md={6}>
        <TeacherQuickActionsCard />
      </Grid>
      <Grid item xs={12} sm={12} md={6}>
        <TeacherAssignmentChart />
      </Grid> 
               <Grid item xs={12} md={6} lg={4}> 
                      <TodayBirthdaysCard />
                  </Grid>
    </Grid>
  );
};

export default TeacherDashboard;
