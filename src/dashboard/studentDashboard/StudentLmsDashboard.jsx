import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress, Chip, CircularProgress, Alert, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { gridSpacing } from 'store/constant';
import api from 'utils/apiService';
import { IconBook2 } from '@tabler/icons-react';
import { userDetails } from 'utils/apiService';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
const CourseProgressCard = ({ course }) => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const completionPercent = course.completionPercent || 0;
  const isCompleted = completionPercent >= 100;
  const progressColor = isCompleted ? 'success' : 'primary';

  const handleViewCourse = () => {
    console.log('Navigating to course:', course.id);
    // Assuming there's a view route for a specific course
    navigate(`/masters/lms/course/view/${course.courseId}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3
        }
      }}
      onClick={handleViewCourse}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h3" gutterBottom>
            {course.courseName}
          </Typography>
          <Chip label={isCompleted ? 'Completed' : 'In Progress'} color={progressColor} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {course.description}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">{completionPercent}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={completionPercent} color={progressColor} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      </CardContent>
    </Card>
  );
};
const StudentLmsDashboard = ({ studentId }) => {
  const { t } = useTranslation('dashboard');
  const { user } = useSelector((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accountId = user.accountId;

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        console.log('Fetching courses for studentId:', studentId, 'and accountId:', accountId);
        const response = await api.get(`/api/lms/courses/${accountId}/get/enrollFor/${studentId}`);
        console.log('Enrolled courses response:', response.data);
        setCourses(response.data || []);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        // setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  if (loading) {
    return (
      <Grid item xs={12} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid item xs={12} sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Grid>
    );
  }

  return (
    <Grid container spacing={gridSpacing} sx={{ p: 2, pb: 4 }}>
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconBook2 />
          <Typography variant="h4">{t('student.myCourses')}</Typography>
        </Box>
      </Grid>
      {courses.length > 0 ? (
        courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.id}>
            <CourseProgressCard course={course} />
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          {/* add here enroll selection to redirect on lms  add react router link  Link */}
          <Link to="/masters/lms">
            <Button variant="contained" color="primary">
              {t('student.enrollInCourses')}
            </Button>
          </Link>
        </Grid>
      )}
    </Grid>
  );
};

StudentLmsDashboard.propTypes = {
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

CourseProgressCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    courseName: PropTypes.string,
    description: PropTypes.string,
    completionPercent: PropTypes.number
  }).isRequired
};

export default StudentLmsDashboard;
