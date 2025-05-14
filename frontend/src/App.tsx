import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import ProtectedRoute from "./routes/ProtectedRoutes" // Auth guard
import LoginPage from "./routes/LoginPage"

// User admin
import AdminDashboard from "./routes/UserAdmin/AdminDashboard"
import CreateNewUserAccountPage from "./routes/UserAdmin/CreateNewUserAccountPage"
import CreateNewUserProfilePage from "./routes/UserAdmin/CreateNewUserProfilePage"
import ViewUserAccountPage from "./routes/UserAdmin/ViewUserAccountPage"
import ViewUserProfilePage from "./routes/UserAdmin/ViewUserProfilePage"

// Platform Manager
import PlatformManagerDashboard from "./routes/PlatformManager/PlatformManagerDashboard"
import ViewServiceCategoryPage from "./routes/PlatformManager/ViewServiceCategoryPage"
import ReportPage from "./routes/PlatformManager/ReportPage"

// Homeowner
import HomeownerDashBoard from "./routes/HomeOwner/HomeownerDashBoard"
import ViewCleanersPage from "./routes/HomeOwner/ViewCleanersPage"
import ViewHomeOwnerServiceHistoryPage from "./routes/HomeOwner/ViewHomeownerServiceHistoryPage"
import ViewShortlistPage from "./routes/HomeOwner/ViewShortlistPage"

// Cleaner
import CleanerDashboardRoute from "./routes/Cleaner/CleanerDashboard"
import ViewCleanerServiceHistoryPage from "./routes/Cleaner/ViewCleanerServiceHistoryPage"
import ViewServicesPage from "./routes/Cleaner/ViewServicesPage"

import HomeRoute from "./routes/HomeRoute"


const browserRouter = createBrowserRouter([
  // Public Routes
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },

  // User Admin
  {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create",
    element: (
      <ProtectedRoute>
        <CreateNewUserAccountPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-profile",
    element: (
      <ProtectedRoute>
        <CreateNewUserProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ViewUserProfile",
    element: (
      <ProtectedRoute>
        <ViewUserProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user-account-management",
    element: 
      <ProtectedRoute>
        <ViewUserAccountPage />
      </ProtectedRoute>
  },

  // Platform Manager
  {
    path: "/platformManager-dashboard",
    element: (
      <ProtectedRoute>
        <PlatformManagerDashboard />
      </ProtectedRoute>
    ),
  },
  { path: "/platformManager-view-report", 
    element: (
      <ProtectedRoute>
        <ReportPage />
      </ProtectedRoute>
    )
  },
  { path: "/ViewServiceCategories", 
    element: (
      <ProtectedRoute>
        <ViewServiceCategoryPage />
      </ProtectedRoute>
    ) 
  },

  // Homeowner
  {
    path: "/homeowner-dashboard",
    element:
      <ProtectedRoute>
        <HomeownerDashBoard />
      </ProtectedRoute>
  },
  { path: "/ViewCleanerService", 
    element: (
      <ProtectedRoute>
        <ViewCleanersPage />
      </ProtectedRoute>
    )
  },
  { path: "/ViewServiceHistory", 
    element: (
      <ProtectedRoute>
        <ViewHomeOwnerServiceHistoryPage />
      </ProtectedRoute>
    )
  },
  { path: "/ViewShortlist", 
    element: (
      <ProtectedRoute>
        <ViewShortlistPage />
      </ProtectedRoute>
    )
  },

  // Cleaner
  {
    path: "/cleaner-dashboard",
    element: (
      <ProtectedRoute>
        <CleanerDashboardRoute />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cleaner-view-bookings",
    element: <ProtectedRoute>
      <ViewCleanerServiceHistoryPage />
    </ProtectedRoute>
  },
  {
    path: "/cleaner-view-services",
    element: (
      <ProtectedRoute>
        <ViewServicesPage />
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
