import { Button, TextInput, Select, Radio, Group } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { lookupService, profileService } from "core/services";
import { AppTable, AppModal } from "shared/components"; // Added Button import


const schema = zod.object({
  contractType: zod.number().min(1, "Contract type is required"),
  startDate: zod.string().min(1, "Start date is required"),
  endDate: zod.string().min(1, "End date is required"),
  rate: zod.union([zod.string(), zod.number()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  }).refine((val) => val >= 0, "Rate must be a positive number"),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const ServiceProviderContractInfo = ({ userId, organizationId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [contractTypeOptions, setContractTypeOptions] = useState([]);
  const [frequenciesOptions, setFrequenciesOptions] = useState([]);



  const [contractId, setContractId] = useState(null); // Added a state to hold the contractId
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      serviceProviderUserId: "",
      frequencyId: 0,
      rate: 0,

      optionId: "",
      contractType: 0,
      startDate: "",
      endDate: "",
    },
    validateInputOnBlur: true,
  });

  const fetchLookupData = async () => {
    try {
      const frequencyResponse = await lookupService.getLookupList({
        lookupType: "Frequency", // Assuming 1 is the lookup type for frequencies
        organizationId: organizationId, // Assuming organizationId is defined and passed
      });
      setFrequenciesOptions(
        frequencyResponse.data.result.map((item) => ({ value: item.id, label: item.name }))
      );


      const contractTypeResponse = await lookupService.getLookupList({
        lookupType: "ContractType", // Assuming 1 is the lookup type for frequencies
        organizationId: organizationId, // Assuming organizationId is defined and passed
      });
      setContractTypeOptions(
        contractTypeResponse.data.result.map((item) => ({ value: item.id, label: item.name }))
      );

    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch lookup data",
        color: "red",
      });
    }
  };



  useEffect(() => {
    if (frequenciesOptions.length === 0) {
      fetchLookupData();
    }



  }, [frequenciesOptions.length, organizationId]);

  const fetchContractInfo = async () => {
    if (userId) {
      setIsFetching(true);
      profileService
        .getContractInfo(userId)
        .then((response) => {
          const { data } = response;
          
          // Convert ISO date format to YYYY-MM-DD for date inputs
          const formatDateForInput = (isoDate) => {
            if (!isoDate) return "";
            const date = new Date(isoDate);
            return date.toISOString().split('T')[0];
          };
          
          form.setValues({
            serviceProviderUserId: data.serviceProviderUserId || "",
            frequencyId: data.frequencyId || 0,
            rate: data.rate || 0,

            optionId: data.optionId.toString() || "1", // Convert optionId to string to match the form's optionId type
            contractType: data.contractType || 0,
            startDate: formatDateForInput(data.startDate),
            endDate: formatDateForInput(data.endDate),
          });
          setContractId(data.id); // Save the contractId to the state
        })
        .catch((error) => {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Error",
            message: "Failed to fetch contract info",
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
        })
        .finally(() => setIsFetching(false));
    }
  };

  useEffect(() => {
    fetchContractInfo();
  }, [userId]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    let contractInfoObj = {
      serviceProviderUserId: userId,
      frequencyId: values.frequencyId,
      rate: parseFloat(values.rate) || 0, // Convert string to number

      //optionId: values.optionId,
      optionId: 1, // Basic 
      contractType: values.contractType,
      startDate: values.startDate,
      endDate: values.endDate,
      id: contractId, // Use the contractId from the state
    };

    try {
      let result = await profileService.upsertContractInfo(contractInfoObj);
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

      fetchContractInfo();
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
        handleSubmit({ ...values })
      )}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div style={{ maxWidth: "400px" }}>

          <Select
            label="Contract Type"
            placeholder="Select Contract Type"
            {...form.getInputProps("contractType")}
            data={contractTypeOptions}
            required
          />
          <TextInput
            type="date"
            label="Start Date"
            placeholder="Enter Start Date"
            {...form.getInputProps("startDate")}
            required
          />
          <TextInput
            type="date"
            label="End Date"
            placeholder="Enter End Date"
            {...form.getInputProps("endDate")}
            required
          />

          <TextInput
            label="Rate Per Hour"
            placeholder="Enter Rate per hour"
            {...form.getInputProps("rate")}
            rightSection="$"
            type="number"
            step="0.01"
            min="0"
            required
          />



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
        </div>
      </div>
    </form>
  );
};
