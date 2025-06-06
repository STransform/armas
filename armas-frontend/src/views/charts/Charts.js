import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
} from 'chart.js';
import axios from 'axios';
import {
  Business,
  Description,
  CheckCircle,
  Cancel,
  PieChart,
  Timeline,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import './Chart.css';
import 'animate.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip);

// Custom Materially-inspired theme
const theme = createTheme({
  palette: {
    primary: { main: '#1a2035' },
    secondary: { main: '#00c4b4' },
    warning: { main: '#ff9800' },
    danger: { main: '#dc3545' },
    success: { main: '#28a745' },
    background: { default: '#f4f7fa', paper: '#ffffff' },
    text: { primary: '#1a2035', secondary: '#6c757d' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, fontSize: '0.875rem' },
    subtitle2: { fontWeight: 400, fontSize: '0.6875rem' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          backgroundColor: 'inherit',
          color: '#fff',
        },
      },
    },
  },
});

// Configure Axios
axios.defaults.baseURL = 'http://localhost:8080';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Custom Gradient for Charts
const getGradient = (ctx, chartArea, colorStart, colorEnd) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

const Charts = () => {
  const [budgetYears, setBudgetYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('');
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalReportTypes: 0,
    senders: 0,
    nonSenders: 0,
    auditPlanSenders: 0,
    auditPlanNonSenders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch budget years
  useEffect(() => {
    setLoading(true);
    axios
      .get('/transactions/budget-years')
      .then((response) => {
        console.log('Budget Years Response:', response.data);
        const data = Array.isArray(response.data) ? response.data : [];
        setBudgetYears(data);
        if (data.length > 0) {
          setSelectedFiscalYear(data[0].fiscalYear);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Budget Years Error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(`Failed to load budget years: ${error.response?.data?.message || error.message}`);
        setBudgetYears([]);
        setLoading(false);
      });
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    if (selectedFiscalYear) {
      setLoading(true);
      axios
        .get(`/transactions/dashboard-stats?fiscalYear=${selectedFiscalYear}`)
        .then((response) => {
          console.log('Dashboard Stats Response:', response.data);
          setStats(response.data || stats);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Dashboard Stats Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          let errorMessage = 'Failed to load dashboard statistics.';
          if (error.response?.status === 404) {
            errorMessage = `No statistics available for fiscal year ${selectedFiscalYear}.`;
          } else if (error.response?.status === 403) {
            errorMessage = 'You do not have permission to view dashboard statistics.';
          } else {
            errorMessage = error.response?.data?.message || error.message;
          }
          setError(errorMessage);
          setLoading(false);
        });
    }
  }, [selectedFiscalYear]);

  const handleFiscalYearChange = (e) => {
    setSelectedFiscalYear(e.target.value);
    setError(null);
    setStats({
      totalOrganizations: 0,
      totalReportTypes: 0,
      senders: 0,
      nonSenders: 0,
      auditPlanSenders: 0,
      auditPlanNonSenders: 0,
    });
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (error && budgetYears.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="error" icon={<Cancel />}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading dashboard...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              bgcolor: 'primary.main',
              color: 'white',
            },
          }}
        >
          <List>
            <ListItem button>
              <ListItemIcon sx={{ color: 'white' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Dashboard
              </Typography>
            </Toolbar>
          </AppBar>

          <Box className="dashboard-container">
            <Grid container spacing={3}>
              {/* First Row: Fiscal Year and Selected Stat Cards */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {/* Fiscal Year Selection */}
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card className="stat-card hrm-main-card primary">
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <Timeline sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography variant="h5" color="primary">
                            Fiscal Year
                          </Typography>
                        </Box>
                        <FormControl fullWidth variant="outlined">
                          <Select
                            value={selectedFiscalYear}
                            onChange={handleFiscalYearChange}
                            label="Choose a fiscal year"
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="">Choose a fiscal year</MenuItem>
                            {budgetYears.map((year) => (
                              <MenuItem key={year.id} value={year.fiscalYear}>
                                {year.fiscalYear}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Total Organizations */}
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card className="stat-card hrm-main-card primary">
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <Business sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                              Total Organizations
                            </Typography>
                            <Typography variant="h5" color="primary">
                              {stats.totalOrganizations}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Total Report Types */}
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card className="stat-card hrm-main-card secondary">
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                            <Description sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                              Total Report Types
                            </Typography>
                            <Typography variant="h5" color="secondary">
                              {stats.totalReportTypes}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Total Senders */}
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card className="stat-card hrm-main-card success">
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                            <CheckCircle sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                              Total Senders
                            </Typography>
                            <Typography variant="h5" sx={{ color: 'success.main' }}>
                              {stats.senders}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error" icon={<Cancel />} sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </Grid>
              )}

              {selectedFiscalYear && !error && (
                <>
                  {/* Remaining Stat Cards */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      {/* Total Non-Senders */}
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Card className="stat-card hrm-main-card danger">
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: 'danger.main', mr: 2 }}>
                                <Cancel sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                                  Total Non-Senders
                                </Typography>
                                <Typography variant="h5" sx={{ color: 'danger.main' }}>
                                  {stats.nonSenders}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Audit Plan Senders */}
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Card className="stat-card hrm-main-card primary">
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                <CheckCircle sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                                  Audit Plan Senders
                                </Typography>
                                <Typography variant="h5" color="primary">
                                  {stats.auditPlanSenders}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Audit Plan Non-Senders */}
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Card className="stat-card hrm-main-card warning">
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                                <Cancel sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                                  Audit Plan Non-Senders
                                </Typography>
                                <Typography variant="h5" sx={{ color: 'warning.main' }}>
                                  {stats.auditPlanNonSenders}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Charts */}
                  <Grid item xs={12} md={6}>
                    <Card className="animate__animated animate__fadeInUp">
                      <CardContent sx={{ bgcolor: 'white', color: 'black', p: 2, borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PieChart sx={{ mr: 1 }} />
                          <Typography variant="h6">Senders vs Non-Senders</Typography>
                        </Box>
                      </CardContent>
                      <CardContent sx={{ p: 2 }}>
                        <Box className="chart-container">
                          <Bar
                            data={{
                              labels: ['Senders', 'Non-Senders'],
                              datasets: [
                                {
                                  label: 'Number of Organizations',
                                  backgroundColor: (context) => {
                                    const chart = context.chart;
                                    const { ctx, chartArea } = chart;
                                    if (!chartArea) return;
                                    return [
                                      getGradient(ctx, chartArea, '#1a2035', '#00c4b4'),
                                      getGradient(ctx, chartArea, '#dc3545', '#ff8a65'),
                                    ];
                                  },
                                  data: [stats.senders, stats.nonSenders],
                                  borderRadius: 8,
                                },
                              ],
                            }}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                tooltip: {
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  titleFont: { size: 14 },
                                  bodyFont: { size: 12 },
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: { display: true, text: 'Number of Organizations', font: { size: 14 } },
                                  grid: { color: '#e0e0e0' },
                                },
                                x: { grid: { display: false } },
                              },
                              animation: {
                                duration: 1000,
                                easing: 'easeOutQuart',
                              },
                            }}
                            height={300}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card className="animate__animated animate__fadeInUp">
                      <CardContent sx={{ bgcolor: 'white', color: 'black', p: 2, borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PieChart sx={{ mr: 1 }} />
                          <Typography variant="h6">Audit Plan</Typography>
                        </Box>
                      </CardContent>
                      <CardContent sx={{ p: 2 }}>
                        <Box className="chart-container">
                          <Pie
                            data={{
                              labels: ['Senders', 'Non-Senders'],
                              datasets: [
                                {
                                  data: [stats.auditPlanSenders, stats.auditPlanNonSenders],
                                  backgroundColor: ['#1a2035', '#dc3545'],
                                  hoverBackgroundColor: ['#00c4b4', '#ff8a65'],
                                  borderWidth: 2,
                                  borderColor: '#fff',
                                },
                              ],
                            }}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                tooltip: {
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  titleFont: { size: 14 },
                                  bodyFont: { size: 12 },
                                },
                              },
                              animation: {
                                duration: 1000,
                                easing: 'easeOutQuart',
                              },
                            }}
                            height={300}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card className="animate__animated animate__fadeInUp">
                      <CardContent sx={{ bgcolor: 'white', color: 'black', p: 2, borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Timeline sx={{ mr: 1 }} />
                          <Typography variant="h6">Sender Statistics</Typography>
                        </Box>
                      </CardContent>
                      <CardContent sx={{ p: 2 }}>
                        <Box className="chart-container">
                          <Line
                            data={{
                              labels: [selectedFiscalYear],
                              datasets: [
                                {
                                  label: 'Total Senders',
                                  backgroundColor: (context) => {
                                    const chart = context.chart;
                                    const { ctx, chartArea } = chart;
                                    if (!chartArea) return;
                                    return getGradient(ctx, chartArea, 'rgba(26, 32, 53, 0.2)', 'rgba(26, 32, 53, 0.5)');
                                  },
                                  borderColor: '#1a2035',
                                  pointBackgroundColor: '#1a2035',
                                  pointBorderColor: '#fff',
                                  data: [stats.senders],
                                  fill: true,
                                },
                                {
                                  label: 'Audit Plan Senders',
                                  backgroundColor: (context) => {
                                    const chart = context.chart;
                                    const { ctx, chartArea } = chart;
                                    if (!chartArea) return;
                                    return getGradient(ctx, chartArea, 'rgba(0, 196, 180, 0.2)', 'rgba(0, 196, 180, 0.5)');
                                  },
                                  borderColor: '#00c4b4',
                                  pointBackgroundColor: '#00c4b4',
                                  pointBorderColor: '#fff',
                                  data: [stats.auditPlanSenders],
                                  fill: true,
                                },
                              ],
                            }}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                tooltip: {
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  titleFont: { size: 14 },
                                  bodyFont: { size: 12 },
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: { display: true, text: 'Number of Senders', font: { size: 14 } },
                                  grid: { color: '#e0e0e0' },
                                },
                                x: { grid: { display: false } },
                              },
                              animation: {
                                duration: 1000,
                                easing: 'easeOutQuart',
                              },
                            }}
                            height={300}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Error Boundary
class ChartsErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Alert severity="error" icon={<Cancel />}>
              An error occurred while rendering the charts. Please try again later.
            </Alert>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

export default () => (
  <ChartsErrorBoundary>
    <Charts />
  </ChartsErrorBoundary>
);