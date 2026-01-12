import { Button, TextInput, Textarea, Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { franchiseService, localStoreService } from "core/services";

const schema = zod.object({
  name: zod.string().nonempty("Name is required"),
  description: zod.string().nonempty("Description is required"),
});

const AddFranchiseToOrg = ({ organizationId, organizationName, onModalClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      name: "",
      description: "",
    },
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      // Step 1: Create the franchise
      const franchiseObj = {
        id: null,
        name: values.name,
        description: values.description,
        organizationId: organizationId,
        logo: "",
        userId: localStoreService.getUserID(),
      };

      const result = await franchiseService.saveUpdateFranchiseList(franchiseObj);
      
      // Step 2: Get the created franchise ID from the response
      // The API returns the Guid in different possible structures
      let franchiseId = null;
      if (result) {
        // Try different response structures
        if (result.data && result.data.id) {
          franchiseId = result.data.id;
        } else if (result.data && typeof result.data === 'string') {
          // Sometimes the API returns just the GUID as a string
          franchiseId = result.data;
        } else if (result.id) {
          franchiseId = result.id;
        } else if (result.data) {
          franchiseId = result.data;
        } else if (typeof result === 'string') {
          franchiseId = result;
        }
      }
      
      // If we still don't have the ID, try to fetch the franchise list to find it
      if (!franchiseId) {
        try {
          const franchises = await franchiseService.getFranchiseList(organizationId, localStoreService.getUserID());
          if (franchises && Array.isArray(franchises)) {
            const newFranchise = franchises.find(f => f.name === values.name);
            if (newFranchise) {
              franchiseId = newFranchise.id;
            }
          }
        } catch (fetchError) {
          console.error("Error fetching franchises to get ID:", fetchError);
        }
      }

      // Step 3: Create admin user for this franchise using the new endpoint
      if (franchiseId) {
        try {
          // Generate username and password based on franchise name
          // Username: franchise name + "admin" (e.g., "kfcadmin")
          // Password: franchise name + "admin1234" (e.g., "kfcadmin1234")
          const sanitizedFranchiseName = values.name.replace(/\s+/g, '').toLowerCase();
          const defaultUsername = `${sanitizedFranchiseName}admin`;
          const defaultPassword = `${sanitizedFranchiseName}admin1234`;
          
          // Call the new endpoint to create admin user
          const adminUserRequest = {
            franchiseId: franchiseId,
            franchiseName: values.name,
            organizationName: organizationName,
            organizationId: organizationId,
          };

          const userResponse = await franchiseService.createFranchiseAdminUser(adminUserRequest);
          
          // Get the created user ID from response
          let createdUserId = null;
          if (userResponse) {
            if (userResponse.data) {
              if (typeof userResponse.data === 'string') {
                createdUserId = userResponse.data;
              } else if (userResponse.data.id) {
                createdUserId = userResponse.data.id;
              } else {
                createdUserId = userResponse.data;
              }
            } else if (userResponse.id) {
              createdUserId = userResponse.id;
            } else if (typeof userResponse === 'string') {
              createdUserId = userResponse;
            }
          }
          
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Success",
            message: `Franchise and admin user created successfully. Username: ${defaultUsername}, Password: ${defaultPassword}`,
            color: "green",
          });
        } catch (userError) {
          console.error("Error creating admin user:", userError);
          // Still show success for franchise creation, but warn about user
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Partial Success",
            message: "Franchise created successfully, but failed to create admin user. Please create a user manually.",
            color: "yellow",
          });
        }
      } else {
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "Success",
          message: result.message || "Franchise created successfully",
          color: "green",
        });
      }

      onModalClose();
    } catch (error) {
      console.error("Error creating franchise:", error);
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Error",
        message: error.message || "Failed to create franchise. Please try again.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Text size="sm" color="dimmed" mb="md">
        Adding franchise to: <strong>{organizationName}</strong>
      </Text>

      <TextInput
        withAsterisk
        label="Franchise Name"
        placeholder="Enter franchise name"
        mt="md"
        size="md"
        {...form.getInputProps("name")}
      />

      <Textarea
        withAsterisk
        label="Description"
        placeholder="Enter franchise description"
        mt="md"
        size="md"
        minRows={3}
        {...form.getInputProps("description")}
      />

      <Button
        type="submit"
        fullWidth
        mt="xl"
        size="md"
        loading={isLoading}
        loaderPosition="right"
      >
        Create Franchise
      </Button>
    </form>
  );
};

export default AddFranchiseToOrg;

