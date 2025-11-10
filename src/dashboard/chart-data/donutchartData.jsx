import { useTheme } from '@mui/material/styles';

const useDonutChartData = () => {
  const theme = useTheme();
  return {
    series: [0, 0],
    options: {
      chart: {
        type: 'donut',
        height: 300
      },
      labels: ['Male', 'Female'],
      legend: {
        position: 'bottom'
      },
      colors: [theme.palette.primary.main, theme.palette.secondary.main],
      dataLabels: {
        enabled: true
      }
    }
  };
};

export default useDonutChartData;