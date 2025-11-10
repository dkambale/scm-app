export const getAttendanceBarChartOptions = (theme) => {
    return {
// No export provided here; this is just a config object property, not a module export.
chart: {
    id: 'attendance-bar-chart',
    type: 'bar',
    stacked: true,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '50%',
    }
  },
  xaxis: {
    categories: [],
    title: { text: 'Class' }
  },
  yaxis: {
    title: { text: 'Number of Students' }
  },
  legend: {
    position: 'top'
  },
  colors: [theme.palette.success.main, theme.palette.error.main],
  dataLabels: {
    enabled: true
  },
  tooltip: {
    y: {
      formatter: (val) => val
    }
  }
}
}


