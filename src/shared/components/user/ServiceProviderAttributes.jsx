import React, { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Select,
  ActionIcon,
  Loader,
  Alert,
  Box,
} from "@mantine/core";
import { IconTrash, IconPlus, IconAlertCircle } from "@tabler/icons-react";
import {
  preferenceService,
  lookupService,
  showSuccessNotification,
  showErrorNotification,
  handleApiError,
} from "core/services";

export function ServiceProviderAttributes({ serviceProviderId, readOnly = false }) {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attributeOptions, setAttributeOptions] = useState({});
  const [newAttribute, setNewAttribute] = useState({
    attributeType: "",
    attributeItemId: null,
  });

  // Available attribute types
  const attributeTypes = [
    { value: "Gender", label: "Gender" },
    { value: "SmokingStatus", label: "Smoking Status" },
    { value: "Language", label: "Language" },
    { value: "AgeRange", label: "Age Range" },
    { value: "Experience", label: "Experience Level" },
    { value: "PetFriendly", label: "Pet Friendly" },
    { value: "TransportationMode", label: "Transportation Mode" },
    { value: "Certification", label: "Certification" },
  ];

  useEffect(() => {
    if (serviceProviderId) {
      loadAttributes();
      loadAttributeOptions();
    }
  }, [serviceProviderId]);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const response = await preferenceService.getServiceProviderAttributes(serviceProviderId);
      if (response?.attributes) {
        setAttributes(response.attributes);
      }
    } catch (error) {
      handleApiError(error, "Failed to load attributes");
    } finally {
      setLoading(false);
    }
  };

  const loadAttributeOptions = async () => {
    try {
      // Load lookup options for each attribute type
      const types = [
        "Gender",
        "SmokingStatus",
        "Language",
        "AgeRange",
        "Experience",
        "PetFriendly",
        "TransportationMode",
        "Certification",
      ];

      const options = {};
      for (const type of types) {
        try {
          const response = await lookupService.getLookupList({
            lookupType: type,
          });
          if (response?.result) {
            options[type] = response.result.map((item) => ({
              value: item.id.toString(),
              label: item.name,
            }));
          }
        } catch (error) {
          console.warn(`Failed to load ${type} options:`, error);
          options[type] = [];
        }
      }

      setAttributeOptions(options);
    } catch (error) {
      console.error("Error loading attribute options:", error);
    }
  };

  const handleAddAttribute = async () => {
    if (!newAttribute.attributeType || !newAttribute.attributeItemId) {
      showErrorNotification("Please select both attribute type and value");
      return;
    }

    try {
      setSaving(true);
      await preferenceService.upsertServiceProviderAttribute({
        serviceProviderId: serviceProviderId,
        attributeType: newAttribute.attributeType,
        attributeItemId: parseInt(newAttribute.attributeItemId),
      });

      showSuccessNotification("Attribute added successfully");
      loadAttributes();
      
      // Reset form
      setNewAttribute({
        attributeType: "",
        attributeItemId: null,
      });
    } catch (error) {
      handleApiError(error, "Failed to add attribute");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttribute = async (attributeId) => {
    try {
      setSaving(true);
      await preferenceService.deleteServiceProviderAttribute(attributeId);
      showSuccessNotification("Attribute deleted successfully");
      loadAttributes();
    } catch (error) {
      handleApiError(error, "Failed to delete attribute");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Group position="center">
          <Loader size="sm" />
          <Text>Loading attributes...</Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack spacing="md">
        <Group position="apart">
          <div>
            <Title order={4}>Service Provider Attributes</Title>
            <Text size="sm" color="dimmed">
              Define your characteristics for client matching
            </Text>
          </div>
        </Group>

        {!readOnly && (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              Add your attributes to help clients find you. These will be used to match you with
              clients looking for service providers with specific characteristics.
            </Text>
          </Alert>
        )}

        {/* Existing Attributes */}
        {attributes.length > 0 ? (
          <Stack spacing="xs">
            {attributes.map((attr) => (
              <Paper key={attr.id} p="sm" withBorder>
                <Group position="apart">
                  <div>
                    <Group spacing="xs">
                      <Text weight={500}>{attr.attributeType}:</Text>
                      <Text>{attr.attributeItemName || attr.attributeValue}</Text>
                    </Group>
                    {attr.attributeItemDescription && (
                      <Text size="xs" color="dimmed">
                        {attr.attributeItemDescription}
                      </Text>
                    )}
                  </div>
                  {!readOnly && (
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => handleDeleteAttribute(attr.id)}
                      disabled={saving}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Alert color="gray" variant="light">
            <Text size="sm">
              No attributes set. {!readOnly && "Add attributes below to help clients find you."}
            </Text>
          </Alert>
        )}

        {/* Add New Attribute */}
        {!readOnly && (
          <Box>
            <Text weight={500} size="sm" mb="xs">
              Add New Attribute
            </Text>
            <Group spacing="sm" align="end">
              <Select
                placeholder="Select attribute type"
                data={attributeTypes}
                value={newAttribute.attributeType}
                onChange={(value) =>
                  setNewAttribute({ ...newAttribute, attributeType: value, attributeItemId: null })
                }
                style={{ flex: 1 }}
                disabled={saving}
              />
              <Select
                placeholder="Select value"
                data={attributeOptions[newAttribute.attributeType] || []}
                value={newAttribute.attributeItemId}
                onChange={(value) => setNewAttribute({ ...newAttribute, attributeItemId: value })}
                style={{ flex: 1 }}
                disabled={!newAttribute.attributeType || saving}
              />
              <Button
                leftIcon={<IconPlus size={16} />}
                onClick={handleAddAttribute}
                loading={saving}
                disabled={!newAttribute.attributeType || !newAttribute.attributeItemId}
              >
                Add
              </Button>
            </Group>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

