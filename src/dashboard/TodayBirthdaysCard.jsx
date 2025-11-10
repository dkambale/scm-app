// vijayholve/scm-frontend-2-/scm-frontend-2--99de9307ae1a364fb21e20fbb2fb04cd318f2064/views/dashboard/TodayBirthdaysCard.jsx

import React, { useState, useEffect } from 'react';
import { Box, CardContent, Typography, List, ListItem, ListItemText, Divider, Avatar, useTheme } from '@mui/material';
import { IconGift } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { getTodayBirthdays } from 'utils/apiService';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

const TodayBirthdaysCard = () => {
  const { t } = useTranslation('dashboard');
  const theme = useTheme();
  const [birthdays, setBirthdays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const data = await getTodayBirthdays();
        setBirthdays(data);
      } catch (error) {
        console.error("Failed to fetch today's birthdays in component:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  const getInitials = (user) => {
    const f = user.firstName ? user.firstName.charAt(0) : '';
    const l = user.lastName ? user.lastName.charAt(0) : '';
    return (f + l).toUpperCase() || 'N/A';
  };

  const getRoleColor = (type) => {
    switch (type?.toUpperCase()) {
        case 'STUDENT': return theme.palette.info.main;
        case 'TEACHER': return theme.palette.warning.main;
        case 'ADMIN': return theme.palette.error.main;
        default: return theme.palette.grey[500];
    }
  };

  if (isLoading) {
    return (
        <MainCard title={t('student.todayBirthdays')}>
          <Box sx={{ height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={30} />
          </Box>
        </MainCard>
    );
  }

  return (
    <MainCard title={t('student.todayBirthdays')} secondary={<IconGift size="1.5rem" color={theme.palette.secondary.main} />}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {birthdays.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">
              {t('student.noBirthdaysToday')}
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ maxHeight: 350, overflowY: 'auto', px: 1 }}>
            {birthdays.map((user, index) => (
              <React.Fragment key={user.id || index}>
                <ListItem sx={{ py: 1 }}>
                  <Avatar 
                    sx={{ 
                        mr: 2, 
                        bgcolor: getRoleColor(user.type), 
                        color: theme.palette.common.white,
                        width: 40,
                        height: 40,
                        fontSize: '0.9rem' 
                    }}
                  >
                    {getInitials(user)}
                  </Avatar>
                  <ListItemText
                    primary={<Typography variant="subtitle1" noWrap>{user.firstName} {user.lastName}</Typography>}
                    secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                label={user.type} 
                                size="small" 
                                sx={{ height: 18, fontSize: '0.65rem' }} 
                                color={user.type?.toUpperCase() === 'STUDENT' ? 'primary' : 'warning'}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {user.rollNo ? `Roll: ${user.rollNo}` : user.userName}
                            </Typography>
                        </Box>
                    }
                  />
                </ListItem>
                {index < birthdays.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </MainCard>
  );
};

export default TodayBirthdaysCard;