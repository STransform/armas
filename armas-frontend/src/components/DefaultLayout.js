import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CContainer, CSidebar, CSidebarNav, CSidebarToggler, CSpinner } from '@coreui/react';
import Nav from '../Nav';
import routes from '../routes';
import { useAuth } from './views/pages/AuthProvider';

const DefaultLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <CSidebar>
          <CSidebarNav>
            {Nav().map((item, index) => {
              const Component = item.component;
              if (Component === 'CNavTitle') {
                return <CNavTitle key={index}>{item.name}</CNavTitle>;
              } else if (Component === 'CNavItem') {
                return (
                  <CNavItem key={index} href={item.to || item.href}>
                    {item.icon} {item.name}
                  </CNavItem>
                );
              } else if (Component === 'CNavGroup') {
                return (
                  <CNavGroup key={index} toggler={item.name}>
                    {item.items.map((subItem, subIndex) => (
                      <CNavItem key={subIndex} href={subItem.to}>
                        {subItem.name}
                      </CNavItem>
                    ))}
                  </CNavGroup>
                );
              }
              return null;
            })}
          </CSidebarNav>
          <CSidebarToggler />
        </CSidebar>
      )}
      <CContainer>
        <Suspense fallback={<CSpinner color="primary" />}>
          <Routes>
            {routes
              .filter((route) => route.path !== '/login' && route.path !== '/register')
              .map((route, idx) => (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={route.element}
                  />
                )
              ))}
          </Routes>
        </Suspense>
      </CContainer>
    </div>
  );
};

export default DefaultLayout;