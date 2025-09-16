import { Button, TextInput, Select, NumberInput, Grid } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { addressService, lookupService, profileService } from "core/services";

const schema = zod.object({
  addressLine1: zod.string().nonempty("Address Line 1 is not valid").max(100, "Address Line 1 must be 100 characters or less"),
  addressLine2: zod.string().max(100, "Address Line 2 must be 100 characters or less"),
  addressLine3: zod.string().max(100, "Address Line 3 must be 100 characters or less"),
  addressTypeId: zod.number().positive("Please select the address type"),
});

export const AddUpdateUserAddress = ({
  id,
  userId,
  onModalClose,
  organizationId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [countyOptions, setCountyOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [addressTypeOptions, setAddressTypeOptions] = useState([]);
  const [existingAddresses, setExistingAddresses] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      addressTypeId: 0,
      latitude: 0,
      longitude: 0,
    },
    validateInputOnBlur: true,
  });

  // Fetch existing addresses to check for Primary Address
  useEffect(() => {
    const fetchExistingAddresses = async () => {
      if (!id) { // Only fetch for new addresses
        try {
          const request = {
            userId: userId,
            sortColumn: "id",
            sortType: "desc",
            pageNumber: 1,
            pageSize: 100,
          };
          const { data } = await profileService.getAddressList(request);
          setExistingAddresses(data.response || []);
        } catch (error) {
          console.error("Failed to fetch existing addresses:", error);
        }
      }
    };

    fetchExistingAddresses();
  }, [userId, id]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setIsFetching(true);
      addressService
        .getAddressItem(id)
        .then((response) => {
          const { data } = response;
          form.setValues({
            addressLine1: data.addressLine1 || "",
            addressLine2: data.addressLine2 || "",
            addressLine3: data.addressLine3 || "",
            addressTypeId: data.addressTypeId,
            countyId: data.countyId,
            stateId: data.stateId,
            countryId: data.countryId,
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
          });
        })
        .catch((error) => {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Error",
            message: "Failed to fetch Address item",
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
        const addressTypeResponse = await lookupService.getLookupList({
          lookupType: "AddressType",
          organizationId,
        });
        
        let addressTypes = addressTypeResponse.data.result.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        // Filter out Primary Address type if it already exists (only for new addresses)
        if (!id && existingAddresses.length > 0) {
          const hasPrimaryAddress = existingAddresses.some(addr => 
            addr.addressType && addr.addressType.toLowerCase().includes('primary')
          );
          if (hasPrimaryAddress) {
            addressTypes = addressTypes.filter(type => 
              !type.label.toLowerCase().includes('primary')
            );
          }
        }

        setAddressTypeOptions(addressTypes);

        const countryResponse = await lookupService.getLookupList({
          lookupType: "Country",
          organizationId,
        });
        setCountryOptions(
          countryResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const countyResponse = await lookupService.getLookupList({
          lookupType: "County",
          organizationId,
        });
        setCountyOptions(
          countyResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const stateResponse = await lookupService.getLookupList({
          lookupType: "State",
          organizationId,
        });
        setStateOptions(
          stateResponse.data.result.map((item) => ({
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
      addressTypeOptions.length === 0 &&
      countryOptions.length === 0 &&
      countyOptions.length === 0 &&
      stateOptions.length === 0
    ) {
      fetchLookupData();
    }
  }, [
    addressTypeOptions.length,
    countryOptions.length,
    countyOptions.length,
    stateOptions.length,
    organizationId,
    existingAddresses,
    id,
  ]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    let userAddressObj = {
      id: id,
      userId: userId,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      addressLine3: values.addressLine3,
      addressTypeId: values.addressTypeId,
      countyId: values.countyId,
      stateId: values.stateId,
      countryId: values.countryId,
      latitude: values.latitude,
      longitude: values.longitude,
    };

    try {
      let result = await addressService.saveUpdateAddress(userAddressObj);
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

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        handleSubmit({
          ...values,
          addressTypeId: values.addressTypeId,
          countyId: values.countyId,
          stateId: values.stateId,
          countryId: values.countryId,
        })
      )}
    >
      <Grid>
        <Grid.Col span={12}>
          <Select
            label="Address Type"
            placeholder="Select Address Type"
            required
            disabled={isEditMode} // Disable address type selection in edit mode
            {...form.getInputProps("addressTypeId")}
            data={addressTypeOptions}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Address Line 1"
            placeholder="Enter Address Line 1 (max 100 characters)"
            required
            maxLength={100}
            {...form.getInputProps("addressLine1")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Address Line 2"
            placeholder="Enter Address Line 2 (max 100 characters)"
            maxLength={100}
            {...form.getInputProps("addressLine2")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Address Line 3"
            placeholder="Enter Address Line 3 (max 100 characters)"
            maxLength={100}
            {...form.getInputProps("addressLine3")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="County"
            placeholder="Select County"
            {...form.getInputProps("countyId")}
            data={countyOptions}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="State"
            placeholder="Select State"
            {...form.getInputProps("stateId")}
            data={stateOptions}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="Country"
            placeholder="Select Country"
            {...form.getInputProps("countryId")}
            data={countryOptions}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="Latitude"
            precision={3}
            step={0.001}
            defaultValue={0.000}
            {...form.getInputProps("latitude")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label="Longitude"
            precision={3}
            step={0.001}
            defaultValue={0.000}
            {...form.getInputProps("longitude")}
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
      >
        Save
      </Button>
    </form>
  );
};
