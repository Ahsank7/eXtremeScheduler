import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  TextInput,
  Table,
  Checkbox,
  Group,
  Text,
  Badge,
  Loader,
  Container,
  Stack,
  Grid,
  Alert,
  Pagination,
  Paper,
  ScrollArea,
  Tooltip,
  ActionIcon,
  Popover,
  List
} from "@mantine/core";
import { IconAlertCircle, IconInfoCircle, IconSearch, IconX, IconInfoCircleFilled } from "@tabler/icons-react";
import { profileService } from "core/services";
import { useFranchise } from "core/context/FranchiseContext";

const ServiceProviderSelector = ({ 
  opened, 
  onClose, 
  onSelect, 
  selectedProviders = [],
  startDateTime,
  endDateTime,
  multiSelect = true 
}) => {
  const { franchiseId } = useFranchise();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(selectedProviders);
  const [searchFilters, setSearchFilters] = useState({
    searchText: "",
    availabilityFilter: "all" // all, available, unavailable, busy, onLeave
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  // Load providers when modal opens or date/time changes
  useEffect(() => {
    if (opened && startDateTime && endDateTime && franchiseId) {
      loadProvidersWithAvailability();
    }
  }, [opened, startDateTime, endDateTime, franchiseId]);

  // Apply filters when search criteria or providers change
  useEffect(() => {
    applyFilters();
  }, [searchFilters, providers]);

  const loadProvidersWithAvailability = async () => {
    setLoading(true);
    try {
      const request = {
        FranchiseId: franchiseId,
        StartDate: startDateTime.toISOString().split('T')[0],
        EndDate: endDateTime.toISOString().split('T')[0],
        StartTime: startDateTime.toTimeString().split(' ')[0],
        EndTime: endDateTime.toTimeString().split(' ')[0],
        SearchText: searchFilters.searchText
      };

      const response = await profileService.getServiceProvidersWithAvailability(request);
      
      if (response && response.response) {
        setProviders(response.response);
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.error("Error loading service providers:", error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...providers];

    // Apply search text filter
    if (searchFilters.searchText) {
      const searchLower = searchFilters.searchText.toLowerCase();
      filtered = filtered.filter(
        (provider) =>
          provider.name?.toLowerCase().includes(searchLower) ||
          provider.email?.toLowerCase().includes(searchLower) ||
          provider.userNo?.toLowerCase().includes(searchLower)
      );
    }

    // Apply availability filter
    if (searchFilters.availabilityFilter !== "all") {
      filtered = filtered.filter((provider) => {
        const status = provider.finalAvailabilityStatus?.toLowerCase();
        switch (searchFilters.availabilityFilter) {
          case "available":
            return status === "available";
          case "unavailable":
            return status === "not available";
          case "busy":
            return status === "busy";
          case "onLeave":
            return status === "on leave";
          default:
            return true;
        }
      });
    }

    setFilteredProviders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = () => {
    loadProvidersWithAvailability();
  };

  const handleSelectProvider = (providerId) => {
    if (multiSelect) {
      setSelectedIds((prev) =>
        prev.includes(providerId)
          ? prev.filter((id) => id !== providerId)
          : [...prev, providerId]
      );
    } else {
      setSelectedIds([providerId]);
    }
  };

  const handleSelectAll = () => {
    const availableProviders = getPageProviders().filter(
      (p) => p.finalAvailabilityStatus?.toLowerCase() === "available"
    );
    
    if (multiSelect) {
      const allAvailableIds = availableProviders.map((p) => p.userId);
      const allSelected = allAvailableIds.every((id) => selectedIds.includes(id));
      
      if (allSelected) {
        // Deselect all from current page
        setSelectedIds(prev => prev.filter(id => !allAvailableIds.includes(id)));
      } else {
        // Select all available from current page
        setSelectedIds(prev => [...new Set([...prev, ...allAvailableIds])]);
      }
    }
  };

  const handleConfirm = () => {
    const selectedProviderDetails = providers.filter((p) =>
      selectedIds.includes(p.userId)
    );
    onSelect(selectedProviderDetails);
    onClose();
  };

  const handleClearFilters = () => {
    setSearchFilters({
      searchText: "",
      availabilityFilter: "all"
    });
  };

  const getAvailabilityBadge = (provider) => {
    const status = provider.finalAvailabilityStatus?.toLowerCase();
    
    switch (status) {
      case "available":
        return <Badge color="green" variant="filled">Available</Badge>;
      case "busy":
        return (
          <Tooltip label={`Has ${provider.taskCount || 0} task(s) scheduled`}>
            <Badge color="orange" variant="filled">Busy</Badge>
          </Tooltip>
        );
      case "on leave":
        return (
          <Tooltip label={`Leave: ${provider.leaveStartDate} to ${provider.leaveEndDate}`}>
            <Badge color="red" variant="filled">On Leave</Badge>
          </Tooltip>
        );
      case "not available":
        return (
          <Tooltip label="Not available during this time slot">
            <Badge color="gray" variant="filled">Not Available</Badge>
          </Tooltip>
        );
      default:
        return (
          <Tooltip label="No availability schedule set">
            <Badge color="gray" variant="outline">No Schedule</Badge>
          </Tooltip>
        );
    }
  };

  const getProviderDetailsContent = (provider) => {
    const status = provider.finalAvailabilityStatus?.toLowerCase();
    
    return (
      <Stack spacing="xs" style={{ maxWidth: 300 }}>
        <Text size="sm" weight={600}>Provider Details</Text>
        
        {/* User Info */}
        <div>
          <Text size="xs" weight={500}>User No:</Text>
          <Text size="xs" color="dimmed">{provider.userNo}</Text>
        </div>
        
        <div>
          <Text size="xs" weight={500}>Email:</Text>
          <Text size="xs" color="dimmed">{provider.email}</Text>
        </div>
        
        {/* Status-specific details */}
        {status === "busy" && (
          <div>
            <Text size="xs" weight={500} color="orange">Busy - {provider.taskCount} task(s) scheduled</Text>
            <Text size="xs" color="dimmed" mt="xs">
              This provider has existing tasks during the requested time period.
            </Text>
          </div>
        )}
        
        {status === "on leave" && (
          <div>
            <Text size="xs" weight={500} color="red">On Leave</Text>
            {provider.leaveStartDate && provider.leaveEndDate && (
              <Text size="xs" color="dimmed" mt="xs">
                {new Date(provider.leaveStartDate).toLocaleDateString()} - {new Date(provider.leaveEndDate).toLocaleDateString()}
              </Text>
            )}
            <Text size="xs" color="dimmed" mt="xs">
              Provider has approved leave during this period.
            </Text>
          </div>
        )}
        
        {status === "available" && (
          <div>
            <Text size="xs" weight={500} color="green">Available</Text>
            {provider.availableStartTime && provider.availableEndTime && (
              <>
                <Text size="xs" color="dimmed" mt="xs">
                  Working hours: {provider.availableStartTime} - {provider.availableEndTime}
                </Text>
                {provider.availableDay && (
                  <Text size="xs" color="dimmed">
                    Availability set for: {provider.availableDay}
                  </Text>
                )}
              </>
            )}
          </div>
        )}
        
        {status === "not available" && (
          <div>
            <Text size="xs" weight={500} color="gray">Not Available</Text>
            <Text size="xs" color="dimmed" mt="xs">
              Provider's schedule doesn't cover all days or times in the requested range.
            </Text>
            {provider.availableStartTime && provider.availableEndTime && (
              <Text size="xs" color="dimmed" mt="xs">
                Partial hours: {provider.availableStartTime} - {provider.availableEndTime}
              </Text>
            )}
          </div>
        )}
        
        {status === "no availability set" && (
          <div>
            <Text size="xs" weight={500} color="gray">No Schedule Set</Text>
            <Text size="xs" color="dimmed" mt="xs">
              This provider hasn't configured their availability schedule yet.
            </Text>
          </div>
        )}
      </Stack>
    );
  };

  const getConflictWarnings = () => {
    const selectedProviderDetails = providers.filter((p) =>
      selectedIds.includes(p.userId)
    );
    
    const unavailable = selectedProviderDetails.filter(
      (p) => p.finalAvailabilityStatus?.toLowerCase() !== "available"
    );

    if (unavailable.length > 0) {
      return (
        <Alert icon={<IconAlertCircle size={16} />} title="Warning" color="orange" mb="md">
          <Stack spacing="xs">
            <Text size="sm">The following providers have conflicts:</Text>
            {unavailable.map((provider) => (
              <Text key={provider.userId} size="sm">
                • <strong>{provider.name}</strong> - {provider.finalAvailabilityStatus}
                {provider.taskCount > 0 && ` (${provider.taskCount} task(s) scheduled)`}
              </Text>
            ))}
          </Stack>
        </Alert>
      );
    }
    return null;
  };

  const getPageProviders = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProviders.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProviders.length / pageSize);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select Service Providers"
      size="xl"
      zIndex={2000}
      styles={{
        body: { minHeight: "600px" }
      }}
    >
      <Stack spacing="md">
        {/* Search and Filters */}
        <Paper p="md" withBorder>
          <Grid>
            <Grid.Col span={8}>
              <TextInput
                placeholder="Search by name, email, or user number"
                value={searchFilters.searchText}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    searchText: e.target.value
                  }))
                }
                rightSection={
                  searchFilters.searchText ? (
                    <ActionIcon onClick={() => setSearchFilters(prev => ({ ...prev, searchText: "" }))}>
                      <IconX size={16} />
                    </ActionIcon>
                  ) : (
                    <IconSearch size={16} />
                  )
                }
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Button onClick={handleSearch} fullWidth loading={loading}>
                Search
              </Button>
            </Grid.Col>
          </Grid>

          <Group mt="md" spacing="xs">
            <Text size="sm" weight={500}>Filter by Status:</Text>
            <Button
              size="xs"
              variant={searchFilters.availabilityFilter === "all" ? "filled" : "outline"}
              onClick={() => setSearchFilters(prev => ({ ...prev, availabilityFilter: "all" }))}
            >
              All ({providers.length})
            </Button>
            <Button
              size="xs"
              variant={searchFilters.availabilityFilter === "available" ? "filled" : "outline"}
              color="green"
              onClick={() => setSearchFilters(prev => ({ ...prev, availabilityFilter: "available" }))}
            >
              Available ({providers.filter(p => p.finalAvailabilityStatus?.toLowerCase() === "available").length})
            </Button>
            <Button
              size="xs"
              variant={searchFilters.availabilityFilter === "busy" ? "filled" : "outline"}
              color="orange"
              onClick={() => setSearchFilters(prev => ({ ...prev, availabilityFilter: "busy" }))}
            >
              Busy ({providers.filter(p => p.finalAvailabilityStatus?.toLowerCase() === "busy").length})
            </Button>
            <Button
              size="xs"
              variant={searchFilters.availabilityFilter === "onLeave" ? "filled" : "outline"}
              color="red"
              onClick={() => setSearchFilters(prev => ({ ...prev, availabilityFilter: "onLeave" }))}
            >
              On Leave ({providers.filter(p => p.finalAvailabilityStatus?.toLowerCase() === "on leave").length})
            </Button>
            {searchFilters.availabilityFilter !== "all" && (
              <Button size="xs" variant="subtle" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Group>
        </Paper>

        {/* Conflict Warnings */}
        {getConflictWarnings()}

        {/* Info Message */}
        {!startDateTime || !endDateTime ? (
          <Alert icon={<IconInfoCircle size={16} />} title="Info" color="blue">
            Please select start and end date/time in the appointment form first.
          </Alert>
        ) : null}

        {/* Providers Table */}
        <Paper withBorder>
          <ScrollArea style={{ height: 400 }}>
            {loading ? (
              <Container py="xl">
                <Group position="center">
                  <Loader />
                  <Text>Loading service providers...</Text>
                </Group>
              </Container>
            ) : filteredProviders.length === 0 ? (
              <Container py="xl">
                <Text align="center" color="dimmed">
                  No service providers found
                </Text>
              </Container>
            ) : (
              <Table highlightOnHover>
                <thead>
                  <tr>
                    <th>
                      {multiSelect && (
                        <Checkbox
                          checked={
                            getPageProviders().filter(p => p.finalAvailabilityStatus?.toLowerCase() === "available").length > 0 &&
                            getPageProviders().filter(p => p.finalAvailabilityStatus?.toLowerCase() === "available").every(p => selectedIds.includes(p.userId))
                          }
                          onChange={handleSelectAll}
                          indeterminate={
                            getPageProviders().filter(p => p.finalAvailabilityStatus?.toLowerCase() === "available").some(p => selectedIds.includes(p.userId)) &&
                            !getPageProviders().filter(p => p.finalAvailabilityStatus?.toLowerCase() === "available").every(p => selectedIds.includes(p.userId))
                          }
                        />
                      )}
                    </th>
                    <th>User No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {getPageProviders().map((provider) => (
                    <tr 
                      key={provider.userId}
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: selectedIds.includes(provider.userId) ? "#f0f9ff" : "transparent"
                      }}
                      onClick={() => handleSelectProvider(provider.userId)}
                    >
                      <td>
                        <Checkbox
                          checked={selectedIds.includes(provider.userId)}
                          onChange={() => handleSelectProvider(provider.userId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td>{provider.userNo}</td>
                      <td>{provider.name}</td>
                      <td>{provider.email}</td>
                      <td>{getAvailabilityBadge(provider)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Group spacing="xs">
                          <Text size="xs" color="dimmed">
                            {provider.finalAvailabilityStatus?.toLowerCase() === "busy" && (
                              `${provider.taskCount} task(s)`
                            )}
                            {provider.finalAvailabilityStatus?.toLowerCase() === "on leave" && (
                              provider.leaveStartDate && provider.leaveEndDate
                                ? `${new Date(provider.leaveStartDate).toLocaleDateString()} - ${new Date(provider.leaveEndDate).toLocaleDateString()}`
                                : "On Leave"
                            )}
                            {provider.finalAvailabilityStatus?.toLowerCase() === "available" && (
                              provider.availableStartTime && provider.availableEndTime
                                ? `${provider.availableStartTime} - ${provider.availableEndTime}`
                                : "Available"
                            )}
                            {provider.finalAvailabilityStatus?.toLowerCase() === "not available" && (
                              "Schedule mismatch"
                            )}
                            {provider.finalAvailabilityStatus?.toLowerCase() === "no availability set" && (
                              "No schedule"
                            )}
                          </Text>
                          <Popover width={320} position="left" withArrow shadow="md">
                            <Popover.Target>
                              <ActionIcon size="sm" variant="subtle" color="blue">
                                <IconInfoCircleFilled size={16} />
                              </ActionIcon>
                            </Popover.Target>
                            <Popover.Dropdown>
                              {getProviderDetailsContent(provider)}
                            </Popover.Dropdown>
                          </Popover>
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </ScrollArea>
        </Paper>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group position="center">
            <Pagination
              page={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
            />
            <Text size="sm" color="dimmed">
              Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredProviders.length)} of {filteredProviders.length}
            </Text>
          </Group>
        )}

        {/* Selection Summary */}
        <Paper p="sm" withBorder bg="gray.0">
          <Group position="apart">
            <Text size="sm" weight={500}>
              Selected: {selectedIds.length} provider(s)
            </Text>
            {selectedIds.length > 0 && (
              <Button
                variant="subtle"
                size="xs"
                color="red"
                onClick={() => setSelectedIds([])}
              >
                Clear Selection
              </Button>
            )}
          </Group>
        </Paper>

        {/* Action Buttons */}
        <Group position="right">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
          >
            Confirm Selection
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ServiceProviderSelector;

