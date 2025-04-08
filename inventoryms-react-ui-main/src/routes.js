import { element } from 'prop-types'
import React from 'react'
import Brand from './components/Brand'
import Organization from './components/Organization'
import Directorate from './components/Directorate';
import Document from './components/Document';
import MasterTransaction from './components/MasterTransaction';
const User = React.lazy(() => import('./components/Users'));
import RegistrationSuccessful from './views/pages/register/RegistrationSuccessful'
import VerificationSuccessful from './views/pages/register/VerificationSuccessful'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))


//Forms

const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))

const Select = React.lazy(() => import('./views/forms/select/Select'))
// const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))


const routes = [
  { path: '/registrationSuccessful', name: 'Registration Successful', element: RegistrationSuccessful},
  { path: '/verificationSuccessful', name: 'Verification Successful', element: VerificationSuccessful},
  { path: '/', exact: true, name: 'Home' },
  { path: '/brands', name: 'Brand', element: Brand},
  { path: '/buttons/organizations', name: 'Organizations', element: Organization },
  { path: '/buttons/directorates', name: 'Directorates', element: Directorate },
  { path: '/buttons/documents', name: 'Documents', element: Document },
  { path: '/buttons/master-transaction', name: 'Master Transaction', element: MasterTransaction },
  { path: '/buttons/users', name: 'Users', element: User },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },

  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },

  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
]

export default routes
