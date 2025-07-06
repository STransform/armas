import React, { useState } from 'react';
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import avatar8 from './../../assets/images/avatars/8.jpg';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../views/pages/AuthProvider';
import PasswordChangeDialog from '../PasswordChangeDialog'; // Import the new component
import './AppHeaderDropdown.css';

const AppHeaderDropdown = () => {
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  const logoutUser = () => {
    logOut();
    navigate('/login');
  };

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
  };

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar src={avatar8} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0 custom-dropdown-menu" placement="bottom-end">
          <CDropdownHeader className="fw-semibold my-2 custom-dropdown-header">
            Settings
          </CDropdownHeader>
          <CDropdownItem href="#" className="custom-dropdown-item">
            <CIcon icon={cilUser} className="me-2 custom-icon" />
            User Profile
          </CDropdownItem>
          <CDropdownItem onClick={handleOpenPasswordDialog} className="custom-dropdown-item">
            <CIcon icon={cilSettings} className="me-2 custom-icon" />
            Change Password
          </CDropdownItem>
          <CDropdownDivider className="custom-dropdown-divider" />
          <CDropdownItem
            onClick={logoutUser}
            as={NavLink}
            className="custom-dropdown-item custom-logout-item"
          >
            <CIcon icon={cilLockLocked} className="me-2 custom-icon" />
            LogOut
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
      <PasswordChangeDialog open={openPasswordDialog} onClose={handleClosePasswordDialog} />
    </>
  );
};

export default AppHeaderDropdown;