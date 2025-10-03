import {
  Button,
  Flex,
  Grid,
  Paper,
  TextInput,
  Select,
  NumberInput,
  Divider,
  Loader,
  Text,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { z as zod } from "zod";
import { useForm, zodResolver } from "@mantine/form";
import {
  profileService,
  lookupService,
  localStoreService,
  showSuccessNotification,
  showErrorNotification,
  handleApiError,
} from "core/services";
import { helperFunctions } from "shared/utils";
import { calculateAge } from "shared/utils/ageUtils";
import { AppConfirmationModal } from "shared/components/modal/AppConfirmationModal";
import { UserStatusAction, UserType } from "core/enum";
import { AppDivider } from "../AppDivider";

const schema = zod.object({
  id: zod.string().nullable(),
  firstName: zod.string().nonempty("First Name is required"),
  surName: zod.string(),
  lastName: zod.string().nonempty("Last Name is required"),
  alias: zod.string(),
  userName: zod.string(),
  phoneNo: zod.string().regex(/^\+?[0-9]+$/, "Phone number should only contain numbers and optionally start with +"),
  mobileNo: zod.string().regex(/^\+?[0-9]+$/, "Mobile number should only contain numbers and optionally start with +"),
  email: zod.string().email("Please enter a valid email address"),
  passportNo: zod.string().max(50, "Passport number must be 50 characters or less"),
  identityNo: zod.string().max(50, "Identity number must be 50 characters or less"),
  ethnicityId: zod.number().min(0, "Ethnicity is required"),
  passwordHash: zod.string(),
  birthDate: zod.string().nonempty("Date of Birth is required"),
  joiningDate: zod.string().nonempty("Date of Joining is required"),
  notes: zod.string(),
  userNo: zod.string(),
  addressLine1: zod.string().max(100, "Address Line 1 must be 100 characters or less"),
  addressLine2: zod.string().max(100, "Address Line 2 must be 100 characters or less"),
  addressLine3: zod.string().max(100, "Address Line 3 must be 100 characters or less"),
  addressId: zod.string().nullable().optional(),
  countyId: zod.number().optional(),
  maritalStatusId: zod.number().optional(),
  stateId: zod.number().optional(),
  countryId: zod.number().optional(),
  latitude: zod.number().optional(),
  longitude: zod.number().optional(),
  titleId: zod.number().optional(),
  genderId: zod.number().optional(),
  nationalityID: zod.number().optional(),
  franchiseId: zod.string().nonempty("Franchise ID is required"),
});

export function ProfileInformation({ id, userType, onProfileDataUpdate, readOnly = false }) {
  const [genderOptions, setGenderOptions] = useState([]);
  const [ethnicityOptions, setEthnicityOptions] = useState([]);
  const [nationalityOptions, setNationalityOptions] = useState([]);
  // const [statusOptions, setStatusOptions] = useState([]);
  const [titleOptions, setTitleOptions] = useState([]);
  const [contactCountryOptions, setContactCountryOptions] = useState([]);
  const [contactStateOptions, setContactStateOptions] = useState([]);
  const [contactCountyOptions, setContactCountyOptions] = useState([]);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [userStatusAction, setUserStatusAction] = useState(0);
  const [userStatusInDB, setUserStatusInDB] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const organizationId = localStoreService.getOrganizationID();
  let isValidUserID = helperFunctions.isValidGUID(id);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      id: isValidUserID ? id : null,
      firstName: "",
      surName: "",
      lastName: "",
      alias: "",
      userName: "",
      phoneNo: "",
      mobileNo: "",
      email: "",
      passportNo: "",
      identityNo: "",
      ethnicityId: 0,
      passwordHash: "",
      birthDate: "",
      joiningDate: "",
      notes: "",
      userNo: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      addressId: null,
      countyId: 0,
      maritalStatusId: 0,
      stateId: 0,
      countryId: 0,
      latitude: 0,
      longitude: 0,
      titleId: 0,
      genderId: 0,
      nationalityID: 0,
      franchiseId: localStoreService.getFranchiseID(),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const genderResponse = await lookupService.getLookupList({
          lookupType: "Gender",
          organizationId,
        });
        setGenderOptions(
          (genderResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const ethnicityResponse = await lookupService.getLookupList({
          lookupType: "Ethnicity",
          organizationId,
        });
        setEthnicityOptions(
          (ethnicityResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const nationalityResponse = await lookupService.getLookupList({
          lookupType: "Nationality",
          organizationId,
        });
        setNationalityOptions(
          (nationalityResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        // const statusResponse = await lookupService.getLookupList({
        //   lookupType: 15,
        //   organizationId,
        // });
        // setStatusOptions(
        //   statusResponse.data.map((item) => ({
        //     value: item.id,
        //     label: item.name,
        //   }))
        // );

        const titleResponse = await lookupService.getLookupList({
          lookupType: "Title",
          organizationId,
        });
        setTitleOptions(
          (titleResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const countyResponse = await lookupService.getLookupList({
          lookupType: "County",
          organizationId,
        });
        setContactCountyOptions(
          (countyResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const stateResponse = await lookupService.getLookupList({
          lookupType: "State",
          organizationId,
        });
        setContactStateOptions(
          (stateResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const countryResponse = await lookupService.getLookupList({
          lookupType: "Country",
          organizationId,
        });
        setContactCountryOptions(
          (countryResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const maritalStatusResponse = await lookupService.getLookupList({
          lookupType: "MaritalStatus",
          organizationId,
        });
        setMaritalStatusOptions(
          (maritalStatusResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch lookup data:", error);
      }
    };

    fetchLookupData();
  }, []);

  useEffect(() => {
    const getProfileDetail = async () => {
      try {
        const response = await profileService.getUserByID(id);
        console.log('Profile Information Response:', response); // Debug log

        // Calculate age from birthDate if available
        let calculatedAge = null;
        if (response && response.birthDate) {
          calculatedAge = calculateAge(response.birthDate.split("T")[0]);
        }

        // Create profile data with calculated age
        const profileDataWithAge = {
          ...response,
          age: calculatedAge
        };

        form.setValues({
          ...response,
          birthDate: response?.birthDate ? response.birthDate.split("T")[0] : "",
          joiningDate: response?.joiningDate ? response.joiningDate.split("T")[0] : "",
        });

        setUserStatusInDB(response?.status);
        setProfileData(profileDataWithAge);
        
        if (onProfileDataUpdate) {
          onProfileDataUpdate(profileDataWithAge);
        }
      } catch (error) {
        handleApiError(error, "Failed to fetch profile details");
      }
    };
    if (isValidUserID) {
      getProfileDetail();
    }
  }, []);

  const handleSubmit = async (values) => {
    setIsLoading(true);

    try {

      const birthDate = new Date(values.birthDate);
      const joiningDate = new Date(values.joiningDate);

      if (birthDate < new Date('1753-01-01') || birthDate > new Date('9999-12-31')) {
        showErrorNotification("Date of Birth must be between 1753 and 9999", "Validation Error");
        setIsLoading(false);
        return;
      }

      if (joiningDate < new Date('1753-01-01') || joiningDate > new Date('9999-12-31')) {
        showErrorNotification("Date of Joining must be between 1753 and 9999", "Validation Error");
        setIsLoading(false);
        return;
      }

      const response = await profileService.saveUpdateUserInfo({
        id: values.id,
        firstName: values.firstName,
        surName: values.surName,
        lastName: values.lastName,
        alias: values.alias,
        userName: values.userName,
        phoneNo: values.phoneNo,
        mobileNo: values.mobileNo,
        email: values.email,
        passportNo: values.passportNo,
        identityNo: values.identityNo,
        ethnicityId: values.ethnicityId,
        passwordHash: values.passwordHash,
        birthDate: values.birthDate,
        joiningDate: values.joiningDate,
        notes: values.notes,
        userNo: values.userNo,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        addressLine3: values.addressLine3,
        addressId: values.addressId,
        countyId: values.countyId,
        maritalStatusId: values.maritalStatusId,
        stateId: values.stateId,
        countryId: values.countryId,
        latitude: values.latitude,
        longitude: values.longitude,
        titleId: values.titleId,
        genderId: values.genderId,
        nationalityID: values.nationalityID,
        franchiseId: values.franchiseId,
        userType: userType,
      });
      showSuccessNotification("Profile details saved successfully");

      if (!isValidUserID) {
        setTimeout(() => {
          window.location.href = replaceDummyUserIDFromURLString(
            window.location.href,
            response
          );
        }, 1000);
      } else {
        // Update profile data after successful save
        const updatedData = { ...profileData, ...values };

        // Ensure age is calculated and included in the updated data
        if (values.birthDate) {
          const calculatedAge = calculateAge(values.birthDate);
          updatedData.age = calculatedAge;
        }

        if (onProfileDataUpdate) {
          onProfileDataUpdate(updatedData);
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to save profile details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    let userStatusActionID =
      userStatusAction == "Active"
        ? UserStatusAction.Active
        : userStatusAction == "In-Active"
          ? UserStatusAction.InActive
          : UserStatusAction.Remove;

    try {
      const response = await profileService.removeUser(id, userStatusActionID);

      showSuccessNotification("Profile updated successfully");

        setTimeout(() => {
          switch (+userType) {
            case UserType.Clients:
              return (window.location.href = `${window.location.href.split("profile/")[0]
                }profile/clients`);
            case UserType["Service Providers"]:
              return (window.location.href = `${window.location.href.split("profile/")[0]
                }profile/service-providers`);
            case UserType.Staffs:
              return (window.location.href = `${window.location.href.split("profile/")[0]
                }profile/staffs`);
            default:
              break;
          }
        }, 1000);

        setIsConfirmationModalOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to remove profile");
    } finally {
      setIsLoading(false);
    }
  };

  const replaceDummyUserIDFromURLString = (url, userID) => {
    let splitUrl = url.split("profile/");
    let dummyUserID = splitUrl[1].split("/")[0];

    return url.replace(dummyUserID, userID);
  };

  const openConfirmatonModal = (userStatusAction) => {
    setUserStatusAction(userStatusAction);
    setIsConfirmationModalOpen(true);
  };



  // Handle DOB change to calculate age
  const handleBirthDateChange = (value) => {
    form.setFieldValue('birthDate', value);
    const age = calculateAge(value);

    // Update the profile data to show calculated age in the top bar
    if (profileData) {
      const updatedData = { ...profileData, age };
      setProfileData(updatedData);
      if (onProfileDataUpdate) {
        onProfileDataUpdate(updatedData);
      }
    }
  };



  return (
    <>
      {/* {<pre>{JSON.stringify(form.errors)}</pre>} */}
      <form onSubmit={readOnly ? (e) => e.preventDefault() : form.onSubmit(handleSubmit)}>
        {readOnly && (
          <Paper
            withBorder
            p="md"
            mb="md"
            radius="md"
            style={{
              backgroundColor: '#fff3cd',
              borderColor: '#ffeaa7',
              color: '#856404'
            }}
          >
            <Text size="sm" weight={500}>
              📖 This profile is in read-only mode. You can view information but cannot make changes.
            </Text>
          </Paper>
        )}
        <Flex justify="flex-end" mb="md">
          <Button.Group position="center">
            {userStatusInDB != "Deactivated" && (
              <Button type="submit" disabled={readOnly}>Save</Button>
            )}
            {isValidUserID && userStatusInDB != "Deactivated" && (
              <Button
                disabled={!isValidUserID || readOnly}
                color="yellow"
                onClick={() =>
                  openConfirmatonModal(
                    userStatusInDB == "InActive" ? "Active" : "In-Active"
                  )
                }
              >
                {userStatusInDB == "InActive" ? "Active" : "In-Active"}
              </Button>
            )}
            {isValidUserID && userStatusInDB != "Deactivated" && (
              <Button
                disabled={!isValidUserID || readOnly}
                color="red"
                onClick={() => openConfirmatonModal(UserStatusAction.Remove)}
              >
                Purge
              </Button>
            )}
          </Button.Group>
        </Flex>
        {isLoading && <Loader />}
        <Paper withBorder p="md" radius="md">
          <h3>Basic Information</h3>
          <Grid gutter="xs" mt="md">
            <Grid.Col span={3}>
              <Select
                label="Title"
                placeholder="Select Title"
                size="md"
                data={titleOptions}
                {...form.getInputProps("titleId")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                withAsterisk
                label="First Name"
                placeholder="John"
                size="md"
                required
                {...form.getInputProps("firstName")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="Sur Name"
                placeholder=""
                size="md"
                {...form.getInputProps("surName")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                withAsterisk
                label="Last Name"
                placeholder="Smith"
                size="md"
                required
                {...form.getInputProps("lastName")}
                disabled={readOnly}
              />
            </Grid.Col>
          </Grid>
          <Grid gutter="xs" mt="xs">
            <Grid.Col span={3}>
              <TextInput
                label="Alias"
                placeholder="Enter alias"
                size="md"
                {...form.getInputProps("alias")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label="Gender"
                placeholder="Select Gender"
                size="md"
                data={genderOptions}
                {...form.getInputProps("genderId")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label="Marital Status"
                placeholder="Select Marital Status"
                size="md"
                data={maritalStatusOptions}
                {...form.getInputProps("maritalStatusId")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                withAsterisk
                label="Date of Birth"
                placeholder="Select Date of Birth"
                size="md"
                required
                type="date"
                {...form.getInputProps("birthDate")}
                max={new Date().toISOString().split('T')[0]}
                onChange={(event) => handleBirthDateChange(event.target.value)}
                disabled={readOnly}
              />
            </Grid.Col>
          </Grid>
          <Grid gutter="xs" mt="xs">
            <Grid.Col span={3}>
              <TextInput
                withAsterisk
                label="Email"
                placeholder="example@gmail.com"
                size="md"
                required
                {...form.getInputProps("email")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                withAsterisk
                label="Mobile Number"
                placeholder="+923331234567"
                size="md"
                required
                maxLength={15}
                {...form.getInputProps("mobileNo")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                withAsterisk
                label="Phone Number"
                placeholder="+92511234567"
                size="md"
                required
                maxLength={15}
                {...form.getInputProps("phoneNo")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label="Ethnicity"
                placeholder="Select Ethnicity"
                size="md"
                data={ethnicityOptions}
                {...form.getInputProps("ethnicityId")}
                disabled={readOnly}
              />
            </Grid.Col>
          </Grid>
          <Grid gutter="xs" mt="xs">
            <Grid.Col span={3}>
              <Select
                label="Nationality"
                placeholder="Select Nationality"
                size="md"
                data={nationalityOptions}
                {...form.getInputProps("nationalityID")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="Passport Number"
                placeholder="923331234567"
                size="md"
                {...form.getInputProps("passportNo")}
                maxLength={15}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="Identity Number"
                placeholder="1234567890"
                size="md"
                {...form.getInputProps("identityNo")}
                maxLength={15}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                withAsterisk
                label="Date of Joining"
                placeholder="Select Date of Joining"
                size="md"
                required
                type="date"
                {...form.getInputProps("joiningDate")}
                max={new Date().toISOString().split('T')[0]}
                disabled={readOnly}
              />
            </Grid.Col>
          </Grid>
          <Grid gutter="xs" mt="xs">
            <Grid.Col span={12}>
              <TextInput
                label="Notes"
                placeholder="Enter notes here"
                size="md"
                {...form.getInputProps("notes")}
                disabled={readOnly}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p="md" withBorder radius="md" mt="sm">
          <h3>Address Details</h3>
          <Grid gutter="xs" mt="md">
            <Grid.Col span={4}>
              <TextInput
                label="Address Line 1"
                placeholder="Enter address line 1 (max 100 characters)"
                maxLength={100}
                {...form.getInputProps("addressLine1")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Address Line 2"
                placeholder="Enter address line 2 (max 100 characters)"
                maxLength={100}
                {...form.getInputProps("addressLine2")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Address Line 3"
                placeholder="Enter address line 3 (max 100 characters)"
                maxLength={100}
                {...form.getInputProps("addressLine3")}
                disabled={readOnly}
              />
            </Grid.Col>
          </Grid>
          <Grid gutter="xs" mt="xs">
            <Grid.Col span={4}>
              <Select
                label="County"
                data={contactCountyOptions}
                {...form.getInputProps("countyId")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="State"
                data={contactStateOptions}
                {...form.getInputProps("stateId")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="Country"
                data={contactCountryOptions}
                {...form.getInputProps("countryId")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Latitude"
                precision={6}
                step={0.000001}
                {...form.getInputProps("latitude")}
                disabled={readOnly}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Longitude"
                precision={6}
                step={0.000001}
                {...form.getInputProps("longitude")}
                disabled={readOnly}
              />
            </Grid.Col>
          </Grid>
        </Paper>
      </form>

      <AppConfirmationModal
        isLoading={isLoading}
        opened={isConfirmationModalOpen}
        onClose={(confirmed) => {
          if (confirmed) {
            handleDelete();
          } else {
            setIsConfirmationModalOpen(false);
          }
        }}
        title="Confirm"
      >
        Are you sure you want to {userStatusAction === UserStatusAction.Remove ? "purge" : (userStatusAction === "Active" ? "activate" : "deactivate")} {form.values.firstName} {form.values.lastName}?
      </AppConfirmationModal>
    </>
  );
}
