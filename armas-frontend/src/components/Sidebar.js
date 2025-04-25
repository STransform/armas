import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import _nav from './_nav';
import { CSidebar, CSidebarNav, CNavItem, CNavGroup } from '@coreui/react';

const Sidebar = () => {
    const { user } = useAuth();
    const navItems = _nav(user?.role || 'GUEST');

    return (
        <CSidebar>
            <CSidebarNav>
                {navItems.map((item, index) => (
                    item.component === CNavItem ? (
                        <CNavItem key={index} as={NavLink} to={item.to}>
                            {item.icon} {item.name}
                        </CNavItem>
                    ) : item.component === CNavGroup ? (
                        <CNavGroup key={index} toggler={item.name}>
                            {item.items.map((subItem, subIndex) => (
                                <CNavItem key={subIndex} as={NavLink} to={subItem.to}>
                                    {subItem.name}
                                </CNavItem>
                            ))}
                        </CNavGroup>
                    ) : item.component === CNavTitle ? (
                        <CNavTitle key={index}>{item.name}</CNavTitle>
                    ) : null
                ))}
            </CSidebarNav>
        </CSidebar>
    );
};

export default Sidebar;