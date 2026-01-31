import React, { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Select,
  Switch,
  ActionIcon,
  Loader,
  Badge,
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

export function ClientPreferences({ clientId, readOnly = false }) {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferenceOptions, setPreferenceOptions] = useState({});
  const [newPreference, setNewPreference] = useState({
    preferenceType: "",
    preferenceItemId: null,
    isRequired: false,
  });

  // Available preference types
  const preferenceTypes = [
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
    if (clientId) {
      loadPreferences();
      loadPreferenceOptions();
    }
  }, [clientId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await preferenceService.getClientPreferences(clientId);
      if (response?.preferences) {
        setPreferences(response.preferences);
      }
    } catch (error) {
      handleApiError(error, "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const loadPreferenceOptions = async () => {
    try {
      // Load lookup options for each preference type
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

      setPreferenceOptions(options);
    } catch (error) {
      console.error("Error loading preference options:", error);
    }
  };

  const handleAddPreference = async () => {
    if (!newPreference.preferenceType || !newPreference.preferenceItemId) {
      showErrorNotification("Please select both preference type and value");
      return;
    }

    try {
      setSaving(true);
      await preferenceService.upsertClientPreference({
        clientId: clientId,
        preferenceType: newPreference.preferenceType,
        preferenceItemId: parseInt(newPreference.preferenceItemId),
        isRequired: newPreference.isRequired,
      });

      showSuccessNotification("Preference added successfully");
      loadPreferences();
      
      // Reset form
      setNewPreference({
        preferenceType: "",
        preferenceItemId: null,
        isRequired: false,
      });
    } catch (error) {
      handleApiError(error, "Failed to add preference");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePreference = async (preferenceId) => {
    try {
      setSaving(true);
      await preferenceService.deleteClientPreference(preferenceId);
      showSuccessNotification("Preference deleted successfully");
      loadPreferences();
    } catch (error) {
      handleApiError(error, "Failed to delete preference");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRequired = async (preference) => {
    try {
      setSaving(true);
      await preferenceService.upsertClientPreference({
        id: preference.id,
        clientId: clientId,
        preferenceType: preference.preferenceType,
        preferenceItemId: preference.preferenceItemId,
        isRequired: !preference.isRequired,
      });

      showSuccessNotification("Preference updated successfully");
      loadPreferences();
    } catch (error) {
      handleApiError(error, "Failed to update preference");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Group position="center">
          <Loader size="sm" />
          <Text>Loading preferences...</Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack spacing="md">
        <Group position="apart">
          <div>
            <Title order={4}>Client Preferences</Title>
            <Text size="sm" color="dimmed">
              Set preferences for service provider matching
            </Text>
          </div>
        </Group>

        {!readOnly && (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              Add preferences to help match you with suitable service providers. Mark preferences
              as "Required" if they are mandatory, or leave unmarked for optional preferences.
            </Text>
          </Alert>
        )}

        {/* Existing Preferences */}
        {preferences.length > 0 ? (
          <Stack spacing="xs">
            {preferences.map((pref) => (
              <Paper key={pref.id} p="sm" withBorder>
                <Group position="apart">
                  <div>
                    <Group spacing="xs">
                      <Text weight={500}>{pref.preferenceType}:</Text>
                      <Text>{pref.preferenceItemName || pref.preferenceValue}</Text>
                      {pref.isRequired && (
                        <Badge color="red" size="sm">
                          Required
                        </Badge>
                      )}
                    </Group>
                    {pref.preferenceItemDescription && (
                      <Text size="xs" color="dimmed">
                        {pref.preferenceItemDescription}
                      </Text>
                    )}
                  </div>
                  {!readOnly && (
                    <Group spacing="xs">
                      <Switch
                        label="Required"
                        size="xs"
                        checked={pref.isRequired}
                        onChange={() => handleToggleRequired(pref)}
                        disabled={saving}
                      />
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleDeletePreference(pref.id)}
                        disabled={saving}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Alert color="gray" variant="light">
            <Text size="sm">
              No preferences set. {!readOnly && "Add preferences below to get started."}
            </Text>
          </Alert>
        )}

        {/* Add New Preference */}
        {!readOnly && (
          <Box>
            <Text weight={500} size="sm" mb="xs">
              Add New Preference
            </Text>
            <Group spacing="sm" align="end">
              <Select
                placeholder="Select preference type"
                data={preferenceTypes}
                value={newPreference.preferenceType}
                onChange={(value) =>
                  setNewPreference({ ...newPreference, preferenceType: value, preferenceItemId: null })
                }
                style={{ flex: 1 }}
                disabled={saving}
              />
              <Select
                placeholder="Select value"
                data={preferenceOptions[newPreference.preferenceType] || []}
                value={newPreference.preferenceItemId}
                onChange={(value) => setNewPreference({ ...newPreference, preferenceItemId: value })}
                style={{ flex: 1 }}
                disabled={!newPreference.preferenceType || saving}
              />
              <Switch
                label="Required"
                checked={newPreference.isRequired}
                onChange={(e) =>
                  setNewPreference({ ...newPreference, isRequired: e.currentTarget.checked })
                }
                disabled={saving}
              />
              <Button
                leftIcon={<IconPlus size={16} />}
                onClick={handleAddPreference}
                loading={saving}
                disabled={!newPreference.preferenceType || !newPreference.preferenceItemId}
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

