import { Button, TextInput, Select, NumberInput, Grid } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { contactService, lookupService } from "core/services";

const schema = zod.object({
  firstName: zod.string().nonempty("First Name is required"),
  lastName: zod.string().nonempty("Last Name is required"),
  alias: zod.string(),
  phoneNo: zod.string(),
  mobileNo: zod.string().nonempty("Mobile Number is required"),
  email: zod.string().email("Email is required"),
  passportNo: zod.string(),
  identityNo: zod.string(),
  birthDate: zod.string().nonempty("Birth Date is required"),
  contactTypeId: zod.number().positive("Contact Type is required"),
  addressLine1: zod.string(),
  addressLine2: zod.string(),
  addressLine3: zod.string(),
  countyId: zod.number().optional(),
  stateId: zod.number().optional(),
  countryId: zod.number().optional(),
  latitude: zod.number().optional(),
  longitude: zod.number().optional(),
});

export const AddUpdateUserContact = ({
  id,
  userId,
  onModalClose,
  organizationId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [contactTypeOptions, setContactTypeOptions] = useState([]);
  const [contactGenderOptions, setContactGenderOptions] = useState([]);
  const [contactTitleOptions, setContactTitleOptions] = useState([]);
  const [contactCountyOptions, setContactCountyOptions] = useState([]);
  const [contactStateOptions, setContactStateOptions] = useState([]);
  const [contactCountryOptions, setContactCountryOptions] = useState([]);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      firstName: "",
      surName: "",
      lastName: "",
      alias: "",
      phoneNo: "",
      mobileNo: "",
      email: "",
      passportNo: "",
      identityNo: "",
      birthDate: "",
      titleId: 0,
      genderId: 0,
      contactTypeId: 0,
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      countyId: 0,
      stateId: 0,
      countryId: 0,
      latitude: 0.000,
      longitude: 0.000,
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      contactService
        .getContactItem(id)
        .then((response) => {
          const { data } = response;
          form.setValues({
            firstName: data.firstName || "",
            surName: data.surName || "",
            lastName: data.lastName || "",
            alias: data.alias || "",
            phoneNo: data.phoneNo || "",
            mobileNo: data.mobileNo || "",
            email: data.email || "",
            passportNo: data.passportNo || "",
            identityNo: data.identityNo || "",
            birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
            titleId: data.titleId || 0,
            genderId: data.genderId || 0,
            contactTypeId: data.contactTypeId || 0,
            addressLine1: data.addressLine1 || "",
            addressLine2: data.addressLine2 || "",
            addressLine3: data.addressLine3 || "",
            countyId: data.countyId || 0,
            stateId: data.stateId || 0,
            countryId: data.countryId || 0,
            latitude: data.latitude || 0.000,
            longitude: data.longitude || 0.000,
          });
        })
        .catch((error) => {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Error",
            message: "Failed to fetch Contact item",
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
        })
        .finally(() => setIsFetching(false));
    }
  }, [id]);

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const contactTypeResponse = await lookupService.getLookupList({
          lookupType: "ContactType",
          organizationId,
        });
        setContactTypeOptions(
          contactTypeResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const genderResponse = await lookupService.getLookupList({
          lookupType: "Gender",
          organizationId,
        });
        setContactGenderOptions(
          genderResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const titleResponse = await lookupService.getLookupList({
          lookupType: "Title",
          organizationId,
        });
        setContactTitleOptions(
          titleResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const countyResponse = await lookupService.getLookupList({
          lookupType: "County",
          organizationId,
        });
        setContactCountyOptions(
          countyResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const stateResponse = await lookupService.getLookupList({
          lookupType: "State",
          organizationId,
        });
        setContactStateOptions(
          stateResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const countryResponse = await lookupService.getLookupList({
          lookupType: "Country",
          organizationId,
        });
        setContactCountryOptions(
          countryResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch lookup data",
          color: "red",
        });
      }
    };

    if (
      contactTypeOptions.length === 0 &&
      contactGenderOptions.length === 0 &&
      contactTitleOptions.length === 0 &&
      contactCountyOptions.length === 0 &&
      contactStateOptions.length === 0 &&
      contactCountryOptions.length === 0
    ) {
      fetchLookupData();
    }
  }, [
    contactTypeOptions.length,
    contactGenderOptions.length,
    contactTitleOptions.length,
    contactCountyOptions.length,
    contactStateOptions.length,
    contactCountryOptions.length,
    organizationId,
  ]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    let userContactObj = {
      id: id,
      userId: userId,
      firstName: values.firstName,
      surName: values.surName,
      lastName: values.lastName,
      alias: values.alias,
      phoneNo: values.phoneNo,
      mobileNo: values.mobileNo,
      email: values.email,
      passportNo: values.passportNo,
      identityNo: values.identityNo,
      birthDate: values.birthDate,
      titleId: values.titleId,
      genderId: values.genderId,
      contactTypeId: values.contactTypeId,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      addressLine3: values.addressLine3,
      countyId: values.countyId,
      stateId: values.stateId,
      countryId: values.countryId,
      latitude: values.latitude,
      longitude: values.longitude,
    };

    try {
      let result = await contactService.saveUpdateContact(userContactObj);
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Success",
        message: result.message,
        color: "green",
        style: {
          backgroundColor: "white",
        },
      });

      onModalClose();
    } catch (error) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Error",
        message: "Please try again",
        color: "red",
        style: {
          backgroundColor: "white",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div>Loading...</div>;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Grid>
        <Grid.Col span={4}>
          <Select
            label="Contact Type"
            required
            data={contactTypeOptions}
            {...form.getInputProps("contactTypeId")}
            tabIndex={1}
          />
          <TextInput
            label="Surname"
            {...form.getInputProps("surName")}
            tabIndex={2}
          />
          <TextInput 
            label="Phone Number" 
            {...form.getInputProps("phoneNo")} 
            tabIndex={3}
          />
          <Select
            label="Gender"
            data={contactGenderOptions}
            {...form.getInputProps("genderId")}
            tabIndex={4}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="Title"
            data={contactTitleOptions}
            {...form.getInputProps("titleId")}
            tabIndex={5}
          />
          <TextInput
            label="Last Name"
            required
            {...form.getInputProps("lastName")}
            tabIndex={6}
          />
          <TextInput
            label="Mobile Number"
            required
            {...form.getInputProps("mobileNo")}
            tabIndex={7}
          />
          <TextInput
            label="Birth Date"
            type="date"
            required
            {...form.getInputProps("birthDate")}
            tabIndex={8}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="First Name"
            required
            {...form.getInputProps("firstName")}
            tabIndex={9}
          />
          <TextInput 
            label="Alias" 
            {...form.getInputProps("alias")} 
            tabIndex={10}
          />
          <TextInput 
            label="Email" 
            required 
            {...form.getInputProps("email")} 
            tabIndex={11}
          />
          <TextInput
            label="Identity Number"
            {...form.getInputProps("identityNo")}
            tabIndex={12}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={12}>
          <TextInput
            label="Address Line 1"
            required
            {...form.getInputProps("addressLine1")}
            tabIndex={13}
          />
          <TextInput
            label="Address Line 2"
            {...form.getInputProps("addressLine2")}
            tabIndex={14}
          />
          <TextInput
            label="Address Line 3"
            {...form.getInputProps("addressLine3")}
            tabIndex={15}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={4}>
          <Select
            label="County"
            required
            data={contactCountyOptions}
            {...form.getInputProps("countyId")}
            tabIndex={16}
          />
          <NumberInput
            label="Latitude"
            precision={6}
            step={0.000001}
            defaultValue={0.000}
            {...form.getInputProps("latitude")}
            tabIndex={17}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="State"
            required
            data={contactStateOptions}
            {...form.getInputProps("stateId")}
            tabIndex={18}
          />
          <NumberInput
            label="Longitude"
            precision={6}
            step={0.000001}
            defaultValue={0.000}
            {...form.getInputProps("longitude")}
            tabIndex={19}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="Country"
            required
            data={contactCountryOptions}
            {...form.getInputProps("countryId")}
            tabIndex={20}
          />
        </Grid.Col>
      </Grid>
      <Button
        type="submit"
        fullWidth
        mt="xl"
        size="md"
        loading={isLoading}
        loaderPosition="right"
        tabIndex={21}
      >
        Save
      </Button>
    </form>
  );
};
