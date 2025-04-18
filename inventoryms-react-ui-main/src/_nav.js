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
} from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';
import { useAuth } from './views/pages/AuthProvider';

const Nav = () => {
  const { roles = [] } = useAuth(); // Default to empty array if roles is undefined

  // Safe role checking functions
  const hasRole = (role) => Array.isArray(roles) && roles.includes(role);
  const isAdmin = hasRole('ADMIN');
  const isUser = hasRole('USER');

  const commonItems = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      badge: {
        color: 'info',
        text: 'NEW',
      },
    },
    {
      component: CNavTitle,
      name: 'Components',
    },
    {
      component: CNavGroup,
      name: 'Base',
      to: '/base',
      icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Accordion',
          to: '/base/accordion',
        },
        {
          component: CNavItem,
          name: 'Breadcrumb',
          to: '/base/breadcrumbs',
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Forms',
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Form Control',
          to: '/forms/form-control',
        },
        {
          component: CNavItem,
          name: 'Select',
          to: '/forms/select',
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Notifications',
      icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Alerts',
          to: '/notifications/alerts',
        },
        {
          component: CNavItem,
          name: 'Badges',
          to: '/notifications/badges',
        },
      ],
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
        { component: CNavItem, name: 'Login', to: '/login' },
        { component: CNavItem, name: 'Register', to: '/register' },
        { component: CNavItem, name: 'Error 404', to: '/404' },
        { component: CNavItem, name: 'Error 500', to: '/500' },
      ],
    },
    {
      component: CNavItem,
      name: 'Docs',
      href: 'https://coreui.io/react/docs/templates/installation/',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
  ];

  const userItems = [
    {
      component: CNavTitle,
      name: 'Theme',
    },
    {
      component: CNavItem,
      name: 'Colors',
      to: '/theme/colors',
      icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Typography',
      to: '/theme/typography',
      icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Charts',
      to: '/charts',
      icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
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
      ],
    },
  ];

  const navItems = [
    ...commonItems,
    ...(isUser ? userItems : []),
    ...(isAdmin ? adminItems : []),
  ];

  return navItems;
};

export default Nav;
