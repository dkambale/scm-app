import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chart from 'react-apexcharts';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

const ReusableBarChart = ({
  title,
  subtitle,
  series = [],
  xAxisCategories = [],
  xAxisTitle = '',
  yAxisTitle = '',
  height = 480,
  showCard = true,
  chartId = 'reusable-bar-chart',
  colors,
  dataLabels = { enabled: false },
  plotOptions = {},
  customHeader,
  ...otherChartOptions
}) => {
  const theme = useTheme();
  const { primary } = theme.palette.text;
  const divider = theme.palette.divider;

  const defaultColors = colors || [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main
  ];

  const defaultChartOptions = {
    chart: {
      id: chartId,
      type: 'bar',
      height: height,
      toolbar: {
        show: true
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        },
        ...plotOptions.bar
      },
      ...plotOptions
    },
    dataLabels: dataLabels,
    stroke: {
      show: false,
      width: 0
    },
    xaxis: {
      categories: xAxisCategories,
      title: {
        text: xAxisTitle,
        style: {
          color: primary
        }
      },
      labels: {
        style: {
          colors: primary
        }
      },
      axisBorder: {
        show: true,
        color: divider
      },
      axisTicks: {
        show: true,
        color: divider
      }
    },
    yaxis: {
      title: {
        text: yAxisTitle,
        style: {
          color: primary
        }
      },
      labels: {
        style: {
          colors: primary
        }
      }
    },
    fill: {
      type: 'solid',
      opacity: 1,
      colors: defaultColors
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: function (val) {
          return val.toString();
        }
      }
    },
    legend: {
      labels: {
        colors: primary
      }
    },
    grid: {
      borderColor: divider,
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        left: 0,
        right: 0
      }
    },
    colors: defaultColors,
    ...otherChartOptions
  };

  const chartConfig = {
    options: defaultChartOptions,
    series: series
  };

  const ChartContent = () => (
    <Grid container spacing={gridSpacing}>
      {customHeader ? (
        <Grid item xs={12}>
          {customHeader}
        </Grid>
      ) : (title || subtitle) && (
        <Grid item xs={12}>
          <Grid container direction="column" spacing={1}>
            {subtitle && (
              <Grid item>
                <Typography variant="subtitle2">{subtitle}</Typography>
              </Grid>
            )}
            {title && (
              <Grid item>
                <Typography variant="h3">{title}</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
      <Grid
        item
        xs={12}
        sx={{
          '& .apexcharts-menu.apexcharts-menu-open': {
            bgcolor: 'background.paper'
          }
        }}
      >
        <Chart {...chartConfig} />
      </Grid>
    </Grid>
  );

  return showCard ? (
    <MainCard>
      <ChartContent />
    </MainCard>
  ) : (
    <ChartContent />
  );
};

ReusableBarChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      data: PropTypes.array.isRequired
    })
  ).isRequired,
  xAxisCategories: PropTypes.array,
  xAxisTitle: PropTypes.string,
  yAxisTitle: PropTypes.string,
  height: PropTypes.number,
  showCard: PropTypes.bool,
  chartId: PropTypes.string,
  colors: PropTypes.array,
  dataLabels: PropTypes.object,
  plotOptions: PropTypes.object,
  customHeader: PropTypes.node
};

export default ReusableBarChart;