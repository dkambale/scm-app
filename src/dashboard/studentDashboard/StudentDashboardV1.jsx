import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  Stack,
  Button,
  LinearProgress,
  Chip
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api, { userDetails } from 'utils/apiService';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import { IconCreditCard, IconAward, IconBook2, IconCalendarEvent, IconClipboardList, IconChevronRight, IconFileDescription } from '@tabler/icons-react';
import StudentAttendanceChart from './StudentAttendanceChart';
import StudentLmsDashboard from './StudentLmsDashboard';
import { useTranslation } from 'react-i18next'; // <-- ADDED

import TodayBirthdaysCard from '../../dashboard/TodayBirthdaysCard';
// ==============================|| STUDENT TIMETABLE COMPONENT ||============================== //
const StudentTimetable = ({ t }) => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.user);
    const theme = useTheme();

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!user?.id || !user?.accountId) {
                setError(t('common.userNotAuthenticated'));
                setLoading(false);
                return;
            }
            setLoading(true);
            const today = new Date();
            const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
            
            try {
                const payload = { page: 0, size: 1000, sortBy: 'id', sortDir: 'asc', search: '', userId: user.id };
                const response = await api.post(`/api/timetable/getAllBy/${user.accountId}`, payload);
                const todaySchedule = response.data.content
                    .flatMap(tt => tt.dayTimeTable)
                    .filter(day => day.dayName === dayName);
                
                const formattedTimetable = todaySchedule.length > 0 ? todaySchedule[0].tsd : [];
                setTimetable(formattedTimetable || []);
            } catch (err) {
                console.error("Error fetching timetable:", err);
                setError(t('student.loadTimetableError'));
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, [user, t]);

    if (loading) {
        return (
            <MainCard title={t('student.todaysTimetable')}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            </MainCard>
        );
    }

    if (error) {
        return (
            <MainCard title={t('student.todaysTimetable')}>
                <Alert severity="error">{error}</Alert>
            </MainCard>
        );
    }

    return (
        <MainCard title={t('student.todaysTimetable')} sx={{ height: '100%' }}>
            {timetable.length > 0 ? (
                <List dense>
                    {timetable.map((slot) => (
                        <ListItem key={slot.id} secondaryAction={<IconChevronRight />}>
                            <ListItemText
                                primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{`${slot.subjectName} (${slot.type})`}</Typography>}
                                secondary={<Typography variant="body2" color="text.secondary">{`${t('common.time')}: ${slot.hour}:${slot.minute} - ${t('common.teacher')}: ${slot.teacherName}`}</Typography>}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body1" align="center" color="text.secondary">
                    {t('student.noClassesScheduled')}
                </Typography>
            )}
        </MainCard>
    );
};

// ==============================|| STUDENT QUICK LINKS COMPONENT ||============================== //
const StudentQuickLinks = ({ t }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    const actions = [
        { label: t('student.myFees'), icon: <IconCreditCard stroke={1.5} size="1.3rem" />, color: theme.palette.primary.main, bgcolor: theme.palette.primary.light, route: '/masters/student/fees' },
        { label: t('student.myGrades'), icon: <IconAward stroke={1.5} size="1.3rem" />, color: theme.palette.secondary.main, bgcolor: theme.palette.secondary.light, route: '/masters/exams/student' },
        { label: t('student.myCourses'), icon: <IconBook2 stroke={1.5} size="1.3rem" />, color: theme.palette.success.dark, bgcolor: theme.palette.success.light, route: '/masters/lms' }
    ];

    return (
        <MainCard title={t('student.quickLinksTitle')} sx={{ height: '100%' }}>
            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
                {actions.map((action, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Tooltip title={action.label}>
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        ...theme.typography.largeAvatar,
                                        cursor: 'pointer',
                                        color: action.color,
                                        bgcolor: action.bgcolor,
                                        mx: 'auto',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            boxShadow: 2,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    onClick={() => navigate(action.route)}
                                >
                                    {action.icon}
                                </Avatar>
                            </Tooltip>
                            <Typography variant="body2" sx={{ mt: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {action.label}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </MainCard>
    );
};

// ==============================|| STUDENT SUMMARY CARD COMPONENT ||============================== //
const StudentSummaryCard = ({ t }) => {
    const { user } = useSelector((state) => state.user);
    const [summaryData, setSummaryData] = useState({
        totalAssignments: 0,
        upcomingExams: 0,
        enrolledCourses: 0,
        pendingSubmissions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!user?.id || !user?.accountId) {
                setError(t('common.userNotAuthenticated'));
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const now = new Date().toISOString();

                const [
                    totalAssignmentsRes,
                    pendingSubmissionsRes,
                    upcomingExamsRes,
                    enrolledCoursesRes
                ] = await Promise.all([
                    api.post(`/api/assignments/getAllBy/${user.accountId}`, { page: 0, size: 1000, sortBy: "deadLine", sortDir: "desc", fromDate: now, toDate: "2099-12-31T23:59:59.999Z",classId: user.classId,divisionId: user.divisionId,schoolId: user.schoolId }),
                    api.get(`/api/assignments/pendingAssignments/${user.accountId}/student?studentId=${user.id}&schoolId=${user.schoolId}&classId=${user.classId}&divisionId=${user.divisionId}`),
                    api.post(`/api/exams/getAllBy/${user.accountId}`, { page: 0, size: 1000, sortBy: "startDate", sortDir: "asc", fromDate: now, toDate: "2099-12-31T23:59:59.999Z" }),
                    api.get(`/api/lms/courses/${user.accountId}/get/enrollFor/${user.id}`),
                ]);

                setSummaryData({
                    totalAssignments: totalAssignmentsRes.data.totalElements || 0,
                    upcomingExams: upcomingExamsRes.data.totalElements || 0,
                    pendingSubmissions: pendingSubmissionsRes.data.length || 0,
                    enrolledCourses: enrolledCoursesRes.data.length || 0,
                });
            } catch (err) {
                console.error("Error fetching summary data:", err);
                // setError(t('student.loadSummaryError'));
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [user, t]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <MainCard>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>{t('student.totalAssignments')}</Typography>
                            <Typography variant="h4">{summaryData.totalAssignments}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>{t('student.upcomingExams')}</Typography>
                            <Typography variant="h4">{summaryData.upcomingExams}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>{t('student.enrolledCourses')}</Typography>
                            <Typography variant="h4">{summaryData.enrolledCourses}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>{t('student.pendingSubmissions')}</Typography>
                            <Typography variant="h4">{summaryData.pendingSubmissions}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </MainCard>
    );
};

// ==============================|| MY DOCUMENTS COMPONENT ||============================== //
const MyDocuments = ({ t }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!user?.id || !user?.accountId) {
                setError(t('common.userNotAuthenticated'));
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const payload = {
                    page: 0, size: 1000, sortBy: 'createdDate', sortDir: 'asc',
                    schoolId: user.schoolId, classId: user.classId, divisionId: user.divisionId, userId: user.id
                };
                const response = await api.post(`/api/documents/getAllBy/${user.accountId}?userType=STUDENT`, payload);
                setDocuments(response.data.content || []);
            } catch (err) {
                console.error("Error fetching documents:", err);
                setError(t('student.loadDocumentsError'));
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [user, t]);

    if (loading) {
        return (
            <MainCard title={t('student.myDocumentsTitle')} sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            </MainCard>
        );
    }

    if (error) {
        return (
            <MainCard title={t('student.myDocumentsTitle')} sx={{ height: '100%' }}>
                <Alert severity="error">{error}</Alert>
            </MainCard>
        );
    }

    return (
        <MainCard title={t('student.myDocumentsTitle')} sx={{ height: '100%' }}>
            {documents.length > 0 ? (
                <List dense>
                    {documents.map((doc) => (
                        <ListItem key={doc.id} secondaryAction={<IconFileDescription />}>
                            <ListItemText
                                primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{doc.fileName}</Typography>}
                                secondary={<Typography variant="body2" color="text.secondary">{`${t('common.uploaded')}: ${new Date(doc.createdDate).toLocaleDateString()} | ${t('common.type')}: ${doc.fileType}`}</Typography>}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body1" align="center" color="text.secondary">
                    {t('student.noDocumentsFound')}
                </Typography>
            )}
        </MainCard>
    );
};


// ==============================|| MAIN STUDENT DASHBOARD COMPONENT ||============================== //
const StudentDashboardV1 = () => {
    const { t } = useTranslation('dashboard'); // <-- ADDED
    const { user } = useSelector((state) => state.user);
    const [dashboardData, setDashboardData] = useState({
        upcomingAssignments: [],
        upcomingExams: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id || !user?.accountId) {
                setError(t('common.userNotAuthenticated'));
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const [assignmentsRes, examsRes] = await Promise.all([
                    // Fetch upcoming assignments
                    api.get(`/api/assignments/pendingAssignments/${user.accountId}/student?studentId=${user.id}&schoolId=${user.schoolId}&classId=${user.classId}&divisionId=${user.divisionId}`),
                    // Fetch upcoming exams
                    api.post(`/api/exams/getAllBy/${user.accountId}`, {
                        page: 0, size: 1000, sortBy: "startDate", sortDir: "asc", fromDate: new Date().toISOString(), toDate: "2099-12-31T23:59:59.999Z"
                    }),
                ]);
                
                setDashboardData({
                    upcomingAssignments: assignmentsRes.data || [],
                    upcomingExams: examsRes.data.content || [],
                });
            } catch (err) {
                console.error("Error fetching student dashboard data:", err);
                setError(t('student.loadDashboardError'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, t]);

    if (loading) {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                </Grid>
            </Grid>
        );
    }

    if (error) {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid container spacing={3}>

            <Grid item xs={12}>
                <StudentSummaryCard t={t} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}> 
                <TodayBirthdaysCard />
            </Grid>
<Grid item xs={12} md={6} lg={4}>
                    <StudentTimetable t={t} />
            </Grid>
 
            <Grid item xs={12} md={6} lg={4}>
                <StudentQuickLinks t={t} />
            </Grid>
            <Grid item xs={12}>
                <StudentLmsDashboard t={t} />
            </Grid>

            <Grid item xs={12} md={6}>
                <MainCard title={t('student.upcomingExamsTitle')} sx={{ height: '100%' }}>
                    <List dense>
                        {dashboardData.upcomingExams.length > 0 ? (
                            dashboardData.upcomingExams.map((exam) => (
                                <ListItem key={exam.id}>
                                    <ListItemText
                                        primary={exam.examName}
                                        secondary={`${t('common.date')}: ${new Date(exam.startDate).toLocaleDateString()}`}
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" align="center">
                                {t('student.noUpcomingExams')}
                            </Typography>
                        )}
                    </List>
                </MainCard>
            </Grid>
                       <Grid item xs={12} md={6} lg={4}>
                <StudentAttendanceChart studentId={user?.id} />
            </Grid>
            {/* <Grid item xs={12} md={6}>
                <MainCard title={t('student.upcomingAssignmentsTitle')} sx={{ height: '100%' }}>
                    <List dense>
                        {dashboardData.upcomingAssignments.length > 0 ? (
                            dashboardData.upcomingAssignments.map((assignment) => (
                                <ListItem key={assignment.id}>
                                    <ListItemText
                                        primary={assignment.name}
                                        secondary={`${t('common.due')}: ${new Date(assignment.deadLine).toLocaleDateString()}`}
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" align="center">
                                {t('student.noUpcomingAssignments')}
                            </Typography>
                        )}
                    </List>
                </MainCard>
            </Grid> */}
            <Grid item xs={12}>
                <MyDocuments t={t} />
            </Grid>
        </Grid>
    );
};

export default StudentDashboardV1;