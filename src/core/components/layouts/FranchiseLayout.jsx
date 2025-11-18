import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { IconNotes, IconDashboard, IconClipboard, IconChecklist, IconUserCheck, IconCashBanknote, IconReceipt, IconUser, IconClock, IconFileText, IconFileInvoice, IconChartBar } from "@tabler/icons";
import { Layout } from "core/components";
import { localStoreService } from "core/services";
import { usePermissions } from "core/context/PermissionContext";

export const FranchiseLayout = () => {
  const [franchisesSidebarMenu, setFranchisesSidebarMenu] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const { canView, loading: permissionsLoading, initialized } = usePermissions();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { franchiseName } = useParams();

  useEffect(() => {
    if (initialized) {
      createFranchiseSideBarMenus();
    }
  }, [canView, initialized]);

  const createFranchiseSideBarMenus = async () => {
    // Get user info from token
    let userId, userType;
    
    try {
      userId = localStoreService.getUserID();
      userType = localStoreService.getUserType();
      
      // Ensure userType is a number for comparison
      if (userType && typeof userType === 'string') {
        userType = parseInt(userType, 10);
      }
      
    } catch (error) {
      console.error('Error getting user info from token:', error);
      // If there's an error, we'll still create the menu but without the My Profile option
      userId = null;
      userType = null;
    }

    let menus = [];

    if (userType === 1 || userType === 2) {
      menus = [
        {
          id: 1,
          label: "My Profile",
          icon: IconUser,
          link: `/franchises/${franchiseName}/profile/${userId}/${userType}`,
        }
      ];

      // Add attendance portal for service providers (userType === 2)
      if (userType === 2) {
        menus.push({
          id: 2,
          label: "Attendance Portal",
          icon: IconClock,
          link: `/franchises/${franchiseName}/attendance`,
        });
      }
    }
    else
    {
      // Create base menu items for staff users
      const baseMenus = [
        {
          id: 1,
          label: "Dashboard",
          icon: IconDashboard,
          link: `/franchises/${franchiseName}/dashboard`,
          menuId: "dashboard" // Use a simpler menu ID that exists in the database
        },
        {
          id: 2,
          label: "Planboard",
          icon: IconClipboard,
          link: `/franchises/${franchiseName}/planboard`,
          menuId: "planboard"
        },
        {
          id: 3,
          label: "To Confirm",
          icon: IconChecklist,
          link: `/franchises/${franchiseName}/toConfirm`,
          menuId: "to-confirm"
        },
      ];

      // Filter menus based on permissions
      menus = baseMenus.filter(menu => {
        if (menu.menuId) {
          // If permissions are not loaded yet, allow access to prevent blocking
          if (!initialized) {
            return true;
          }
          return canView(menu.menuId);
        }
        return true; // Allow menus without menuId
      });

    // Only add My Profile if we have valid user info
    if (userId && userType) {
      menus.push({
        id: 4,
        label: "My Profile",
        icon: IconUser,
        link: `/franchises/${franchiseName}/profile/${userId}/${userType}`,
      });
    }

    // Add additional menu items with permission checking
    const additionalMenus = [
      {
        id: 5,
        label: "Profile",
        icon: IconUserCheck,
        menuId: "profile",
        childrenLinks: [
          {
            id: 501,
            label: "Clients",
            icon: IconNotes,
            link: `/franchises/${franchiseName}/profile/clients`,
            menuId: "clients"
          },
          {
            id: 502,
            label: "Service Providers",
            icon: IconNotes,
            link: `/franchises/${franchiseName}/profile/service-providers`,
            menuId: "service-providers"
          },
          {
            id: 503,
            label: "Staffs",
            icon: IconNotes,
            link: `/franchises/${franchiseName}/profile/staffs`,
            menuId: "staffs"
          },
        ],
      },
      {
        id: 6,
        label: "Billing",
        icon: IconNotes,
        menuId: "billing",
        childrenLinks: [
          {
            id: 601,
            label: "Details",
            icon: IconReceipt,
            link: `/franchises/${franchiseName}/billingDetails`,
            menuId: "billing-details"
          },
          {
            id: 602,
            label: "Generate Invoices",
            icon: IconReceipt,
            link: `/franchises/${franchiseName}/GenerateBilling`,
            menuId: "billing-generate"
          },
        ],
      },
      {
        id: 7,
        label: "Payroll",
        icon: IconCashBanknote,
        menuId: "payroll",
        childrenLinks: [
          {
            id: 701,
            label: "Details",
            icon: IconNotes,
            link: `/franchises/${franchiseName}/wageDetails`,
            menuId: "wage-details"
          },
          {
            id: 702,
            label: "Generate Wages",
            icon: IconReceipt,
            link: `/franchises/${franchiseName}/GenerateWage`,
            menuId: "wage-generate"
          },
        ],
      },
      {
        id: 8,
        label: "Reports",
        icon: IconFileText,
        link: `/franchises/${franchiseName}/reports`,
        menuId: "reports"
      }
    ];

    // Filter additional menus based on permissions
    const filteredAdditionalMenus = additionalMenus.filter(menu => {
      if (menu.menuId) {
        // If permissions are not loaded yet, allow access to prevent blocking
        if (!initialized) {
          return true;
        }
        return canView(menu.menuId);
      }
      return true; // Allow menus without menuId
    });

    menus.push(...filteredAdditionalMenus);

  }

    setFranchisesSidebarMenu(menus);

    let selectedMenu = getSelectedMenuFromPath(menus);

    if (selectedMenu) {
      setSelectedMenu(selectedMenu);
    } else {
      // If no menu matches current path, redirect to first available menu
      // Only redirect if we're not already on a valid route
      const currentPath = pathname;
      const isOnValidRoute = menus.some(menu => 
        menu.link === currentPath || 
        (menu.childrenLinks && menu.childrenLinks.some(child => child.link === currentPath))
      );
      
      if (!isOnValidRoute) {
        const firstAvailableMenu = getFirstAvailableMenu(menus);
        if (firstAvailableMenu) {
          console.log('Redirecting to first available menu:', firstAvailableMenu);
          fallbackRedirection(firstAvailableMenu);
        }
      }
    }
  };

  const getSelectedMenuFromPath = (menus) => {
    let selectedMenu = menus?.find((x) => x.link === pathname);
    const selectedMenuFromChildren = menus?.filter((x) => x.childrenLinks);

    for (var i = 0; i < selectedMenuFromChildren.length; i++) {
      if (
        selectedMenuFromChildren[i].childrenLinks.find(
          (x) => x.link === pathname
        )
      ) {
        selectedMenu = selectedMenuFromChildren[i];
        break;
      }
    }

    return selectedMenu;
  };

  const getFirstAvailableMenu = (menus) => {
    // Find the first menu item that has a link (not just a parent menu)
    for (const menu of menus) {
      if (menu.link && menu.link !== '') {
        return menu;
      }
      // Check children if this is a parent menu
      if (menu.childrenLinks && menu.childrenLinks.length > 0) {
        for (const child of menu.childrenLinks) {
          if (child.link && child.link !== '') {
            return child;
          }
        }
      }
    }
    return null;
  };

  const fallbackRedirection = (menu) => {
    setSelectedMenu(menu);
    navigate(menu.link);
  };

  const handleFranchiseSidebarMenu = (sidebarMenu) => {
    setSelectedMenu(sidebarMenu);
    navigate(sidebarMenu.link);
  };

  // Show loading state while permissions are being loaded
  if (permissionsLoading || !initialized) {
    return (
      <Layout
        sidebarMenu={[]}
        selectedMenu={null}
        onSidebarMenu={() => {}}
        franchiseName={franchiseName}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div>Loading permissions...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      sidebarMenu={franchisesSidebarMenu}
      selectedMenu={selectedMenu}
      onSidebarMenu={handleFranchiseSidebarMenu}
      franchiseName={franchiseName}
    >
      <Outlet context={{ selectedMenu }} />
    </Layout>
  );
};
