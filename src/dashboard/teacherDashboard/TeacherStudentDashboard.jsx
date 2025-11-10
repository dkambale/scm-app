import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import MainCard from 'ui-component/cards/MainCard';
import { useDataCache } from 'contexts/DataCacheContext';
import { api, userDetails } from 'utils/apiService';
import { useSCDData } from 'contexts/SCDProvider';
import { useTranslation } from 'react-i18next';
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`class-tabpanel-${index}`} aria-labelledby={`class-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TeacherStudentDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const { fetchData } = useDataCache();
  const { t } = useTranslation('dashboard'); // i18n namespace
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherDivisions, setTeacherDivisions] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});

  const { classes = [], divisions = [] } = useSCDData();

  // Generate dummy student data
  const generateDummyStudents = (classId, divisionId) => {
    const dummyStudents = [];
    const studentCount = Math.floor(Math.random() * 15) + 20; // 20-35 students per class

    for (let i = 1; i <= studentCount; i++) {
      const studentId = `${classId}${divisionId}${i}`;
      const names = [
        'Aarav',
        'Vivaan',
        'Aditya',
        'Vihaan',
        'Arjun',
        'Sai',
        'Reyansh',
        'Krishna',
        'Ishaan',
        'Shaurya',
        'Saanvi',
        'Aadya',
        'Kiara',
        'Diya',
        'Aadhya',
        'Kavya',
        'Ananya',
        'Fatima',
        'Ira',
        'Myra'
      ];
      const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Jain', 'Agarwal', 'Verma', 'Yadav', 'Mishra'];

      const firstName = names[Math.floor(Math.random() * names.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      dummyStudents.push({
        id: parseInt(studentId),
        firstName,
        lastName,
        rollNumber: `R${i.toString().padStart(3, '0')}`,
        classId,
        divisionId,
        profileImage: null,
        // Generate consistent dummy data
        todayAttendance: Math.random() > 0.15 ? 'PRESENT' : 'ABSENT',
        averageGrade: Math.floor(Math.random() * 40) + 60, // 60-99
        attendancePercentage: Math.floor(Math.random() * 30) + 70, // 70-99
        presentDays: Math.floor(Math.random() * 80) + 120, // 120-199
        absentDays: Math.floor(Math.random() * 20) + 5, // 5-24
        pendingAssignments: Math.floor(Math.random() * 6), // 0-5
        subjectGrades: [
          { name: 'Mathematics', grade: Math.floor(Math.random() * 40) + 60 },
          { name: 'Science', grade: Math.floor(Math.random() * 40) + 60 },
          { name: 'English', grade: Math.floor(Math.random() * 40) + 60 },
          { name: 'Social Studies', grade: Math.floor(Math.random() * 40) + 60 }
        ]
      });
    }

    return dummyStudents;
  };

  useEffect(() => {
    if (user?.allocatedClasses && classes.length > 0 && divisions.length > 0) {
      const teacherClassList = Array.from(new Set(user.allocatedClasses.map((ac) => ac.classId).filter(Boolean)));
      const teacherDivisionList = Array.from(new Set(user.allocatedClasses.map((ac) => ac.divisionId).filter(Boolean)));

      console.log('teacherClassList:', teacherClassList);
      console.log('teacherDivisionList:', teacherDivisionList);

      // Filter the classes and divisions from SCD data (REAL DATA)
      const teacherClassDetails = classes.filter((c) => teacherClassList.includes(c.id));
      const teacherDivisionDetails = divisions.filter((d) => teacherDivisionList.includes(d.id));

      console.log('teacherClassDetails:', teacherClassDetails);
      console.log('teacherDivisionDetails:', teacherDivisionDetails);

      setTeacherClasses(teacherClassDetails);
      setTeacherDivisions(teacherDivisionDetails);

      // Set default selections
      if (teacherClassDetails.length > 0) {
        setSelectedClass(teacherClassDetails[0].id);
      }
      if (teacherDivisionDetails.length > 0) {
        setSelectedDivision(teacherDivisionDetails[0].id);
      }
    }
  }, [user?.allocatedClasses, classes, divisions]);

  useEffect(() => {
    if (selectedClass && selectedDivision && user?.id) {
      fetchStudentsDashboard();
    }
  }, [selectedClass, selectedDivision, user?.id]);

  const fetchStudentsDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with real API call when backend provides dashboard data
      // const accountId = userDetails.getAccountId();
      // const payload = {
      //   page: 0,
      //   pageSize: 100,
      //   sortBy: 'firstName',
      //   sortDir: 'ASC',
      //   divisionList: [selectedDivision],
      //   classList: [selectedClass],
      //   schoolId: user.schoolId
      // };
      // const result = await api.post(`/api/users/getAllBy/${accountId}?type=STUDENT`, payload);

      // For now, generate dummy students data
      const dummyStudents = generateDummyStudents(selectedClass, selectedDivision);

      setStudentsData(dummyStudents);
      calculateDashboardStats(dummyStudents);
    } catch (err) {
      console.error('Error fetching students dashboard:', err);
      setError('Failed to load students data');
      setStudentsData([]);
      setDashboardStats({});
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardStats = (students) => {
    const totalStudents = students.length;
    const presentToday = students.filter((s) => s.todayAttendance === 'PRESENT').length;
    const averageGrade = totalStudents > 0 ? students.reduce((sum, s) => sum + (s.averageGrade || 0), 0) / totalStudents : 0;
    const pendingAssignments = students.reduce((sum, s) => sum + (s.pendingAssignments || 0), 0);

    setDashboardStats({
      totalStudents,
      presentToday,
      attendancePercentage: totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0,
      averageGrade: Math.round(averageGrade * 10) / 10,
      pendingAssignments
    });
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    setTabValue(0);
  };

  const handleDivisionChange = (event) => {
    setSelectedDivision(event.target.value);
    setTabValue(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getSelectedClassName = () => {
    const classObj = teacherClasses.find((c) => c.id === selectedClass);
    return classObj?.name || '';
  };

  const getSelectedDivisionName = () => {
    const divisionObj = teacherDivisions.find((d) => d.id === selectedDivision);
    return divisionObj?.name || '';
  };

  // Filter students by selected class and division
  const getFilteredStudents = () => {
    if (!selectedClass || !selectedDivision) return [];
    return studentsData.filter((student) => student.classId === selectedClass && student.divisionId === selectedDivision);
  };

  const filteredStudents = getFilteredStudents();

  // Show warning if no teacher classes available yet
  if (!user?.allocatedClasses || user.allocatedClasses.length === 0) {
    return (
      <MainCard title={t('studentDashboard.title')}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('studentDashboard.noAllocatedClasses')}
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title={t('studentDashboard.title')}>
      {/* Class and Division Selectors */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('studentDashboard.selectClass')}</InputLabel>
              <Select
                value={selectedClass}
                onChange={handleClassChange}
                label={t('studentDashboard.selectClass')}
                disabled={teacherClasses.length === 0}
              >
                {teacherClasses.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('studentDashboard.selectDivision')}</InputLabel>
              <Select
                value={selectedDivision}
                onChange={handleDivisionChange}
                label={t('studentDashboard.selectDivision')}
                disabled={teacherDivisions.length === 0}
              >
                {teacherDivisions.map((division) => (
                  <MenuItem key={division.id} value={division.id}>
                    {division.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              {getSelectedClassName()} - {getSelectedDivisionName()}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* Dashboard Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PeopleIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {dashboardStats.totalStudents || 0}
                      </Typography>
                      <Typography variant="body2">{t('studentDashboard.summary.totalStudents')}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <SchoolIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {dashboardStats.attendancePercentage || 0}%
                      </Typography>
                      <Typography variant="body2">{t('studentDashboard.summary.attendanceToday')}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <GradeIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {dashboardStats.averageGrade || 0}
                      </Typography>
                      <Typography variant="body2">{t('studentDashboard.summary.averageGrade')}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AssignmentIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {dashboardStats.pendingAssignments || 0}
                      </Typography>
                      <Typography variant="body2">{t('studentDashboard.summary.pendingTasks')}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Student Details Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="teacher form tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label={t('studentDashboard.tabs.studentList')} />
                <Tab label={t('studentDashboard.tabs.performance')} />
                <Tab label={t('studentDashboard.tabs.attendance')} />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <StudentListView students={filteredStudents} t={t} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <PerformanceOverview students={filteredStudents} t={t} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <AttendanceTracking students={filteredStudents} t={t} />
            </TabPanel>
          </Card>
        </>
      )}
    </MainCard>
  );
};

// Student List Component
const StudentListView = ({ students, t }) => (
  <Grid container spacing={2}>
    {students.length === 0 ? (
      <Grid item xs={12}>
        <Typography variant="body1" textAlign="center" color="text.secondary" py={4}>
          {t('studentDashboard.studentList.noData')}
        </Typography>
      </Grid>
    ) : (
      students.map((student, index) => (
        <Grid item xs={12} sm={6} md={4} key={student.id || index}>
          <Card sx={{ '&:hover': { boxShadow: 4 } }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={`${student.firstName} ${student.lastName}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    student.firstName?.charAt(0) || 'S'
                  )}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {`${student.firstName || ''} ${student.lastName || ''}`.trim()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('studentDashboard.studentList.roll')}: {student.rollNumber || 'N/A'}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip
                      label={student.todayAttendance || t('studentList.unknown')}
                      size="small"
                      color={student.todayAttendance === 'PRESENT' ? 'success' : 'error'}
                    />
                    <Chip
                      label={t('studentDashboard.studentList.grade', { value: student.averageGrade || 'N/A' })}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))
    )}
  </Grid>
);

// Performance Overview Component
const PerformanceOverview = ({ students, t }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      {t('studentDashboard.performance.title')}
    </Typography>
    {students.length === 0 ? (
      <Typography variant="body1" textAlign="center" color="text.secondary" py={4}>
        {t('studentDashboard.performance.noData')}
      </Typography>
    ) : (
      <Grid container spacing={3}>
        {students.map((student, index) => (
          <Grid item xs={12} md={6} key={student.id || index}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>{student.firstName?.charAt(0) || 'S'}</Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {`${student.firstName || ''} ${student.lastName || ''}`.trim()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('studentDashboard.performance.overallGrade', { value: student.averageGrade || 'N/A' })}
                    </Typography>
                  </Box>
                </Stack>

                {/* Subject-wise performance bars */}
                {student.subjectGrades &&
                  student.subjectGrades.map((subject, idx) => (
                    <Box key={idx} mb={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{subject.name}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {subject.grade}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={subject.grade}
                        sx={{ height: 6, borderRadius: 3 }}
                        color={subject.grade >= 80 ? 'success' : subject.grade >= 60 ? 'primary' : 'warning'}
                      />
                    </Box>
                  ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);

// Attendance Tracking Component
const AttendanceTracking = ({ students, t }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      {t('studentDashboard.attendance.title')}
    </Typography>
    {students.length === 0 ? (
      <Typography variant="body1" textAlign="center" color="text.secondary" py={4}>
        {t('studentDashboard.attendance.noData')}
      </Typography>
    ) : (
      <Grid container spacing={2}>
        {students.map((student, index) => (
          <Grid item xs={12} sm={6} md={4} key={student.id || index}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>{student.firstName?.charAt(0) || 'S'}</Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {`${student.firstName || ''} ${student.lastName || ''}`.trim()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('studentDashboard.attendance.attendance', { value: student.attendancePercentage || 0 })}
                    </Typography>
                  </Box>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={student.attendancePercentage || 0}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  color={
                    (student.attendancePercentage || 0) >= 90 ? 'success' : (student.attendancePercentage || 0) >= 75 ? 'primary' : 'error'
                  }
                />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">{t('studentDashboard.attendance.present', { value: student.presentDays || 0 })}</Typography>
                  <Typography variant="caption">{t('studentDashboard.attendance.absent', { value: student.absentDays || 0 })}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);

export default TeacherStudentDashboard;
