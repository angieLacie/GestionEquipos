import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import MainLayout from '@/layouts/MainLayout.tsx'
import AuthLayout from '@/layouts/AuthLayout.tsx'
import ProtectedRoute from '@/components/ProtectedRoute.tsx'
import RequireRoles from '@/components/RequireRoles.tsx'
import { rolesFor } from '@/lib/acl'

// Dashboards
const DashboardControl = lazy(() => import('@/views/dashboards/control-center'))
const DashboardMarketing = lazy(() => import('@/views/dashboards/marketing'))
const DashboardProjectManagement = lazy(() => import('@/views/dashboards/project-management'))
const DashboardSubscription = lazy(() => import('@/views/dashboards/subscription'))

// user profile
const UserProfile = lazy(() => import('@/views/user-profile'))

// Nova - Gestión
const RolPersonal = lazy(() => import('@/views/rol'))
const Marcaciones = lazy(() => import('@/views/marcaciones'))
const Ascensos = lazy(() => import('@/views/ascensos'))
const Encargaturas = lazy(() => import('@/views/encargaturas'))
const Vacaciones = lazy(() => import('@/views/vacaciones'))
const Descansos = lazy(() => import('@/views/descansos'))
const Reportes = lazy(() => import('@/views/reportes'))
const MapeoPuestos = lazy(() => import('@/views/config/mapeo-puestos'))
const ParametrosPuestos = lazy(() => import('@/views/config/parametros-puestos'))
const Feriados = lazy(() => import('@/views/config/feriados'))
const Tiendas = lazy(() => import('@/views/config/tiendas'))
const Campania = lazy(() => import('@/views/config/campania'))
const Parametros = lazy(() => import('@/views/config/parametros'))
const Historial = lazy(() => import('@/views/config/historial'))
const FlujosAprobacion = lazy(() => import('@/views/config/flujos-aprobacion'))

//auth pages
const Login = lazy(() => import('@/views/auth/login'))
const Register = lazy(() => import('@/views/auth/register'))
const ForgotPassword = lazy(() => import('@/views/auth/forgot-password'))
const LockScreen = lazy(() => import('@/views/auth/lockscreen'))
const TwoFactor = lazy(() => import('@/views/auth/two-factor'))

// landing Page
const LandingPage = lazy(() => import('@/views/landing'))

// icons
const SystemIcons = lazy(() => import('@/views/icons/system'))
const FontAwesomeIcons = lazy(() => import('@/views/icons/font-awesome'))
const SmartAdminIcons = lazy(() => import('@/views/icons/smart-admin'))

// tables pages
const BasicTables = lazy(() => import('@/views/tables/basic'))
const TableStyleGenerator = lazy(() => import('@/views/tables/style-generator'))

// TanStack Tables
const TableWithSearch = lazy(() => import('@/views/tanstack-tables/search'))
const TableWithFilters = lazy(() => import('@/views/tanstack-tables/filters'))
const TableSorting = lazy(() => import('@/views/tanstack-tables/sorting'))
const TableWithCheckboxSelect = lazy(() => import('@/views/tanstack-tables/checkbox-select'))
const TableWithDeleteButton = lazy(() => import('@/views/tanstack-tables/delete-buttons'))

//other pages
const Page404 = lazy(() => import('@/views/other-pages/404'))
const BlankPage = lazy(() => import('@/views/other-pages/blank-page'))

const Page404Alt = lazy(() => import('@/views/error/404-2'))
const Page500 = lazy(() => import('@/views/error/500'))

const authPages: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/forgot-password', element: <ForgotPassword /> },
      { path: '/auth/two-factor', element: <TwoFactor /> },
      { path: '/auth/lockscreen', element: <LockScreen /> },
    ],
  },
]

const appPages: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboards/control-center" replace /> },
      { path: '/dashboards/control-center', element: <DashboardControl /> },
      { path: '/dashboards/marketing', element: <DashboardMarketing /> },
      { path: '/dashboards/project-management', element: <DashboardProjectManagement /> },
      { path: '/dashboards/subscription', element: <DashboardSubscription /> },
      { path: '/rol', element: <RequireRoles roles={rolesFor('/rol')}><RolPersonal /></RequireRoles> },
      { path: '/marcaciones', element: <RequireRoles roles={rolesFor('/marcaciones')}><Marcaciones /></RequireRoles> },
      { path: '/ascensos', element: <RequireRoles roles={rolesFor('/ascensos')}><Ascensos /></RequireRoles> },
      { path: '/encargaturas', element: <RequireRoles roles={rolesFor('/encargaturas')}><Encargaturas /></RequireRoles> },
      { path: '/vacaciones', element: <RequireRoles roles={rolesFor('/vacaciones')}><Vacaciones /></RequireRoles> },
      { path: '/descansos', element: <RequireRoles roles={rolesFor('/descansos')}><Descansos /></RequireRoles> },
      { path: '/reportes', element: <RequireRoles roles={rolesFor('/reportes')}><Reportes /></RequireRoles> },
      {
        path: '/config/mapeo-puestos',
        element: (
          <RequireRoles roles={rolesFor('/config/mapeo-puestos')}>
            <MapeoPuestos />
          </RequireRoles>
        ),
      },
      {
        path: '/config/parametros-puestos',
        element: (
          <RequireRoles roles={rolesFor('/config/parametros-puestos')}>
            <ParametrosPuestos />
          </RequireRoles>
        ),
      },
      {
        path: '/config/feriados',
        element: (
          <RequireRoles roles={rolesFor('/config/feriados')}>
            <Feriados />
          </RequireRoles>
        ),
      },
      {
        path: '/config/tiendas',
        element: (
          <RequireRoles roles={rolesFor('/config/tiendas')}>
            <Tiendas />
          </RequireRoles>
        ),
      },
      {
        path: '/config/campania',
        element: (
          <RequireRoles roles={rolesFor('/config/campania')}>
            <Campania />
          </RequireRoles>
        ),
      },
      {
        path: '/config/parametros',
        element: (
          <RequireRoles roles={rolesFor('/config/parametros')}>
            <Parametros />
          </RequireRoles>
        ),
      },
      {
        path: '/config/historial',
        element: (
          <RequireRoles roles={rolesFor('/config/historial')}>
            <Historial />
          </RequireRoles>
        ),
      },
      {
        path: '/config/flujos-aprobacion',
        element: (
          <RequireRoles roles={rolesFor('/config/flujos-aprobacion')}>
            <FlujosAprobacion />
          </RequireRoles>
        ),
      },
      { path: '/user-profile', element: <UserProfile /> },
      { path: '/404', element: <Page404 /> },
      { path: '/blank-page', element: <BlankPage /> },

      { path: '/tables/basic', element: <BasicTables /> },
      { path: '/tables/style-generator', element: <TableStyleGenerator /> },
      { path: '/tanstack-tables/search', element: <TableWithSearch /> },
      { path: '/tanstack-tables/filters', element: <TableWithFilters /> },
      { path: '/tanstack-tables/sorting', element: <TableSorting /> },
      { path: '/tanstack-tables/checkbox-select', element: <TableWithCheckboxSelect /> },
      { path: '/tanstack-tables/delete-buttons', element: <TableWithDeleteButton /> },
      { path: '/icons/system', element: <SystemIcons /> },
      { path: '/icons/font-awesome', element: <FontAwesomeIcons /> },
      { path: '/icons/smart-admin', element: <SmartAdminIcons /> },
    ],
  },
]

const otherPages: RouteObject[] = [
  { path: '/error/404-2', element: <Page404Alt /> },
  { path: '/error/500', element: <Page500 /> },
  { path: '/landing', element: <LandingPage /> },
]

export const routes: RouteObject[] = [...appPages, ...authPages, ...otherPages]
