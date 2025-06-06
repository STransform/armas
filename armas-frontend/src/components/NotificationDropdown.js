import React, { useState, useEffect, useCallback } from 'react';
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBell } from '@coreui/icons';
import { getUnreadNotifications, markNotificationAsRead } from '../file/upload_download';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../views/pages/AuthProvider'; // Import useAuth
import './AppHeader.css'; // Import CSS for notification badge

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { roles = [] } = useAuth(); // Get roles from AuthProvider

    // Role checking functions
    const hasRole = (role) => Array.isArray(roles) && roles.includes(role);
    const isArchiver = hasRole('ARCHIVER');
    const isSeniorAuditor = hasRole('SENIOR_AUDITOR');
    const isApprover = hasRole('APPROVER');

    const fetchNotifications = useCallback(async () => {
        try {
            console.log('Fetching notifications at:', new Date().toLocaleTimeString());
            const data = await getUnreadNotifications();
            console.log('Raw notifications response:', JSON.stringify(data, null, 2));
            const notificationArray = Array.isArray(data) ? data.filter(n => !n.isRead) : [];
            console.log('Filtered unread notifications:', notificationArray);
            setNotifications(notificationArray);
            setUnreadCount(notificationArray.length);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch notifications:', err.message, err.response?.data);
            setError('Failed to load notifications');
            setNotifications([]);
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(); // Initial fetch
        const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleNotificationClick = async (notification) => {
        try {
            console.log('Marking notification as read: ID=', notification.id);
            await markNotificationAsRead(notification.id);
            console.log('Processing notification:', JSON.stringify(notification, null, 2));

            // Validate notification
            if (!notification.entityType || !notification.entityId || !notification.context) {
                console.warn('Missing entityType, entityId, or context:', notification);
                navigate('/dashboard'); // Fallback
                return;
            }

            // Redirect based on role and context
            if (notification.entityType === 'MasterTransaction') {
                if (isArchiver) {
                    if (notification.context === 'report_uploaded') {
                        const fileDownloadRoute = '/buttons/file-download';
                        console.log('Redirecting ARCHIVER to file download:', fileDownloadRoute);
                        navigate(fileDownloadRoute);
                    } else if (notification.context === 'task_approved') {
                        const approvedReportsRoute = '/transactions/approved-reports';
                        console.log('Redirecting ARCHIVER to approved reports:', approvedReportsRoute);
                        navigate(approvedReportsRoute);
                    } else {
                        console.warn('Unknown context for ARCHIVER:', notification.context);
                        navigate('/dashboard');
                    }
                } else if (isSeniorAuditor && notification.context === 'task_assigned') {
                    const auditorTasksRoute = '/transactions/auditor-tasks';
                    console.log('Redirecting SENIOR_AUDITOR to auditor tasks:', auditorTasksRoute);
                    navigate(auditorTasksRoute);
                } else if (isApprover && notification.context === 'task_evaluated') {
                    const auditorTasksRoute = '/transactions/auditor-tasks';
                    console.log('Redirecting APPROVER to auditor tasks:', auditorTasksRoute);
                    navigate(auditorTasksRoute);
                } else {
                    console.warn('No matching role or context:', { roles, context: notification.context });
                    navigate('/dashboard');
                }
            } else {
                console.warn('Unknown entityType:', notification.entityType);
                navigate('/dashboard');
            }

            fetchNotifications(); // Refresh notifications
        } catch (err) {
            console.error('Failed to mark notification as read:', err.message);
            navigate('/dashboard'); // Fallback on error
        }
    };

    return (
        <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} style={{ position: 'relative', padding: 0 }}>
                <CIcon icon={cilBell} size="lg" />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </CDropdownToggle>
            <CDropdownMenu style={{ maxHeight: '300px', overflowY: 'auto', width: '300px' }}>
                {error && <CDropdownItem disabled>{error}</CDropdownItem>}
                {notifications.length === 0 && !error ? (
                    <CDropdownItem disabled>No new notifications</CDropdownItem>
                ) : (
                    notifications.map((notification) => (
                        <CDropdownItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            style={{ cursor: 'pointer', whiteSpace: 'normal', padding: '10px' }}
                        >
                            <div>
                                <strong>{notification.title || 'Untitled'}</strong>
                                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                    {notification.message || 'No message'}
                                </p>
                                <small style={{ color: '#888' }}>
                                    {notification.createdAt
                                        ? new Date(notification.createdAt).toLocaleString()
                                        : 'Unknown time'}
                                </small>
                            </div>
                        </CDropdownItem>
                    ))
                )}
            </CDropdownMenu>
        </CDropdown>
    );
};

export default NotificationDropdown;