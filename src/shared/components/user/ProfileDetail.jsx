import {
  Tabs,
  createStyles,
  Card,
  Text,
  Avatar,
  Group,
  Button,
  Tooltip,
  Modal,
} from "@mantine/core";
import { AppContainer } from "shared/components";
import { ProfileInformation } from "shared/components/user/ProfileInformation";
import { Address } from "shared/components/user/Address";
import { Document } from "shared/components/user/Document";
import { Availability } from "shared/components/user/Availability";
import { Leave } from "shared/components/user/Leave";
import { Contact } from "shared/components/user/Contact";
import { Schedule } from "shared/components/user/Schedule";
import { Creadentials } from "shared/components/user/Creadentials";
import { Expense } from "shared/components/user/Expense";
import { BankInfo } from "shared/components/user/BankInfo";
import { CardInfo } from "shared/components/user/CardInfo";
import { ServiceProviderContractInfo } from "shared/components/user/ServiceProviderContractInfo";
import { Payments } from "shared/components/user/Payments";
import { Transactions } from "shared/components/user/Transactions";
import { RoleManagement } from "shared/components/user/RoleManagement";
import { useState, useEffect } from "react";
import { localStoreService, profileService, documentService, authenticationService } from "core/services";
import { useParams } from "react-router-dom";
import { UserType } from "core/enum";
import { helperFunctions } from "shared/utils";
import { calculateAge, formatAge } from "shared/utils/ageUtils";
import { IconTrash, IconUpload, IconEye } from "@tabler/icons";
import { notifications } from "@mantine/notifications";
import enviroment from "../../../enviroment";

const useStyles = createStyles((theme) => ({
  tab: {
    padding: "1rem 1rem",
  },
  panel: {
    height: "100%",
    paddingTop: "1rem",
    overflow: "auto",
  },
  label: {
    color: "green",
    "&:focus": {
      borderColor: "#ced4da !important",
    },
  },
  profileCard: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    marginBottom: theme.spacing.md,
    height: "100%",
    overflowY: "auto",
    paddingBottom: `${theme.spacing.xs} !important`,
    paddingTop: `${theme.spacing.xs} !important`,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 120,
    position: "relative",
    boxShadow: theme.shadows.md,
    transition: "box-shadow 0.2s",
    cursor: "pointer",
  },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    opacity: 0,
    transition: "opacity 0.2s",
    zIndex: 2,
  },
  avatarOverlayVisible: {
    opacity: 1,
  },
  avatarButton: {
    margin: 0,
    width: 40,
    height: 40,
    minWidth: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
}));

export const ProfileDetail = () => {
  const { classes, cx } = useStyles();
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [tabs, setTabs] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const backendBaseUrl = enviroment.baseURL.replace(/\/api\/?$/, "");
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  //#region all tabs
  //   const tabs = [
  //     "Profile",
  //     "Schedule",
  //     "Address",
  //     "Contact",
  //     "Leave",
  //     "Document",
  //     "Availability",
  //     "Credentials",
  //     "Expense",
  //     "CardInfo",
  //     "BankInfo",
  //     "Transactions",
  //     "BillingInfo",
  //     "WageInfo",
  //   ];
  //#endregion

  const { userID, userType } = useParams();
  const organizationId = localStoreService.getOrganizationID();
  const franchiseId = localStoreService.getFranchiseID(); //get franchiseID and userType with user data

  // Convert userType to number since it comes from URL parameters as string
  const numericUserType = userType ? parseInt(userType, 10) : null;
  
  // Set readOnly for user types 1 (Clients) and 2 (Service Providers) when viewing their own profile
  const isOwnProfile = localStoreService.getUserID() === userID;
  const readOnly = isOwnProfile && (numericUserType === 1 || numericUserType === 2);

  useEffect(() => {
      const fetchProfileData = async () => {
    try {
      const { data } = await profileService.getUserByID(userID);
      
      // Calculate age from birthDate if available
      let calculatedAge = null;
      if (data.birthDate) {
        calculatedAge = calculateAge(data.birthDate.split("T")[0]);
      }
      
      // Create profile data with calculated age
      const profileDataWithAge = {
        ...data,
        age: calculatedAge
      };
      
      setProfileData(profileDataWithAge);
      setAvatarUrl(data.profileImagePath);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    }
  };

 

    if (!helperFunctions.isValidGUID(userID)) {
      getTabsByUserType(-1);
    } else {
      getTabsByUserType(numericUserType);
      fetchProfileData();
    }
  }, [userID, numericUserType]);

  // Fetch avatar on mount or when userID changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!userID) return;
      setAvatarLoading(true);
      try {
        const response = await documentService.getUserImage(userID);
        if (response && response.status === 200 && response.data) {
          setAvatarUrl(response.data);
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        setAvatarUrl(null);
      } finally {
        setAvatarLoading(false);
      }
    };
    fetchAvatar();
  }, [userID]);

  const getTabsByUserType = (userType) => {
    
    let tabs = [];
    
    if (userType == UserType.Clients) {
      tabs = [
        "Profile",
        "Schedule",
        "Address",
        "Contact",
        "Leave",
        "Document",
        "Credentials",
        "Credit/Debit Card",
        "Bank Account Info",
        "Billing Info",
      ];
      
  
    } else if (userType == UserType["Service Providers"]) {
      tabs = [
        "Profile",
        "Schedule",
        "Address",
        "Contact",
        "Leave",
        "Document",
        "Availability",
        "Credentials",
        "Expense",
        "Credit/Debit Card",
        "Contract Info",
        "Bank Account Info",
        "Wage Info",
      ];
      
    } else if (userType == UserType.Staffs) {
      tabs = ["Profile", "Role Management", "Address", "Contact", "Leave", "Document", "Credentials"];
      
 
    } else {
      tabs = ["Profile"];
    }
    
    console.log('Final tabs:', tabs);
    setTabs(tabs);
  };


  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const response = await documentService.uploadUserImage(userID, file);
      if (response && response.status === 200 && response.data && response.data.filePath) {
        setAvatarUrl(response.data.filePath);
        notifications.show({ title: "Success", message: "Profile image uploaded successfully", color: "green" });
      } else {
        notifications.show({ title: "Error", message: "Failed to upload image", color: "red" });
      }
    } catch (error) {
      notifications.show({ title: "Error", message: "Failed to upload image", color: "red" });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleImageRemove = async () => {
    setAvatarLoading(true);
    try {
      const response = await documentService.deleteUserImage(userID);
      if (response && (response.status === 200 || response === "User image deleted successfully")) {
        setAvatarUrl(null);
        notifications.show({ title: "Success", message: "Profile image removed", color: "green" });
      } else {
        notifications.show({ title: "Error", message: "Failed to remove image", color: "red" });
      }
    } catch (error) {
      notifications.show({ title: "Error", message: "Failed to remove image", color: "red" });
    } finally {
      setAvatarLoading(false);
    }
  };

  const RenderSelectedTabPanel = (activeTab) => {
    switch (activeTab) {
      case "Profile":
        return (
          <Tabs.Panel value="Profile" className={classes.panel}>
            <ProfileInformation 
              id={userID} 
              userType={numericUserType} 
              onProfileDataUpdate={(updatedData) => setProfileData(updatedData)}
              readOnly={readOnly}
            />
          </Tabs.Panel>
        );
      case "Role Management":
        return (
          <Tabs.Panel value="Role Management" className={classes.panel}>
            <RoleManagement
              userId={userID}
              userType={numericUserType}
              readOnly={readOnly}
            />
          </Tabs.Panel>
        );
      case "Schedule":
        return (
          <Tabs.Panel value="Schedule" className={classes.panel}>
            <Schedule userId={userID} organizationId={organizationId} userType={numericUserType} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Address":
        return (
          <Tabs.Panel value="Address" className={classes.panel}>
            <Address userId={userID} organizationId={organizationId} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Contact":
        return (
          <Tabs.Panel value="Contact" className={classes.panel}>
            <Contact
              userId={userID}
              organizationId={organizationId}
              franchiseId={franchiseId}
              readOnly={readOnly}
            />
          </Tabs.Panel>
        );
      case "Leave":
        return (
          <Tabs.Panel value="Leave" className={classes.panel}>
            <Leave userId={userID} organizationId={organizationId} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Document":
        return (
          <Tabs.Panel value="Document" className={classes.panel}>
            <Document userId={userID} organizationId={organizationId} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Availability":
        return (
          <Tabs.Panel value="Availability" className={classes.panel}>
            <Availability userId={userID} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Credentials":
        return (
          <Tabs.Panel value="Credentials" className={classes.panel}>
            <Creadentials
              userId={userID}
              userType={profileData.userType}
              readOnly={readOnly}
            />
          </Tabs.Panel>
        );
      case "Expense":
        return (
          <Tabs.Panel value="Expense" className={classes.panel}>
            <Expense userId={userID} organizationId={organizationId} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Credit/Debit Card":
        return (
          <Tabs.Panel value="Credit/Debit Card" className={classes.panel}>
            <CardInfo userId={userID} organizationId={organizationId} userType={numericUserType} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Contract Info":
        return (
          <Tabs.Panel value="Contract Info" className={classes.panel}>
            <ServiceProviderContractInfo userId={userID} organizationId={organizationId} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Bank Account Info":
        return (
          <Tabs.Panel value="Bank Account Info" className={classes.panel}>
            <BankInfo userId={userID} organizationId={organizationId} readOnly={readOnly} />
          </Tabs.Panel>
        );
      case "Billing Info":
        return (
          <Tabs.Panel value="Billing Info" className={classes.panel}>
            <Payments
              userId={userID}
              // franchiseId={franchiseId}
              type={"billing"}
              readOnly={readOnly}
            />
          </Tabs.Panel>
        );
      case "Wage Info":
        return (
          <Tabs.Panel value="Wage Info" className={classes.panel}>
            <Payments userId={userID} type={"wage"} readOnly={readOnly} />
          </Tabs.Panel>
        );
      default:
        // return (
        //   <Tabs.Panel value="Profile" className={classes.panel}>
        //     <ProfileInformation id={userID} organizationId={organizationId} />
        //   </Tabs.Panel>
        // );
        break;
    }
  };

  return (
    <AppContainer height="100" title="">
      {readOnly && (
        <Card 
          shadow="sm" 
          p="md" 
          radius="md" 
          mb="md"
          style={{ 
            backgroundColor: '#fff3cd', 
            borderColor: '#ffeaa7',
            border: '2px solid #ffeaa7'
          }}
        >
          <Text size="lg" weight={600} style={{ color: '#856404' }}>
            📖 Read-Only Profile
          </Text>
          <Text size="sm" style={{ color: '#856404', marginTop: '0.5rem' }}>
            You are viewing your own profile in read-only mode. You can navigate between tabs and view information, but cannot create, update, or delete any data.
          </Text>
        </Card>
      )}
      <Card className={classes.profileCard} shadow="sm" p="lg" radius="md" withBorder>
        <Group position="apart" align="center" noWrap>
          {/* User Info Block */}
          {profileData && (
            <div>
              <Text
                size="xl"
                weight={700}
              >{`${profileData.firstName} ${profileData.lastName} ( ${profileData.userNo} )`}</Text>
              {readOnly && (
                <Text size="sm" color="orange" weight={500} style={{ marginTop: '0.25rem' }}>
                  🔒 Read-Only Mode
                </Text>
              )}
              <Text size="sm" color="dimmed">
                {`Email : ${profileData.email}`}
              </Text>
              <Text size="sm" color="dimmed">
                {`Phone Number : ${profileData.phoneNo}`}
              </Text>
              <Text size="sm" color="dimmed">
                {`Age : ${formatAge(profileData.age)}`}
              </Text>
              <Text size="sm" color="dimmed">
                {`Current Status : `}
                <span style={{ color: profileData.status === 'InActive' ? 'red' : 'green' }}>
                  {profileData.status === 'InActive' ? 'In-Active' : 'Active'}
                </span>
              </Text>
            </div>
          )}
          {/* Avatar and Buttons */}
          <Group position="center" direction="column" spacing="xs">
            <div
              className={classes.avatarWrapper}
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
            >
              <Avatar
                src={avatarUrl ? backendBaseUrl + avatarUrl : undefined}
                alt="Profile Image"
                size={120}
                radius={120}
                className={classes.avatar}
                loading={avatarLoading ? 1 : 0}
              />
              <div
                className={cx(classes.avatarOverlay, {
                  [classes.avatarOverlayVisible]: avatarHovered,
                })}
              >
                <Tooltip label="Upload" position="right" withArrow>
                  <label htmlFor="avatar-upload-input" style={{ display: "flex" }}>
                    <input
                      id="avatar-upload-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                      disabled={avatarLoading || readOnly}
                    />
                    <Button
                      leftIcon={<IconUpload size={20} />}
                      component="span"
                      loading={avatarLoading}
                      disabled={avatarLoading || readOnly}
                      className={classes.avatarButton}
                      variant="white"
                      color="dark"
                    />
                  </label>
                </Tooltip>
                {avatarUrl && (
                  <>
                    <Tooltip label="View" position="right" withArrow>
                      <Button
                        leftIcon={<IconEye size={20} />}
                        className={classes.avatarButton}
                        variant="white"
                        color="blue"
                        onClick={() => setViewModalOpen(true)}
                      />
                    </Tooltip>
                    <Tooltip label="Remove" position="right" withArrow>
                      <Button
                        leftIcon={<IconTrash size={20} />}
                        color="red"
                        variant="outline"
                        onClick={handleImageRemove}
                        loading={avatarLoading}
                        disabled={avatarLoading || readOnly}
                        className={classes.avatarButton}
                      />
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          </Group>
        </Group>
      </Card>

      <Tabs
        defaultValue="Profile"
        value={activeTab}
        onTabChange={setActiveTab}
        variant="outline"
        mb="2rem"
      >
        <Tabs.List>
          {tabs?.map((tab, index) => (
            <Tabs.Tab
              disabled={profileData?.status == "Deactivated"}
              key={index}
              className={classes.tab}
              value={tab}
            >
              {tab}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {RenderSelectedTabPanel(activeTab)}
      </Tabs>

      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Profile Image"
        centered
        size="lg"
        overlayBlur={2}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <img
            src={avatarUrl ? backendBaseUrl + avatarUrl : undefined}
            alt="Profile Large"
            style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 12 }}
          />
        </div>
      </Modal>
    </AppContainer>
  );
};
