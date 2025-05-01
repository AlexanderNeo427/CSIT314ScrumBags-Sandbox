import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import AdminDashboard from "./routes/UserAdmin/AdminDashboardRoute"
import PlatformManagerDashboard from "./routes/PlatformManager/PlatformManagerDashboard"
import HomeRoute from "./routes/HomeRoute"
import Login from "./routes/Login"
import CreateAccountPage from "./routes/UserAdmin/CreateUserAccount"
import CreateProfilePage from "./routes/UserAdmin/CreateUserProfile"
import CleanerDashboardRoute from "./routes/Cleaner/CleanerDashboard"
import CleanerViewServicesRoute from "./routes/Cleaner/CleanerViewServices"
import LogoutPage from "./routes/Logout"
import ProtectedRoute from "./routes/ProtectedRoutes" // Auth guard
import ViewUserProfile from "./routes/UserAdmin/ViewUserProfile"
import ViewCleanerService from "./routes/HomeOwner/ViewCleanerService"
import ViewShortlist from "./routes/HomeOwner/ViewShortlist"
import ViewServiceCategories from "./routes/PlatformManager/ViewServiceCategories"
import HomeOwnerViewHistory from "./routes/HomeOwner/HomeOwnerViewHistory"
import PlatformManagerViewReports from "./routes/PlatformManager/platformManagerViewReport"
import HomeownerDashBoard from "./routes/HomeOwner/HomeownerDashBoard"
import UserAdminUserAccountManagement from "./routes/UserAdmin/UserAdminUserAccountManagement"
import CleanerViewMyBookings from "./routes/Cleaner/CleanerViewMyBookings"
const browserRouter = createBrowserRouter([
  // Public Routes
  { path: "/", element: <HomeRoute /> },
  { path: "/login", element: <Login /> },
  { path: "/create", element: <CreateAccountPage /> },
  { path: "/create-profile", element: <CreateProfilePage /> },
  { path: "/logout", element: <LogoutPage /> },
  { path: "/ViewUserProfile", element: <ViewUserProfile/>},
  { path: "/ViewCleanerService", element: <ViewCleanerService/>},
  { path: "/ViewShortlist", element: <ViewShortlist /> },
  { path: "/ViewServiceCategories", element: <ViewServiceCategories /> },
  { path: "/ViewServiceHistory", element: <HomeOwnerViewHistory />},
  { path: "/platformManager-view-report", element: <PlatformManagerViewReports />},
  { path: "/homeowner-dashboard", element: <HomeownerDashBoard />},
  {path: "/user-account-management", element: <UserAdminUserAccountManagement />},
  // Protected Routes (only accessible when logged in)
  {
    path: "/cleaner-view-bookings", 
    element: <ProtectedRoute>
      <CleanerViewMyBookings />
      </ProtectedRoute>
  },

  {
    path: "/user-account-management", 
    element: <ProtectedRoute>
      <UserAdminUserAccountManagement />
      </ProtectedRoute>
  },
  { path: "/homeowner-dashboard", 
    element: 
    <ProtectedRoute>
      <HomeownerDashBoard />
    </ProtectedRoute>
  },
  {
    path: "/ViewUserProfile",
    element: (
      <ProtectedRoute>
        <ViewUserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create",
    element: (
      <ProtectedRoute>
        <CreateAccountPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-profile",
    element: (
      <ProtectedRoute>
        <CreateProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cleaner-dashboard",
    element: (
      <ProtectedRoute>
        <CleanerDashboardRoute />
      </ProtectedRoute>
    ),
  },
  {
    path: "/platformManager-dashboard",
    element: (
      <ProtectedRoute>
        <PlatformManagerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cleaner-view-services",
    element: (
      <ProtectedRoute>
        <CleanerViewServicesRoute />
      </ProtectedRoute>
    ),
  },

  // Fallback route for undefined paths
  { path: "*", element: <div>404 Not Found</div> },
])

const App: React.FC = () => {
  return <RouterProvider router={browserRouter} />
}

export default App
