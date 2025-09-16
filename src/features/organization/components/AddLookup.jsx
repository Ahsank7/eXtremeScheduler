import { Button, TextInput, Textarea, Loader } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { lookupService, localStoreService } from "core/services";

const schema = zod.object({
    name: zod.string().nonempty("Name is not valid"),
    description: zod.string().nonempty("Description is required"),
    Otherfieldname1: zod.string().optional(),
    Otherfieldvalue1: zod.string().optional(),
    Otherfieldname2: zod.string().optional(),
    Otherfieldvalue2: zod.string().optional(),
});

const AddLookup = ({ organizationId, lookupId, id, onModalClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const form = useForm({
        validate: zodResolver(schema),
        initialValues: {
            name: "",
            description: "",
            Otherfieldname1: "",
            Otherfieldvalue1: "",
            Otherfieldname2: "",
            Otherfieldvalue2: "",
        },
        validateInputOnBlur: true,
    });

    useEffect(() => {
        if (id) {
            setIsFetching(true);
            lookupService.getLookupItem(id)
                .then((response) => {
                    const { data } = response;
                    form.setValues({
                        name: data.name,
                        description: data.description,
                        Otherfieldname1: data.Otherfieldname1 || "",
                        Otherfieldvalue1: data.Otherfieldvalue1 || "",
                        Otherfieldname2: data.Otherfieldname2 || "",
                        Otherfieldvalue2: data.Otherfieldvalue2 || "",
                    });
                })
                .catch((error) => {
                    notifications.show({
                        withCloseButton: true,
                        autoClose: 5000,
                        title: "Error",
                        message: "Failed to fetch lookup item",
                        color: "red",
                        style: {
                            backgroundColor: "white",
                        },
                    });
                })
                .finally(() => setIsFetching(false));
        }
    }, [id]);

    const handleSubmit = async (values) => {
        setIsLoading(true);
        let lookupObj = {
            id: id,
            lookupType: lookupId,
            name: values.name,
            description: values.description,
            //organizationId: organizationId,
            Otherfieldname1: values.Otherfieldname1,
            Otherfieldvalue1: values.Otherfieldvalue1,
            Otherfieldname2: values.Otherfieldname2,
            Otherfieldvalue2: values.Otherfieldvalue2,
            userId: localStoreService.getUserID(),
        };

        try {
            let result = await lookupService.saveUpdateLookupItem(lookupObj);
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

    if (isFetching) {
        return <Loader />;
    }

    return (
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <TextInput
                withAsterisk
                label="Name"
                placeholder="Name"
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

            <TextInput
                label="Other Field Name 1"
                placeholder="Other Field Name 1"
                mt="md"
                size="md"
                {...form.getInputProps("Otherfieldname1")}
            />

            <TextInput
                label="Other Field Value 1"
                placeholder="Other Field Value 1"
                mt="md"
                size="md"
                {...form.getInputProps("Otherfieldvalue1")}
            />

            <TextInput
                label="Other Field Name 2"
                placeholder="Other Field Name 2"
                mt="md"
                size="md"
                {...form.getInputProps("Otherfieldname2")}
            />

            <TextInput
                label="Other Field Value 2"
                placeholder="Other Field Value 2"
                mt="md"
                size="md"
                {...form.getInputProps("Otherfieldvalue2")}
            />

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

export default AddLookup;

