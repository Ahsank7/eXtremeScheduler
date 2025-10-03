import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { IconNotes, IconSitemap, IconSettings } from "@tabler/icons";
import { Layout } from "core/components";
import { localStoreService, organizationService } from "core/services";
import { stringhelper } from "shared/utils";

export const OrganizationLayout = () => {
  const [organizationSidebarMenu, setOrganizationSidebarMenu] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const navigate = useNavigate();
  const { orgName } = useParams();

  useEffect(() => {
    createOrganizationSideBarMenus();
  }, []);

  const createOrganizationSideBarMenus = async () => {
    const userID = localStoreService.getUserID();
    const response = await organizationService.getOrganizationList(userID);
    let menus = [];
    if (response && Array.isArray(response)) {
      const orgs = response;
      menus = orgs?.map((org) => {
        return {
          id: org.id,
          label: org.name,
          icon: IconSitemap,
          link: `/organizations/${stringhelper.removeSpaceFromString(org.name)}`,
        };
      });
    }

    //organization setting menu
    menus.push({
      id: -1,
      label: 'Settings',
      icon: IconSettings,
      link: ''
    });

    setOrganizationSidebarMenu(menus);

    // Select first organization by default if no specific org is selected
    if (orgName) {
      const selectedMenu = menus?.find(
        (x) => stringhelper.removeSpaceFromString(x.label) === orgName
      );

      if (selectedMenu) setSelectedMenu(selectedMenu);
      else if (menus.length > 0) fallbackRedirection(menus[0]);
    } else if (menus.length > 0) {
      fallbackRedirection(menus[0]);
    }
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