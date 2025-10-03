import {
  Button,
  TextInput,
  Textarea,
  Loader,
  Select,
  FileInput,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { documentService, lookupService } from "core/services";
import { IconAlertCircle, IconUpload } from '@tabler/icons';

const schema = zod.object({
  name: zod.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: zod.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  documentTypeId: zod.number().positive("Please select a document type"),
  documentData: zod.any().refine((file) => {
    if (!file) return false;
    return file instanceof File;
  }, "Please select a file to upload"),
  accessRoles: zod.string().optional(),
});

export const AddUpdateUserDocument = ({ id, userId, onModalClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [isLoadingDocumentTypes, setIsLoadingDocumentTypes] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      name: "",
      description: "",
      documentTypeId: "",
      documentData: null,
      accessRoles: "",
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      documentService
        .getDocumentItem(id)
        .then((response) => {
          const { data } = response.data;
          form.setValues({
            name: data.name || "",
            description: data.description || "",
            documentTypeId: data.documentTypeId || "",
            documentData: null, // Don't set file for edit mode
            accessRoles: data.accessRoles || "",
          });
        })
        .catch((error) => {
          console.error("Failed to fetch document:", error);
          notifications.show({
            title: "Error",
            message: "Failed to fetch document details",
            color: "red",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, form]);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      setIsLoadingDocumentTypes(true);
      try {
        const organizationId = "6F3E3B03-3D2F-463C-8C88-4350F6C93B08";
        const documentTypeResponse = await lookupService.getLookupList({
          lookupType: "DocumentType",
          organizationId,
        });
        
        setDocumentTypeOptions(
          (documentTypeResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch document types:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch document types",
          color: "red",
        });
      } finally {
        setIsLoadingDocumentTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("DocumentData", values.documentData);
      formData.append("DocumentTypeId", Number(values.documentTypeId));
      formData.append("UserId", userId);
      formData.append("AccessRoles", values.accessRoles || "");
      formData.append("Name", values.name);
      formData.append("Description", values.description);
      // Log FormData entries for debugging
      console.log("FormData being sent:", [...formData.entries()]);
      const result = await documentService.saveUpdateDocument(formData);
      
      notifications.show({
        title: "Success",
        message: id ? "Document updated successfully!" : "Document uploaded successfully!",
        color: "green",
      });

      onModalClose();
    } catch (error) {
      console.error("Failed to save document:", error);
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to save document. Please try again.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (file) => {
    setCurrentFile(file);
    form.setFieldValue("documentData", file);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Loader size="md" />
        <Text mt="md">Loading document details...</Text>
      </div>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="Document Name"
        placeholder="Enter document name"
        required
        mb="md"
        {...form.getInputProps("name")}
      />
      
      <Textarea
        label="Description"
        placeholder="Enter document description"
        required
        mb="md"
        minRows={3}
        maxRows={5}
        {...form.getInputProps("description")}
      />
      
      <Select
        label="Document Type"
        placeholder="Select document type"
        required
        mb="md"
        data={documentTypeOptions}
        loading={isLoadingDocumentTypes}
        value={form.values.documentTypeId ? form.values.documentTypeId.toString() : ""}
        onChange={value => form.setFieldValue("documentTypeId", value ? Number(value) : "")}
        error={form.errors.documentTypeId}
      />
      
      <TextInput
        label="Access Roles"
        placeholder="Enter access roles (optional)"
        mb="md"
        description="Leave empty for all users"
        {...form.getInputProps("accessRoles")}
      />

      {!id && (
        <FileInput
          label="Document File"
          placeholder="Click to upload or drag and drop"
          required
          mb="md"
          accept="*/*"
          icon={<IconUpload size={16} />}
          value={currentFile}
          onChange={handleFileChange}
          error={form.errors.documentData}
          description="Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, etc."
        />
      )}

      {id && (
        <Alert icon={<IconAlertCircle size={16} />} color="blue" mb="md">
          <Text size="sm">
            File upload is not available in edit mode. The existing file will be retained.
          </Text>
        </Alert>
      )}

      <Group position="right" mt="xl">
        <Button variant="outline" onClick={onModalClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          loaderPosition="right"
        >
          {id ? "Update Document" : "Upload Document"}
        </Button>
      </Group>
    </form>
  );
};
