import { Button, TextInput, Textarea } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { franchiseService, localStoreService } from "core/services";

const schema = zod.object({
  name: zod.string().nonempty("Name is not valid"),
  description: zod.string().nonempty("Description is required"),
});

const AddFranchise = ({ organizationId, onModalClose }) => {
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
    let franchiseObj = {
      id: null,
      name: values.name,
      description: values.description,
      organizationId: organizationId,
      logo: "",
      userId: localStoreService.getUserID(),
    };

    try {
      let result = await franchiseService.saveUpdateFranchiseList(franchiseObj);
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
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <TextInput
        withAsterisk
        label="Name"
        placeholder="Franchise Name"
        mt="md"
        size="md"
        {...form.getInputProps("name")}
      />

      <Textarea
        withAsterisk
        label="Description"
        mt="md"
        size="md"
        {...form.getInputProps("description")}
      ></Textarea>

      <Button
        type="submit"
        fullWidth
        mt="xl"
        size="md"
        loading={isLoading}
        loaderPosition="right"
      >
        Submit
      </Button>
    </form>
  );
};

export default AddFranchise;
