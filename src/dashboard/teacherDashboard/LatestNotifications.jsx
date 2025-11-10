import { Alert, Button, Divider, Grid, ListItem, ListItemText, Typography, List } from '@mui/material';
import { Box } from '@mui/system';
import { userDetails } from 'api';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import ReusableLoader from 'ui-component/loader/ReusableLoader';

const LatestNotifications = () => {
  const [loading, setLoading] = useState(true);
  
  // 1. Correct state initialization to an empty array
  const [latestNotifications, setLatestNotifications] = useState([]);

  const accountId = userDetails.getAccountId();

  useEffect(() => {
    const fetchData = async () => {
      if (!accountId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const dummyNotifications = [
          { id: 1, title: 'New policy update on attendance', user: 'Admin', action: 'update', entityType: 'POLICY' },
          { id: 2, title: 'New holiday declared', user: 'Admin', action: 'add', entityType: 'NOTIFICATION' },
          { id: 3, title: 'Fee payment reminder sent', user: 'Accountant', action: 'send', entityType: 'FEE' },
        ];

        // 2. Set the state directly with the array
        setLatestNotifications(dummyNotifications);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // It's good practice to set notifications to an empty array on error
        setLatestNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  return (
    <Grid item xs={12}>
      <MainCard title="Latest Notifications">
        {/* 3. Correctly handle the loading state first */}
        {loading ? (
          <ReusableLoader />
        ) : latestNotifications.length > 0 ? (
          // The List component here now correctly references the one from MUI
          <List>
            {latestNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={notification.title || notification.entityName}
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {notification.message || `${notification.user || 'A user'} ${notification.action.toLowerCase()} a ${notification.entityType}.`}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Alert severity="info">No new notifications.</Alert>
        )}
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button component={Link} to="/masters/notifications" variant="text">
            View All Notifications
          </Button>
        </Box>
      </MainCard>
    </Grid>
  );
};

export default LatestNotifications;