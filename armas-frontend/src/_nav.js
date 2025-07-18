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
  cilUser,
  cilLockLocked,
  cilFile,
  cilGroup,
  cilBuilding,
  cilTransfer,
  cilFilter, // Add this import
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
  const isManager = hasRole('MANAGER');

  const commonItems = [
    {
      component: CNavTitle,
      name: 'Home',
    },
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/charts',
      icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    },
    // {
    //   component: CNavTitle,
    //   name: 'Extras',
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
    {
      component: CNavItem,
      name: 'File History',
      to: '/file-history',
      icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Download File',
      to: '/buttons/letter-download',
      icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
    },
  ];
const managerItems = [
    { component: CNavTitle, name: 'Manager Actions' },
    { component: CNavItem, name: 'View Letters', to: '/transactions/letters', icon: <CIcon icon={cilFile} customClassName="nav-icon" /> },
  ];

  const adminItems = [
    {
      component: CNavGroup,
      name: 'Manage',
      to: '/buttons',
      icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Organizations',
          to: '/buttons/organizations',
          icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Directorates',
          to: '/buttons/directorates',
          icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Report type',
          to: '/buttons/documents',
          icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Budget Year',
          to: '/buttons/budgetyear',
          icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Users',
          to: '/buttons/users',
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Role',
          to: '/buttons/roles',
          icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'AssignRole',
          to: '/buttons/assign',
          icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Assign Privileges to Role',
          to: '/buttons/assign-privileges',
          icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'File Upload',
          to: '/buttons/file-upload',
          icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Download File',
          to: '/buttons/letter-download',
          icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
        },
        
      ],
    },
  ];

  const transactionItems = [
    {
      component: CNavGroup,
      name: 'Transactions',
      icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
      items: [
        ...(isArchiver
          ? [
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
            ]
          : []),
        ...((isSeniorAuditor || isApprover)
          ? [
              {
                component: CNavItem,
                name: 'Assigned tasks',
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
              {
                component: CNavItem,
                name: 'Under Review',
                to: '/transactions/under-review-reports',
                icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Corrected Reports',
                to: '/transactions/corrected-reports',
                icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Advanced Filters',
                to: '/transactions/advanced-filters',
                icon: <CIcon icon={cilFilter} customClassName="nav-icon" />,
              },
            ]
          : []),
      ],
    },
  ];

  const navItems = [
    ...commonItems,
    ...(isUser ? userItems : []),
    ...(isManager ? managerItems : []),
    ...(isAdmin ? adminItems : []),
    ...((isArchiver || isSeniorAuditor || isApprover) ? transactionItems : []),
  ];

  return navItems;
};

export default Nav;