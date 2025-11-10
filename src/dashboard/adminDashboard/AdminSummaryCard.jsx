import { Card, CardContent, Grid, Typography } from '@mui/material';
import api from 'utils/apiService';
import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { useSelector } from 'react-redux';

const summaryData = {
  totalAmount: 0,
  totalPaid: 0,
  totalPending: 0
};

const AdminSummaryCard = () => {
  const [data, setData] = useState(summaryData);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
       try {
      const summaryPayload = {
        page: 0,
        size: 10,
        sortBy: 'id',
        sortDir: 'asc',
        // schoolId: selectedSchool || null,
        // classId: selectedClass || null,
        // divisionId: selectedDivision || null,
        // fromYear: fromYear || null,
        // toYear: toYear || null
      };
      // Attempt POST with body; if not supported by browser/server, fall back to query params
      try {
        const resp = await api.post(`/api/admin/fees/summary/v1/${user?.user?.accountId}`, summaryPayload);
        setSummaryData({
          fees: [],
          totalAmount: resp?.data?.total || 0,
          totalPaid: resp?.data?.paid || 0,
          totalPending: resp?.data?.due || 0
        });
      } catch (e) {
        const params = new URLSearchParams({
          page: 0,
          size: 10,
          sortBy: 'id',
          sortDir: 'asc',
        //   schoolId: selectedSchool || '',
        //   classId: selectedClass || '',
        //   divisionId: selectedDivision || '',
        //   fromYear: fromYear || '',
        //   toYear: toYear || ''
        });
        const resp2 = await api.post(`/api/admin/fees/summary/v1/${user?.user?.accountId}`, params);
        setSummaryData({
          fees: [],
          totalAmount: resp2?.data?.total || 0,
          totalPaid: resp2?.data?.paid || 0,
          totalPending: resp2?.data?.due || 0
        });
      }
    } catch (err) {
      setSummaryData({ fees: [], totalAmount: 0, totalPaid: 0, totalPending: 0 });
    }
    };
    fetchData();
  }, [user?.user?.accountId]);

  return (
    <>
      <MainCard>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Amount
                </Typography>
                <Typography variant="h4">{data.totalAmount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Paid
                </Typography>
                <Typography variant="h4">{data.totalPaid}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4">{data.totalPending}</Typography>
              </CardContent>
            </Card> 
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default AdminSummaryCard;