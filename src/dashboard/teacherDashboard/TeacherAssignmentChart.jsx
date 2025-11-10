import React, { useState, useEffect, useMemo } from 'react'; // <-- ADDED useMemo
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import MainCard from 'ui-component/cards/MainCard';
import ReusableBarChart from 'ui-component/charts/ReusableBarChart';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import api from 'utils/apiService';
import { useTranslation } from 'react-i18next'; 
// NOTE: Removed 'import i18n from 'i18next';' as it's not needed here

const TeacherAssignmentChart = () => {
    const { t } = useTranslation('dashboard');
    const theme = useTheme();
    const { user } = useSelector((state) => state.user);
    // Renamed state to hold raw, non-translated data
    const [rawData, setRawData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect: Handles API fetching and raw data setting (runs once + on user change)
    useEffect(() => {
        const fetchAssignmentData = async () => {
            if (!user?.id) {
                setError('User ID not available.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Assuming you intended to use the API response, but using the structure for the chart:
                const response = await api.get(`api/assignments/assignmentList/${user.accountId}/school/${user.schoolId}`);
                const data = response.data || [];
                
                // If you are still using the hardcoded dummy data for testing, you would uncomment this:
                /* const data = [
                    { "assignmentName": "Maths Homework", "completeCount": 20, "failCount": 10 },
                    { "assignmentName": "Science Project", "completeCount": 15, "failCount": 15 },
                    { "assignmentName": "History Essay", "completeCount": 28, "failCount": 2 }
                ];
                */

                if (data.length === 0) {
                    setRawData(null);
                    return;
                }
                
                // Set the raw, non-translated data
                setRawData(data); 

            } catch (err) {
                console.error("Error fetching assignment data:", err);
                toast.error(t('teacher.loadingAssignment'));
                setError(t('teacher.loadingAssignment')); 
            } finally {
                setLoading(false);
            }
        };

        fetchAssignmentData();
        // Removed 't' dependency. This function should only run when data changes, not when language changes.
    }, [user, user?.id]); 

    // useMemo: Creates the final chart structure, recalculating only when rawData or language ('t') changes
    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) {
            return null;
        }

        const assignmentNames = rawData.map(item => item.assignmentName);
        const completedData = rawData.map(item => item.completeCount);
        const pendingData = rawData.map(item => item.failCount);
        
        return {
            series: [
                // *** FIX: Use translated strings for series names ***
                { name: t('teacher.assignmentCompleted'), data: completedData }, 
                { name: t('teacher.assignmentPending'), data: pendingData }     
            ],
            categories: assignmentNames
        };
    }, [rawData, t]); // <-- Dependency on 't' ensures re-render on language change

    if (loading) {
        return (
            <MainCard title={t('teacher.assignmentStatus')}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            </MainCard>
        );
    }

    if (error) {
        return (
            <MainCard title={t('teacher.assignmentStatus')}> 
                <Alert severity="error">{error}</Alert>
            </MainCard>
        );
    }
    
    if (!chartData) {
        return (
            <MainCard title={t('teacher.assignmentStatus')}>
                <Typography variant="body1" align="center" color="text.secondary">
                    {t('admin.noNewNotifications')} 
                </Typography>
            </MainCard>
        );
    }

    return (
        <ReusableBarChart
            title={t('teacher.assignmentStatus')} 
            series={chartData.series} // Use memoized, translated series
            xAxisCategories={chartData.categories}
            yAxisTitle={t('teacher.yAxisTitle')} 
            height={350}
            chartId="assignment-status-chart"
            colors={[theme.palette.success.main, theme.palette.warning.main]}
            plotOptions={{
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    stacked: true
                }
            }}
        />
    );
};

export default TeacherAssignmentChart;