import React from 'react';
import { Box, Typography, Grid, Avatar, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import { IconCreditCard, IconAward, IconBook2 } from '@tabler/icons-react';

const StudentQuickLinks = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const actions = [
        {
            label: "My Fees",
            icon: <IconCreditCard stroke={1.5} size="1.3rem" />,
            color: theme.palette.primary.main,
            bgcolor: theme.palette.primary.light,
            route: '/masters/student/fees'
        },
        {
            label: "My Grades",
            icon: <IconAward stroke={1.5} size="1.3rem" />,
            color: theme.palette.secondary.main,
            bgcolor: theme.palette.secondary.light,
            route: '/masters/exams/student'
        },
        {
            label: "My Courses",
            icon: <IconBook2 stroke={1.5} size="1.3rem" />,
            color: theme.palette.success.dark,
            bgcolor: theme.palette.success.light,
            route: '/masters/lms'
        }
    ];

    return (
        <MainCard title="Quick Links">
            <Grid container spacing={2} justifyContent="space-around">
                {actions.map((action, index) => (
                    <Grid item xs={4} sm={4} key={index}>
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

export default StudentQuickLinks;
