import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { IconNotes, IconSitemap, IconSettings } from "@tabler/icons";
import { Layout } from "core/components";
import { localStoreService, organizationService } from "core/services";
import { stringhelper } from "shared/utils";
import { usePermissions } from "core/context/PermissionContext";

export const OrganizationLayout = () => {
  const [organizationSidebarMenu, setOrganizationSidebarMenu] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const { canView, loading: permissionsLoading, initialized } = usePermissions();
  const navigate = useNavigate();
  const { orgName } = useParams();

  useEffect(() => {
    if (initialized) {
      createOrganizationSideBarMenus();
    }
  }, [canView, initialized]);

  const createOrganizationSideBarMenus = async () => {
    const userID = localStoreService.getUserID();
    const response = await organizationService.getOrganizationList(userID);
    let menus = [];
    
    // Check if user has permission to view organizations
    if (canView('organizations')) {
      if (response && Array.isArray(response)) {
        const orgs = response;
        menus = orgs?.map((org) => {
          return {
            id: org.id,
            label: org.name,
            icon: IconSitemap,
            link: `/organizations/${stringhelper.removeSpaceFromString(org.name)}`,
            menuId: 'organizations'
          };
        });
      }
    }

    //organization setting menu - check permissions
    if (canView('organization-settings')) {
      menus.push({
        id: -1,
        label: 'Settings',
        icon: IconSettings,
        link: '',
        menuId: 'organization-settings'
      });
    }

    setOrganizationSidebarMenu(menus);

    // Select first organization by default if no specific org is selected
    if (orgName) {
      const selectedMenu = menus?.find(
        (x) => stringhelper.removeSpaceFromString(x.label) === orgName
      );

      if (selectedMenu) {
        setSelectedMenu(selectedMenu);
      } else {
        // If no organization matches, redirect to first available menu
        const firstAvailableMenu = getFirstAvailableMenu(menus);
        if (firstAvailableMenu) {
          console.log('Redirecting to first available organization menu:', firstAvailableMenu);
          fallbackRedirection(firstAvailableMenu);
        }
      }
    } else if (menus.length > 0) {
      const firstAvailableMenu = getFirstAvailableMenu(menus);
      if (firstAvailableMenu) {
        console.log('Redirecting to first available organization menu:', firstAvailableMenu);
        fallbackRedirection(firstAvailableMenu);
      }
    }
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

  const handleOrganizationSidebarMenu = (sidebarMenu) => {
    if (sidebarMenu.id === -1) {
      let selectedOrganizationID = selectedMenu?.id;
      sidebarMenu.link = `/organizations/${selectedOrganizationID}/organization-settings`;

      navigate(sidebarMenu.link);
    }
    else {
      setSelectedMenu(sidebarMenu);
      navigate(sidebarMenu.link);
    }
  };

  // Show loading state while permissions are being loaded
  if (permissionsLoading || !initialized) {
    return (
      <Layout
        sidebarMenu={[]}
        selectedMenu={null}
        onSidebarMenu={() => {}}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div>Loading permissions...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      sidebarMenu={organizationSidebarMenu}
      selectedMenu={selectedMenu}
      onSidebarMenu={handleOrganizationSidebarMenu}
    >
      <Outlet context={{ selectedMenu }} />
    </Layout>
  );
};