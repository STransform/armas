import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    CContainer,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CHeader,
    CHeaderNav,
    CHeaderToggler,
    CNavLink,
    CNavItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilContrast,
    cilEnvelopeOpen,
    cilList,
    cilMenu,
    cilMoon,
    cilSun,
} from '@coreui/icons';
// import { AppBreadcrumb } from './index';
import { AppHeaderDropdown } from './header/index';
import NotificationDropdown from './NotificationDropdown';
import './AppHeader.css';

// Fallback theme management
const useFallbackColorMode = () => {
    const [colorMode, setColorMode] = useState(localStorage.getItem('theme') || 'light');

    const setMode = (mode) => {
        setColorMode(mode);
        localStorage.setItem('theme', mode);
        document.documentElement.setAttribute('data-coreui-theme', mode);
        console.log('Theme set to:', mode);
    };

    return { colorMode, setColorMode: setMode };
};

const AppHeader = () => {
    const headerRef = useRef();
    let useColorModes;
    try {
        useColorModes = require('@coreui/react').useColorModes;
    } catch {
        console.warn('useColorModes not found, using fallback theme management');
    }
    const { colorMode, setColorMode } = useColorModes
        ? useColorModes('coreui-free-react-admin-template-theme')
        : useFallbackColorMode();
    const dispatch = useDispatch();
    const sidebarShow = useSelector((state) => state.sidebarShow);

    useEffect(() => {
        document.addEventListener('scroll', () => {
            headerRef.current &&
                headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0);
        });

        return () => {
            document.removeEventListener('scroll', () => {});
        };
    }, []);

    return (
        <CHeader position="sticky" className="p-0" ref={headerRef}>
            <CContainer className="border-bottom px-4" fluid>
                <CHeaderToggler
                    onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
                    style={{ marginInlineStart: '-14px' }}
                >
                    <CIcon icon={cilMenu} size="lg" />
                </CHeaderToggler>
                <CHeaderNav className="d-none d-md-flex">
                    <CNavItem>
                        <CNavLink to="/dashboard" as={NavLink}>
                            Dashboard
                        </CNavLink>
                    </CNavItem>
                </CHeaderNav>
                <CHeaderNav className="ms-auto">
                    <CNavItem>
                        <NotificationDropdown />
                    </CNavItem>
                </CHeaderNav>
                <CHeaderNav>
                    <li className="nav-item py-1">
                        <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
                    </li>
                    <CDropdown variant="nav-item" placement="bottom-end">
                        <CDropdownToggle caret={false}>
                            {colorMode === 'dark' ? (
                                <CIcon icon={cilMoon} size="lg" />
                            ) : colorMode === 'auto' ? (
                                <CIcon icon={cilContrast} size="lg" />
                            ) : (
                                <CIcon icon={cilSun} size="lg" />
                            )}
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem
                                active={colorMode === 'light'}
                                className="d-flex align-items-center"
                                as="button"
                                type="button"
                                onClick={() => setColorMode('light')}
                            >
                                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
                            </CDropdownItem>
                            <CDropdownItem
                                active={colorMode === 'dark'}
                                className="d-flex align-items-center"
                                as="button"
                                type="button"
                                onClick={() => setColorMode('dark')}
                            >
                                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
                            </CDropdownItem>
                            <CDropdownItem
                                active={colorMode === 'auto'}
                                className="d-flex align-items-center"
                                as="button"
                                type="button"
                                onClick={() => setColorMode('auto')}
                            >
                                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
                            </CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                    <li className="nav-item py-1">
                        <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
                    </li>
                    <AppHeaderDropdown />
                </CHeaderNav>
            </CContainer>
            {/* for app breadcrum */}
            {/* <CContainer className="px-4" fluid>
                <AppBreadcrumb />
            </CContainer> */}
        </CHeader>
    );
};

export default AppHeader;