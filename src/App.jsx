import { Navigate, Route, Routes } from "react-router-dom";
import { OrganizationLayout, FranchiseLayout } from "core/components";
import Login from "features/auth/pages/Login";
import Organizations from "features/organization/pages/Organizations";
import FranchiseDashboard from "features/franchise/pages/FranchiseDashboard";
import Planboard from "features/planboard/pages/Planboard";
import ToConfirm from "features/toConfirm/pages/ToConfirm";
import { ProfileDetail } from "shared/components/user/ProfileDetail";
import OrganizationsDetail from "features/organization/pages/OrganizationsDetail";
import Users from "features/user/pages/Users";
import { Payments } from "shared/components/user/Payments";
import { Transactions } from "shared/components/user/Transactions";
import { UserType } from "core/enum";
import GenerateBilling from "features/billing/GenerateBilling";
import GenerateWage from "features/wage/GenerateWage";
import { ServiceProviderAttendance } from "features/attendance";
import StandaloneAttendance from "features/attendance/pages/StandaloneAttendance";
import { StandaloneAdminPortal } from "features/admin";
import { PermissionProvider } from "core/context/PermissionContext";
import { Reports } from "features/reports";
import { LandingPage } from "features/landing";

const App = () => {
  return (
    <PermissionProvider>
      <div>
        <Routes>
        <Route path="/organizations" element={<OrganizationLayout />}>
          <Route path=":orgName" element={<Organizations />} />
          <Route
            path=":organizationID/organization-settings"
            element={<OrganizationsDetail />}
          />
        </Route>

        <Route path="/franchises" element={<FranchiseLayout />}>
          <Route
            path=":franchiseName/dashboard"
            element={<FranchiseDashboard />}
          />
          <Route path=":franchiseName/planboard" element={<Planboard />} />
          <Route path=":franchiseName/toConfirm" element={<ToConfirm />} />
          <Route path=":franchiseName/attendance" element={<ServiceProviderAttendance />} />

          <Route path=":franchiseName/profile">
            <Route
              path="clients"
              element={
                <Users key={UserType.Clients} userTypeID={UserType.Clients} />
              }
            />
            <Route
              path="service-providers"
              element={
                <Users
                  key={UserType["Service Providers"]}
                  userTypeID={UserType["Service Providers"]}
                />
              }
            />
            <Route
              path="staffs"
              element={
                <Users key={UserType.Staffs} userTypeID={UserType.Staffs} />
              }
            />
            <Route path=":userID/:userType" element={<ProfileDetail />} />
          </Route>
          <Route
            path=":franchiseName/billingDetails"
            element={<Payments type="billing" />}
          />
          <Route
            path=":franchiseName/wageDetails"
            element={<Payments type="wage" />}
          />
           <Route
            path=":franchiseName/GenerateBilling"
            element={<GenerateBilling />}
          />
           <Route
            path=":franchiseName/GenerateWage"
            element={<GenerateWage />}
          />
          <Route
            path=":franchiseName/transactionDetails"
            element={<Transactions />}
          />
          <Route
            path=":franchiseName/reports"
            element={<Reports />}
          />
        </Route>

        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/attendance" element={<StandaloneAttendance />} />
        <Route path="/admin" element={<StandaloneAdminPortal />} />
        <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </div>
    </PermissionProvider>
  );
};

export default App;
