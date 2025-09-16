import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { IconNotes, IconDashboard, IconClipboard, IconChecklist, IconUserCheck, IconCashBanknote, IconReceipt, IconUser } from "@tabler/icons";
import { Layout } from "core/components";
import { localStoreService } from "core/services";

export const FranchiseLayout = () => {
  const [franchisesSidebarMenu, setFranchisesSidebarMenu] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { franchiseName } = useParams();

  useEffect(() => {
    createFranchiseSideBarMenus();
  }, []);

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

    }
    else
    {
    
     menus = [
      {
        id: 1,
        label: "Dashboard",
        icon: IconDashboard,
        link: `/franchises/${franchiseName}/dashboard`,
      },
      {
        id: 2,
        label: "Planboard",
        icon: IconClipboard,
        link: `/franchises/${franchiseName}/planboard`,
      },
      {
        id: 3,
        label: "To Confirm",
        icon: IconChecklist,
        link: `/franchises/${franchiseName}/toConfirm`,
      },
    ];

    // Only add My Profile if we have valid user info
    if (userId && userType) {
      menus.push({
        id: 4,
        label: "My Profile",
        icon: IconUser,
        link: `/franchises/${franchiseName}/profile/${userId}/${userType}`,
      });
    }

    menus.push(
      {
        id: 5,
        label: "Profile",
        icon: IconUserCheck,
        // link: `/franchises/${franchiseName}/toConfirm`,
        childrenLinks: [
          {
            id: 501,
            label: "Clients",
            icon: IconNotes,
            link: `/franchises/${franchiseName}/profile/clients`,
          },
          {
            id: 502,
            label: "Service Providers",
            icon: IconNotes,
            link: `/franchises/${franchiseName}/profile/service-providers`,
          },
          {
            id: 503,
            label: "Staffs",
            icon: IconNotes,
            link: `/franchises/${franchiseName}/profile/staffs`,
          },
        ],
      },
      {
        id: 6,
        label: "Billing",
        icon: IconNotes,
        childrenLinks: [
          {
            id: 601,
            label: "Details",
            icon: IconReceipt,
            link: `/franchises/${franchiseName}/billingDetails`,
          },
          {
            id: 602,
            label: "Generate Invoices",
            icon: IconReceipt,
            link: `/franchises/${franchiseName}/GenerateBilling`,
          },
        ],
      },
      {
        id: 7,
        label: "Payroll",
        icon: IconCashBanknote,
        childrenLinks: [
          {
            id: 701,
            label: "Details",
            icon: IconNotes,
            link: `/franchises/${franchiseName}/wageDetails`,
          },
          {
            id: 702,
            label: "Generate Wages",
            icon: IconReceipt,
            link: `/franchises/${franchiseName}/GenerateWage`,
          },
        ],
      },
      {
        id: 8,
        label: "Reports",
        icon: IconNotes,
      }
    );

  }

    setFranchisesSidebarMenu(menus);

    let selectedMenu = getSelectedMenuFromPath(menus);

    if (selectedMenu) setSelectedMenu(selectedMenu);
    // else
    //   fallbackRedirection(menus[0]);
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

  const fallbackRedirection = (menu) => {
    setSelectedMenu(menu);
    navigate(menu.link);
  };

  const handleFranchiseSidebarMenu = (sidebarMenu) => {
    setSelectedMenu(sidebarMenu);
    navigate(sidebarMenu.link);
  };

  return (
    <Layout
      sidebarMenu={franchisesSidebarMenu}
      selectedMenu={selectedMenu}
      onSidebarMenu={handleFranchiseSidebarMenu}
    >
      <Outlet context={{ selectedMenu }} />
    </Layout>
  );
};
