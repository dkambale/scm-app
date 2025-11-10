import React from 'react';
import { Card, CardContent, Typography, Box, Button, Grid, IconButton, Avatar, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { IconBook2, IconCalendarEvent, IconClipboardList, IconPencil } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next'; // <-- ADDED
const TeacherQuickActionsCard = () => {
    const { t } = useTranslation('dashboard'); // <-- ADDED HOOK
    const navigate = useNavigate();
    const theme = useTheme();

    const actions = [
        {
            label: t('teacher.addNewAssignment'), // <-- MODIFIED
            icon: <IconClipboardList stroke={1.5} size="1.3rem" />,
            color: theme.palette.primary.main,
            bgcolor: theme.palette.primary.light,
            route: '/masters/assignment/add'
        },
        {
            label: t('teacher.takeAttendance'), // <-- MODIFIED
            icon: <IconCalendarEvent stroke={1.5} size="1.3rem" />,
            color: theme.palette.secondary.main,
            bgcolor: theme.palette.secondary.light,
            route: '/masters/attendance/add'
        },
        
        {
         label: t('teacher.createQuiz'),
            icon: <IconBook2 stroke={1.5} size="1.3rem" />,
            color: theme.palette.success.dark,
            bgcolor: theme.palette.success.light,
            route: '/masters/quiz/add'
        }
    ];

    return (
        <MainCard title={t('teacher.quickActions')}>
            <Grid container spacing={1} justifyContent="space-around">
                {actions.map((action, index) => (
                    <Grid item xs={2} sm={1} md={3} key={index}>
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

export default TeacherQuickActionsCard;
