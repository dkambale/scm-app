import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, CircularProgress, Box, Grid, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import api from 'utils/apiService';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { useTranslation } from 'react-i18next'; // <-- ADDED
const TeacherTimetableCard = () => {
    const { t } = useTranslation('dashboard'); // <-- ADDED HOOK
    const { user } = useSelector((state) => state.user);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!user?.id || !user?.accountId) {
                setError('User not authenticated.');
                setLoading(false);
                return;
            }

            const today = new Date();
            const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
            
            try {
                setLoading(true);
                const response = await api.get(
                    `/api/timetable/timeslot/day/${dayName}/${user.accountId}/${user.id}`
                );
                setTimetable(response.data || []);
            } catch (err) {
                console.error("Error fetching timetable:", err);
                setError('Failed to load timetable. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, [user]);

    return (
        <MainCard title={t('teacher.todaysTimetable')}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : timetable.length > 0 ? (
                <List>
                    {timetable.map((slot) => (
                        <React.Fragment key={slot.id}>
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {`${slot.subjectName} (${slot.type})`}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary">
                                            {`Time: ${slot.hour}:${slot.minute} - Class: ${slot.className} ${slot.divisionName}`}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            {/* <Divider /> */}
                        </React.Fragment>
                    ))}
                </List>
            ) : (
<Typography variant="body1" align="center" color="text.secondary">         
{t('teacher.noClassesScheduled')} 
                </Typography>
            )}
        </MainCard>
    );
};

export default TeacherTimetableCard;
