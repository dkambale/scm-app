import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, CircularProgress, Box, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import api from 'utils/apiService';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';

const StudentTimetable = () => {
    const { user } = useSelector((state) => state.user);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

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
                // Assuming an API endpoint to get a student's timetable for a specific day
                const response = await api.get(
                    `/api/timetable/timeslot/day/student/${dayName}/${user.accountId}/${user.id}`
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

    if (loading) {
        return (
            <MainCard title="Today's Timetable">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            </MainCard>
        );
    }

    if (error) {
        return (
            <MainCard title="Today's Timetable">
                <Alert severity="error">{error}</Alert>
            </MainCard>
        );
    }
    
    return (
        <MainCard title="Today's Timetable">
            {timetable.length > 0 ? (
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
                                            {`Time: ${slot.hour}:${slot.minute} - Teacher: ${slot.teacherName}`}
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
                    No classes scheduled for today.
                </Typography>
            )}
        </MainCard>
    );
};

export default StudentTimetable;
