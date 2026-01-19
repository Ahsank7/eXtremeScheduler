import { Button, TextInput, Textarea, NumberInput, Select, Grid } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { organizationService, localStoreService, lookupService, packageService } from "core/services";

const schema = zod.object({
  Name: zod.string().nonempty("Name is required"),
  Description: zod.string().optional(),
  CompleteAddress: zod.string().optional(),
  ContactNo: zod.string().optional(),
  Email: zod.string().email("Invalid email address").optional().or(zod.literal("")),
  WebSite: zod.string().optional(),
  DefaultBillingRate: zod.number().min(0, "Must be 0 or greater").optional(),
  DefaultWageRate: zod.number().min(0, "Must be 0 or greater").optional(),
  TimeZone: zod.string().optional(),
});

const AddOrganization = ({ onModalClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [currencySignOptions, setCurrencySignOptions] = useState([]);
  const [timezoneOptions, setTimezoneOptions] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      Name: "",
      Description: "",
      CompleteAddress: "",
      ContactNo: "",
      Email: "",
      WebSite: "",
      DefaultBillingRate: 0,
      DefaultWageRate: 0,
      CurrencyId: null,
      CurrencySignId: null,
      CalculationTypeId: 1,
      TaxPercentage: 0.0,
      DiscountPercentage: 0.0,
      ServiceRateForBilling: 1,
      TimeZone: "Pakistan Standard Time",
      IsActive: true,
      PackageId: null,
    },
    validateInputOnBlur: true,
  });

  // Load lookup data for new organization (using a default or system organization ID)
  // Note: For new organizations, we might need to use a system/default organization ID
  // or handle this differently based on your API structure
  useEffect(() => {
    // You may need to adjust this based on your API
    // For now, we'll set default options
    setCurrencyOptions([
      { value: 1, label: "USD" },
      { value: 2, label: "PKR" },
    ]);
    setCurrencySignOptions([
      { value: 1, label: "$" },
      { value: 2, label: "₨" },
    ]);
    setTimezoneOptions([
      { value: "Pakistan Standard Time", label: "Pakistan Standard Time" },
      { value: "UTC", label: "UTC" },
    ]);

    // Load packages
    const loadPackages = async () => {
      try {
        const response = await packageService.getAllPackages(false);
        // Response structure: { data: [...], count: number }
        let packages = [];
        if (response?.data && Array.isArray(response.data)) {
          packages = response.data;
        } else if (Array.isArray(response)) {
          packages = response;
        } else if (response?.Item1 && Array.isArray(response.Item1)) {
          packages = response.Item1;
        }
        
        setPackageOptions(
          (Array.isArray(packages) ? packages : []).map((pkg) => ({
            value: pkg.id,
            label: pkg.name,
          }))
        );
      } catch (error) {
        console.error("Error loading packages:", error);
      }
    };
    loadPackages();
  }, []);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const orgObj = {
        Id: null, // New organization
        Name: values.Name,
        Description: values.Description || "",
        IsActive: values.IsActive !== undefined ? values.IsActive : true,
        DefaultBillingRate: values.DefaultBillingRate || 0,
        DefaultWageRate: values.DefaultWageRate || 0,
        CompleteAddress: values.CompleteAddress || "",
        ContactNo: values.ContactNo || "",
        Email: values.Email || "",
        WebSite: values.WebSite || "",
        CurrencyId: values.CurrencyId || 0,
        CurrencySignId: values.CurrencySignId || null,
        CalculationTypeId: values.CalculationTypeId || 1,
        TaxPercentage: values.TaxPercentage || 0.0,
        DiscountPercentage: values.DiscountPercentage || 0.0,
        ServiceRateForBilling: values.ServiceRateForBilling || 1,
        TimeZone: values.TimeZone || "Pakistan Standard Time",
      };

      const result = await organizationService.saveUpdateOrganization(orgObj);
      
      // Extract organization ID from response
      // The API returns Response<Guid?>, so result.data should be the Guid
      const organizationId = result?.data || result;
      
      // If package is selected, assign it to the organization
      if (values.PackageId && organizationId) {
        try {
          await packageService.assignPackageToOrganization({
            organizationId: organizationId,
            packageId: values.PackageId,
            startDate: new Date().toISOString(),
            notes: "Initial package assignment",
          });
        } catch (packageError) {
          console.error("Error assigning package:", packageError);
          notifications.show({
            title: "Warning",
            message: "Organization created but package assignment failed",
            color: "yellow",
          });
        }
      }

      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Success",
        message: result.message || "Organization created successfully",
        color: "green",
      });

      onModalClose();
    } catch (error) {
      console.error("Error creating organization:", error);
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Error",
        message: error.message || "Failed to create organization. Please try again.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Grid gutter="md">
        <Grid.Col span={12}>
          <TextInput
            withAsterisk
            label="Organization Name"
            placeholder="Enter organization name"
            size="md"
            {...form.getInputProps("Name")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Description"
            placeholder="Enter organization description"
            size="md"
            minRows={3}
            {...form.getInputProps("Description")}
          />
        </Grid.Col>

        <Grid.Col span={12} md={6}>
          <TextInput
            label="Email"
            placeholder="Enter email address"
            size="md"
            {...form.getInputProps("Email")}
          />
        </Grid.Col>

        <Grid.Col span={12} md={6}>
          <TextInput
            label="Contact Number"
            placeholder="Enter contact number"
            size="md"
            {...form.getInputProps("ContactNo")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Website"
            placeholder="Enter website URL"
            size="md"
            {...form.getInputProps("WebSite")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Complete Address"
            placeholder="Enter complete address"
            size="md"
            minRows={2}
            {...form.getInputProps("CompleteAddress")}
          />
        </Grid.Col>

        <Grid.Col span={12} md={6}>
          <NumberInput
            label="Default Billing Rate (Per Hour)"
            placeholder="Enter default billing rate per hour"
            size="md"
            min={0}
            {...form.getInputProps("DefaultBillingRate")}
          />
        </Grid.Col>

        <Grid.Col span={12} md={6}>
          <NumberInput
            label="Default Wage Rate (Per Hour)"
            placeholder="Enter default wage rate per hour"
            size="md"
            min={0}
            {...form.getInputProps("DefaultWageRate")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Select
            label="Time Zone"
            placeholder="Select timezone"
            data={timezoneOptions}
            searchable
            {...form.getInputProps("TimeZone")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Select
            label="Package"
            placeholder="Select a package (optional)"
            data={packageOptions}
            searchable
            clearable
            {...form.getInputProps("PackageId")}
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
        Create Organization
      </Button>
    </form>
  );
};

export default AddOrganization;

