import React from 'react';
import CIcon from '@coreui/icons-react';
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilCloudUpload,
  cilCloudDownload,
  cilTask,
} from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';
import { useAuth } from './views/pages/AuthProvider';

const Nav = () => {
  const { roles = [] } = useAuth(); // Default to empty array if roles is undefined

  // Safe role checking functions
  const hasRole = (role) => Array.isArray(roles) && roles.includes(role);
  const isAdmin = hasRole('ADMIN');
  const isUser = hasRole('USER');
  const isSeniorAuditor = hasRole('SENIOR_AUDITOR');
  const isArchiver = hasRole('ARCHIVER');
  const isApprover = hasRole('APPROVER');

  const commonItems = [
    {
      component: CNavTitle,
      name: 'Components',
    },
    {
      component: CNavItem,
      name: 'Charts',
      to: '/charts',
      icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    },
    {
      component: CNavTitle,
      name: 'Extras',
    },
    {
      component: CNavGroup,
      name: 'User',
      icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Logout', to: '/login' },
        // { component: CNavItem, name: 'Register', to: '/register' },
        { component: CNavItem, name: 'Error 404', to: '/404' },
        { component: CNavItem, name: 'Error 500', to: '/500' },
      ],
    },
    // {
    //   component: CNavItem,
    //   name: 'Docs',
    //   href: 'https://coreui.io/react/docs/templates/installation/',
    //   icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    // },
  ];

  const userItems = [
    {
      component: CNavTitle,
      name: 'Theme',
    },
    {
      component: CNavItem,
      name: 'File Upload',
      to: '/buttons/file-upload',
      icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
    },
  ];

  const adminItems = [
    {
      component: CNavGroup,
      name: 'Register',
      to: '/buttons',
      icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Organizations',
          to: '/buttons/organizations',
        },
        {
          component: CNavItem,
          name: 'Directorates',
          to: '/buttons/directorates',
        },
        {
          component: CNavItem,
          name: 'Documents',
          to: '/buttons/documents',
          icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Master Transaction',
          to: '/buttons/master-transaction',
          icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Users',
          to: '/buttons/users',
        },
        {
          component: CNavItem,
          name: 'Role',
          to: '/buttons/roles',
        },
        {
          component: CNavItem,
          name: 'AssignRole',
          to: '/buttons/assign',
        },
        {
          component: CNavItem,
          name: 'File Upload',
          to: '/buttons/file-upload',
          icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'File Download',
          to: '/buttons/file-download',
          icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
        },
      ],
    },
  ];

  // Commented out to remove duplicate Transactions menu for ARCHIVER
  /*
  const archiverItems = [
    {
      component: CNavGroup,
      name: 'Transactions',
      to: '/buttons',
      icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'File Download',
          to: '/buttons/file-download',
          icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Approved Reports',
          to: '/transactions/approved-reports',
          icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
        },
      ],
    },
  ];
  */

  const transactionItems = [
    {
      component: CNavGroup,
      name: 'Transactions',
      icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
      items: [
        ...(isArchiver
          ? [
              {
                component: CNavItem,
                name: 'File Download',
                to: '/buttons/file-download', // Updated to match archiverItems path
                icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Approved Reports',
                to: '/transactions/approved-reports',
                icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
              },
            ]
          : []),
        ...((isSeniorAuditor || isApprover)
          ? [
              {
                component: CNavItem,
                name: 'Auditor Tasks',
                to: '/transactions/auditor-tasks',
                icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Rejected Reports',
                to: '/transactions/rejected-reports',
                icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Approved Reports',
                to: '/transactions/approved-reports',
                icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
              },
            ]
          : []),
      ],
    },
  ];

  const navItems = [
    ...commonItems,
    ...(isUser ? userItems : []),
    ...(isAdmin ? adminItems : []),
    // ...(isArchiver ? archiverItems : []), // Commented out to avoid duplication
    ...((isArchiver || isSeniorAuditor || isApprover) ? transactionItems : []),
  ];

  return navItems;
};

export default Nav;