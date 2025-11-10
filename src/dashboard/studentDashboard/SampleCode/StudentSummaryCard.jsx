import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useSelector } from 'react-redux';
import api from 'utils/apiService';

// Dummy data for the summary card
const dummySummaryData = {
    totalAssignments: 15,
    upcomingExams: 3,
    enrolledCourses: 5,
    pendingSubmissions: 4
};

const StudentSummaryCard = () => {
    const { user } = useSelector((state) => state.user);
    const [summaryData, setSummaryData] = useState(dummySummaryData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // In a real application, you would fetch this data from an API
    useEffect(() => {
        // Example of a fetch call (currently commented out to use dummy data)
        // const fetchSummary = async () => {
        //     if (!user?.id) return;
        //     setLoading(true);
        //     try {
        //         const response = await api.get(`/api/dashboard/student-summary/${user.id}`);
        //         setSummaryData(response.data);
        //     } catch (err) {
        //         console.error("Error fetching summary data:", err);
        //         setError('Failed to load summary data.');
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchSummary();
    }, [user]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <MainCard title="Student Summary" sx={{ mt: 3 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Total Assignments
                            </Typography>
                            <Typography variant="h4">{summaryData.totalAssignments}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Upcoming Exams
                            </Typography>
                            <Typography variant="h4">{summaryData.upcomingExams}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Enrolled Courses
                            </Typography>
                            <Typography variant="h4">{summaryData.enrolledCourses}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Pending Submissions
                            </Typography>
                            <Typography variant="h4">{summaryData.pendingSubmissions}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default StudentSummaryCard;
