import { Button, TextInput, Textarea, NumberInput, Switch, Select, Grid, Paper, Group, Divider, Title, Flex, Avatar, FileInput, Text, Stack, Tooltip, Modal } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useEffect, useState } from "react";
import { z as zod } from "zod";
import { organizationService, lookupService, documentService } from "core/services";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconUpload, IconEye } from "@tabler/icons";
import imageUrlService from "../../../core/services/imageUrlService";

const schema = zod.object({
  Id: zod.string(),
  Name: zod.string().optional(),
  Description: zod.string().optional(),
  IsActive: zod.boolean(),
  DefaultBillingRate: zod.number(),
  DefaultWageRate: zod.number(),
  CompleteAddress: zod.string().optional(),
  ContactNo: zod.string().optional(),
  Email: zod.string().optional(),
  WebSite: zod.string().optional(),
  CurrencyId: zod.number(),
  CurrencySignId: zod.number().optional(),
  CalculationTypeId: zod.number(),
  TaxPercentage: zod.number(),
  DiscountPercentage: zod.number(),
  UseServiceRateForBilling: zod.boolean(),
  TimeZone: zod.string().optional(),
});

const BasicSetting = ({ organization }) => {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [calculationTypeOptions, setCalculationTypeOptions] = useState([
    { value: 1, label: "Scheduled" },
    { value: 2, label: "Actual" },
  ]);
  const [currencySignOptions, setCurrencySignOptions] = useState([]);
  const [timezoneOptions, setTimezoneOptions] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const form = useForm({
    schema: zodResolver(schema),
    initialValues: {
      Id: '',
      Name: '',
      Description: '',
      IsActive: false,
      DefaultBillingRate: 0,
      DefaultWageRate: 0,
      CompleteAddress: '',
      ContactNo: '',
      Email: '',
      WebSite: '',
      CurrencyId: 0,
      CurrencySignId: null,
      CalculationTypeId: 1,
      TaxPercentage: 0.0,
      DiscountPercentage: 0.0,
      UseServiceRateForBilling: false,
      TimeZone: 'Pakistan Standard Time',
    },
  });

  useEffect(() => {
    if (organization?.id) {
      // Map API response to form field names
      const mappedData = {
        Id: organization.id,
        Name: organization.name,
        Description: organization.description,
        IsActive: organization.isActive,
        DefaultBillingRate: organization.defaultBillingRate,
        DefaultWageRate: organization.defaultWageRate,
        CompleteAddress: organization.completeAddress,
        ContactNo: organization.contactNo,
        Email: organization.email,
        WebSite: organization.webSite,
        CurrencyId: organization.currencyId,
        CurrencySignId: organization.currencySignId,
        CalculationTypeId: organization.calculationTypeId,
        TaxPercentage: organization.taxPercentage,
        DiscountPercentage: organization.discountPercentage,
        UseServiceRateForBilling: organization.useServiceRateForBilling,
        TimeZone: organization.timeZone || 'Pakistan Standard Time',
      };
      form.setValues(mappedData);
      lookupService.getLookupList({ lookupType: "Currency", organizationId: organization?.id })
        .then((response) => {
          const { data } = response;
          setCurrencyOptions(data.result.map(item => ({ value: item.id, label: item.name })));
        })
        .catch((error) => {
          notifications.show({
            title: "Error",
            message: "Failed to fetch currency data",
            color: "red",
          });
        });

      lookupService.getLookupList({ lookupType: "CurrencySign", organizationId: organization?.id })
        .then((response) => {
          const { data } = response;
          setCurrencySignOptions(data.result.map(item => ({ value: item.id, label: item.name })));
        })
        .catch((error) => {
          notifications.show({
            title: "Error",
            message: "Failed to fetch currency sign data",
            color: "red",
          });
        });

      // Load timezone options
      lookupService.getLookupList({ lookupType: "TimeZones", organizationId: organization?.id })
        .then((response) => {
          const { data } = response;
          setTimezoneOptions(data.result.map(item => ({ value: item.name, label: item.name })));
        })
        .catch((error) => {
          notifications.show({
            title: "Error",
            message: "Failed to fetch timezone data",
            color: "red",
          });
        });
      // Fetch organization logo
      setLogoLoading(true);
      documentService.getOrganizationImage(organization.id)
        .then((response) => {
          if (response && response.status === 200 && response.data) {
            setLogoUrl(response.data);
          } else {
            setLogoUrl(null);
          }
        })
        .catch(() => setLogoUrl(null))
        .finally(() => setLogoLoading(false));
    }
  }, [organization]);

  const handleSubmit = async (values) => {
    try {
      await organizationService.saveUpdateOrganization(values);
      notifications.show({
        title: "Success",
        message: "Organization details saved successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save organization details",
        color: "red",
      });
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !organization?.id) return;
    setLogoLoading(true);
    try {
      const response = await documentService.uploadOrganizationImage(organization.id, file);
      if (response && response.status === 200 && response.data && response.data.filePath) {
        setLogoUrl(response.data.filePath);
        notifications.show({ title: "Success", message: "Logo uploaded successfully", color: "green" });
      } else {
        notifications.show({ title: "Error", message: "Failed to upload logo", color: "red" });
      }
    } catch (error) {
      notifications.show({ title: "Error", message: "Failed to upload logo", color: "red" });
    } finally {
      setLogoLoading(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!organization?.id) return;
    setLogoLoading(true);
    try {
      const response = await documentService.deleteOrganizationImage(organization.id);
      if (response && (response.status === 200 || response === "Organization logo deleted successfully")) {
        setLogoUrl(null);
        notifications.show({ title: "Success", message: "Logo removed", color: "green" });
      } else {
        notifications.show({ title: "Error", message: "Failed to remove logo", color: "red" });
      }
    } catch (error) {
      notifications.show({ title: "Error", message: "Failed to remove logo", color: "red" });
    } finally {
      setLogoLoading(false);
    }
  };

  return (
    <Paper shadow="md" radius="md" p="xl" withBorder style={{ position: 'relative' }}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Flex align="flex-start" justify="space-between" mb="md">
          <Title order={3} mt={4}></Title>
          <Stack align="flex-end" spacing={12} style={{ minWidth: 120 }}>
            <Button type="submit" size="md" style={{ width: 90 }}>Save</Button>
          </Stack>
        </Flex>
        
        {/* Debug info - remove this after fixing */}
        <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', fontSize: '12px' }}>
        <Stack align="flex-end" spacing={12} style={{ minWidth: 120 }}>
              <div
                style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
              >
                <Avatar
                  src={imageUrlService.buildImageUrl(logoUrl)}
                  size={120}
                  radius={120}
                  alt="Organization Logo"
                  style={{ width: 120, height: 120, borderRadius: 120, position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "box-shadow 0.2s", cursor: "pointer" }}
                  loading={logoLoading ? 1 : 0}
                >
                  {form.values.Name?.[0] || "O"}
                </Avatar>
                <div
                  style={{
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
                    opacity: logoHovered ? 1 : 0,
                    transition: "opacity 0.2s",
                    zIndex: 2,
                  }}
                >
                  <Tooltip label="Upload" position="right" withArrow>
                    <label htmlFor="logo-upload-input" style={{ display: "flex" }}>
                      <input
                        id="logo-upload-input"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleLogoUpload}
                        disabled={logoLoading}
                      />
                      <Button
                        leftIcon={<IconUpload size={20} />}
                        component="span"
                        loading={logoLoading}
                        disabled={logoLoading}
                        style={{ margin: 0, width: 40, height: 40, minWidth: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                        variant="white"
                        color="dark"
                      />
                    </label>
                  </Tooltip>
                  {logoUrl && (
                    <>
                      <Tooltip label="View" position="right" withArrow>
                        <Button
                          leftIcon={<IconEye size={20} />}
                          style={{ margin: 0, width: 40, height: 40, minWidth: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
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
                          onClick={handleLogoRemove}
                          loading={logoLoading}
                          style={{ margin: 0, width: 40, height: 40, minWidth: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                        />
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            </Stack>
        </div>
        <Grid gutter="md" align="flex-start" mb="md">
          <Grid.Col xs={12} md={6}>
            <TextInput label="Name" {...form.getInputProps('Name')} required />
          </Grid.Col>
        </Grid>
        <Divider my="lg" label="Financial Info" labelPosition="center" />
        <Grid gutter="md">
          <Grid.Col xs={12} md={6}>
            <NumberInput label="Default Billing Rate" {...form.getInputProps('DefaultBillingRate')} mb="sm" min={0} />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <NumberInput label="Default Wage Rate" {...form.getInputProps('DefaultWageRate')} mb="sm" min={0} />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <Select
              label="Currency"
              placeholder="Select currency"
              {...form.getInputProps('CurrencyId')}
              data={currencyOptions}
              mb="sm"
            />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <Select
              label="Currency Sign"
              placeholder="Select currency sign"
              {...form.getInputProps('CurrencySignId')}
              data={currencySignOptions}
              mb="sm"
            />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <Select
              label="Calculation Type"
              placeholder="Select calculation type"
              {...form.getInputProps('CalculationTypeId')}
              data={calculationTypeOptions}
              mb="sm"
            />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <Switch 
              label="Use Service Rate for Billing" 
              description="When enabled, uses service-specific rates. When disabled or service rate is 0, uses default rate."
              {...form.getInputProps('UseServiceRateForBilling', { type: 'checkbox' })} 
              mb="sm" 
            />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <NumberInput
              label="Tax Percentage"
              precision={2}
              step={0.01}
              {...form.getInputProps('TaxPercentage')}
              mb="sm"
              min={0}
              max={100}
              rightSection="%"
            />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <NumberInput
              label="Discount Percentage"
              precision={2}
              step={0.01}
              {...form.getInputProps('DiscountPercentage')}
              mb="sm"
              min={0}
              max={100}
              rightSection="%"
            />
          </Grid.Col>
        </Grid>
        <Divider my="lg" label="Contact Info" labelPosition="center" />
        <Grid gutter="md" mt="md">
          <Grid.Col xs={12} md={6}>
            <TextInput label="Contact No" {...form.getInputProps('ContactNo')} mb="sm" />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <TextInput label="Email" {...form.getInputProps('Email')} mb="sm" />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <TextInput label="WebSite" {...form.getInputProps('WebSite')} mb="sm" />
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <Select
              label="Time Zone"
              placeholder="Select timezone"
              {...form.getInputProps('TimeZone')}
              data={timezoneOptions}
              mb="sm"
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col xs={12} md={12}>
            <TextInput label="Complete Address" {...form.getInputProps('CompleteAddress')} mb="sm" />
          </Grid.Col>
          <Grid.Col xs={12} md={12}>
            <Textarea label="Description" {...form.getInputProps('Description')} mb="sm" minRows={2} />
          </Grid.Col>
        </Grid>
      </form>
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Organization Logo"
        centered
        size="lg"
        overlayBlur={2}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <img
            src={imageUrlService.buildImageUrl(logoUrl)}
            alt="Organization Logo Large"
            style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 12 }}
          />
        </div>
      </Modal>
    </Paper>
  );
};

export default BasicSetting;
