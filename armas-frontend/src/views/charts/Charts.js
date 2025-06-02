import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCol,
  CCardHeader,
  CRow,
  CFormSelect,
  CSpinner,
  CAlert,
} from '@coreui/react';
import { CChartBar, CChartLine, CChartPie } from '@coreui/react-chartjs';
import axios from 'axios';
import { CIcon } from '@coreui/icons-react';
import { cilBuilding, cilClipboard, cilCheckCircle, cilXCircle, cilChartPie, cilLineStyle } from '@coreui/icons';
import './chart.css'; // Updated to match correct file name
import 'animate.css';

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

  if (error && budgetYears.length === 0) {
    return (
      <CCard className="mb-5 shadow-sm border-0">
        <CCardBody>
          <CAlert color="danger" className="d-flex align-items-center">
            <CIcon icon={cilXCircle} size="lg" className="me-2 animate__animated animate__pulse" />
            <span>{error}</span>
          </CAlert>
        </CCardBody>
      </CCard>
    );
  }

  if (loading) {
    return (
      <CCard className="mb-5 shadow-sm border-0">
        <CCardBody className="text-center">
          <CSpinner color="primary" size="lg" />
          <p className="mt-2 text-muted">Loading dashboard...</p>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <div className="dashboard-container">
      <CRow>
        {/* Fiscal Year Selection */}
        <CCol xs={4}>
          <CCard className="mb-4 shadow-sm border-0 animate__animated animate__fadeIn">
            <CCardHeader className="bg-gradient-primary text-white">
              <h5 className="mb-0">Select Fiscal Year</h5>
            </CCardHeader>
            <CCardBody>
              <CFormSelect
                value={selectedFiscalYear}
                onChange={handleFiscalYearChange}
                className="custom-select"
              >
                <option value="">Choose a fiscal year</option>
                {budgetYears.map((year) => (
                  <option key={year.id} value={year.fiscalYear}>
                    {year.fiscalYear}
                  </option>
                ))}
              </CFormSelect>
            </CCardBody>
          </CCard>
        </CCol>

        {error && (
          <CCol xs={12}>
            <CAlert color="warning" className="d-flex align-items-center mb-4">
              <CIcon icon={cilXCircle} size="lg" className="me-2 animate__animated animate__pulse" />
              <span>{error}</span>
            </CAlert>
          </CCol>
        )}

        {selectedFiscalYear && !error && (
          <>
            {/* Stat Cards */}
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="mb-4 stat-card shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-info text-white">
                  <CIcon icon={cilBuilding} size="lg" className="me-2" />
                  Total Organizations
                </CCardHeader>
                <CCardBody>
                  <h3 className="text-primary">{stats.totalOrganizations}</h3>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="mb-4 stat-card shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-success text-white">
                  <CIcon icon={cilClipboard} size="lg" className="me-2" />
                  Total Report Types
                </CCardHeader>
                <CCardBody>
                  <h3 className="text-success">{stats.totalReportTypes}</h3>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="mb-4 stat-card shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-warning text-white">
                  <CIcon icon={cilCheckCircle} size="lg" className="me-2" />
                  Total Senders
                </CCardHeader>
                <CCardBody>
                  <h3 className="text-warning">{stats.senders}</h3>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="mb-4 stat-card shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-danger text-white">
                  <CIcon icon={cilXCircle} size="lg" className="me-2" />
                  Total Non-Senders
                </CCardHeader>
                <CCardBody>
                  <h3 className="text-danger">{stats.nonSenders}</h3>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="mb-4 stat-card shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-primary text-white">
                  <CIcon icon={cilCheckCircle} size="lg" className="me-2" />
                  Audit Plan Senders
                </CCardHeader>
                <CCardBody>
                  <h3 className="text-primary">{stats.auditPlanSenders}</h3>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} sm={6} lg={4}>
              <CCard className="mb-4 stat-card shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-secondary text-white">
                  <CIcon icon={cilXCircle} size="lg" className="me-2" />
                  Audit Plan Non-Senders
                </CCardHeader>
                <CCardBody>
                  <h3 className="text-secondary">{stats.auditPlanNonSenders}</h3>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Charts */}
            <CCol xs={12} lg={6}>
              <CCard className="mb-4 shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-info text-white">
                  <CIcon icon={cilChartPie} size="lg" className="me-2" />
                  Senders vs Non-Senders
                </CCardHeader>
                <CCardBody>
                  <CChartBar
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
                              getGradient(ctx, chartArea, '#36A2EB', '#4BC0C0'),
                              getGradient(ctx, chartArea, '#FF6384', '#FF9F40'),
                            ];
                          },
                          data: [stats.senders, stats.nonSenders],
                          borderRadius: 8,
                        },
                      ],
                    }}
                    options={{
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
                          grid: { color: '#e9ecef' },
                        },
                        x: {
                          grid: { display: false },
                        },
                      },
                      animation: {
                        duration: 1000,
                        easing: 'easeOutQuart',
                      },
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={6} lg={6}>
              <CCard className="mb-4 shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-success text-white">
                  <CIcon icon={cilChartPie} size="lg" className="me-2" />
                  Audit Plan
                </CCardHeader>
                <CCardBody>
                  <CChartPie
                    data={{
                      labels: ['Senders', 'Non-Senders'],
                      datasets: [
                        {
                          data: [stats.auditPlanSenders, stats.auditPlanNonSenders],
                          backgroundColor: ['#36A2EB', '#FF6384'],
                          hoverBackgroundColor: ['#4BC0C0', '#FF9F40'],
                          borderWidth: 2,
                          borderColor: '#fff',
                        },
                      ],
                    }}
                    options={{
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
                  />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={6} lg={6}>
              <CCard className="mb-4 shadow-sm border-0 animate__animated animate__fadeInUp">
                <CCardHeader className="bg-gradient-primary text-white">
                  <CIcon icon={cilLineStyle} size="lg" className="me-2" />
                  Sender Statistics
                </CCardHeader>
                <CCardBody>
                  <CChartLine
                    data={{
                      labels: [selectedFiscalYear],
                      datasets: [
                        {
                          label: 'Total Senders',
                          backgroundColor: (context) => {
                            const chart = context.chart;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return;
                            return getGradient(ctx, chartArea, 'rgba(151, 187, 205, 0.2)', 'rgba(151, 187, 205, 0.5)');
                          },
                          borderColor: '#36A2EB',
                          pointBackgroundColor: '#36A2EB',
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
                            return getGradient(ctx, chartArea, 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 0.5)');
                          },
                          borderColor: '#FF6384',
                          pointBackgroundColor: '#FF6384',
                          pointBorderColor: '#fff',
                          data: [stats.auditPlanSenders],
                          fill: true,
                        },
                      ],
                    }}
                    options={{
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
                          grid: { color: '#e9ecef' },
                        },
                        x: {
                          grid: { display: false },
                        },
                      },
                      animation: {
                        duration: 1000,
                        easing: 'easeOutQuart',
                      },
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </>
        )}
      </CRow>
    </div>
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
        <CCard className="mb-5 shadow-sm border-0">
          <CCardBody>
            <CAlert color="danger" className="d-flex align-items-center">
              <CIcon icon={cilXCircle} size="lg" className="me-2 animate__animated animate__pulse" />
              An error occurred while rendering the charts. Please try again later.
            </CAlert>
          </CCardBody>
        </CCard>
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