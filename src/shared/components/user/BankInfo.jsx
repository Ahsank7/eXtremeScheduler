import { Button, TextInput, Textarea, Loader, Select, LoadingOverlay } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { accountService, lookupService } from "core/services";

const schema = zod.object({
  accountHolderName: zod.string().nonempty("Account Holder Name is required").max(50, "Account Holder Name must be 50 characters or less"),
  accountNumber: zod.string().nonempty("Account Number is required").max(50, "Account Number must be 50 characters or less"),
  branchCode: zod.string().nonempty("Branch Code is required").max(10, "Branch Code must be 10 characters or less"),
  iban: zod.string().nonempty("IBAN is required").max(50, "IBAN must be 50 characters or less"),
  bankId: zod.number({
    required_error: "Bank is required",
    invalid_type_error: "Bank is required"
  }).min(1, "Bank is required"),
  bankAccountId: zod.string(),
});

export const BankInfo = ({ userId, organizationId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [bankOptions, setBankOptions] = useState([]);
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      accountHolderName: "",
      accountNumber: "",
      bankId: null,
      branchCode: "",
      iban: "",
      bankAccountId: "", // Initialize bankAccountId in the form state
    },
    validateInputOnBlur: true,
  });

  const fetchBankData = async () => {
    try {
      const bankResponse = await lookupService.getLookupList({
        lookupType: "Banks",
        organizationId,
      });
      setBankOptions(
        (bankResponse?.result || []).map((item) => ({ value: item.id, label: item.name }))
      );
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch bank data",
        color: "red",
      });
    }
  };

  const fetchUserBankAccount = async () => {
    if (userId) {
      setIsFetching(true);
      try {
        const response = await accountService.getUserBankAccount(userId);
        console.log('Bank Info Response:', response); // Debug log
        
        form.setValues({
          accountHolderName: response?.accountHolderName || "",
          accountNumber: response?.accountNumber || "",
          bankId: response?.bankId || null,
          branchCode: response?.branchCode || "",
          iban: response?.iban || "",
          bankAccountId: response?.bankAccountId || "", // Set bankAccountId from the response
        });
      } catch (error) {
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "Error",
          message: "Failed to fetch Bank item",
          color: "red",
          style: {
            backgroundColor: "white",
          },
        });
      } finally {
        setIsFetching(false);
      }
    }
  };

  useEffect(() => {
    fetchUserBankAccount();
    if (bankOptions.length === 0) {
      fetchBankData();
    }
  }, [userId, bankOptions.length, organizationId]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    // Debug: Log the values being submitted
    console.log('Form values being submitted:', values);
    console.log('Bank ID value:', values.bankId, 'Type:', typeof values.bankId);
    
    let userBankInfoObj = {
      userId: userId,
      accountHolderName: values.accountHolderName,
      accountNumber: values.accountNumber,
      bankId: values.bankId,
      branchCode: values.branchCode,
      iban: values.iban,
      bankAccountId: values.bankAccountId, // Assuming bankAccountId is fetched and stored in the form state
    };

    try {
      let result = await accountService.upsertUserBankAccount(userBankInfoObj);
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

      fetchUserBankAccount();
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
    <>
      <LoadingOverlay visible={isFetching} />
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
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
              label="Bank"
              placeholder="Select Bank"
              {...form.getInputProps("bankId")}
              data={bankOptions}
              required
              error={form.errors.bankId}
              clearable
            />
            <TextInput
              label="Account Holder Name"
              placeholder="Enter Account Holder Name (max 50 characters)"
              required
              maxLength={50}
              {...form.getInputProps("accountHolderName")}
            />
            <TextInput
              label="Account Number"
              placeholder="Enter Account Number (max 50 characters)"
              {...form.getInputProps("accountNumber")}
              maxLength={50}
              required
            />
            <TextInput
              label="Branch Code"
              placeholder="Enter Branch Code (max 10 characters)"
              {...form.getInputProps("branchCode")}
              maxLength={10}
              required
            />
            <TextInput
              label="IBAN"
              placeholder="Enter IBAN (max 50 characters)"
              {...form.getInputProps("iban")}
              maxLength={50}
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
    </>
  );
};
