import { useEffect, useState } from "react";
import { servicesService } from "core/services";
import { Loader, Center, Text, Table, Button, Modal, TextInput, Textarea, Group, NumberInput } from "@mantine/core";

const emptyServiceType = { id: 0, name: "", description: "" };
const emptyService = { id: 0, name: "", description: "", rate: 0 };

const Services = ({ organizationId }) => {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [servicesByType, setServicesByType] = useState({});
    const [error, setError] = useState(null);

    // Modal state for Service Type
    const [serviceTypeModalOpen, setServiceTypeModalOpen] = useState(false);
    const [serviceTypeModalLoading, setServiceTypeModalLoading] = useState(false);
    const [serviceTypeForm, setServiceTypeForm] = useState(emptyServiceType);
    const [isEditServiceType, setIsEditServiceType] = useState(false);

    // Modal state for Service
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [serviceModalLoading, setServiceModalLoading] = useState(false);
    const [serviceForm, setServiceForm] = useState(emptyService);
    const [serviceTypeIdForService, setServiceTypeIdForService] = useState(null);
    const [isEditService, setIsEditService] = useState(false);

    useEffect(() => {
        fetchServiceTypes();
        // eslint-disable-next-line
    }, [organizationId]);

    const fetchServiceTypes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await servicesService.getServiceTypes(organizationId);
            setServiceTypes(response.data.response || []);
        } catch (err) {
            setError("Failed to fetch service types");
        } finally {
            setLoading(false);
        }
    };

    const fetchServicesByType = async (serviceTypeId) => {
        try {
            const response = await servicesService.getServicesByType(serviceTypeId);
            setServicesByType((prev) => ({
                ...prev,
                [serviceTypeId]: response.data.response || [],
            }));
        } catch (err) {
            setServicesByType((prev) => ({ ...prev, [serviceTypeId]: [] }));
        }
    };

    const handleRowExpand = async (serviceType) => {
        if (expandedRows.includes(serviceType.id)) {
            setExpandedRows(expandedRows.filter((id) => id !== serviceType.id));
            return;
        }
        setExpandedRows([...expandedRows, serviceType.id]);
        if (!servicesByType[serviceType.id]) {
            await fetchServicesByType(serviceType.id);
        }
    };

    // --- Service Type Modal Handlers ---
    const openAddServiceTypeModal = () => {
        setServiceTypeForm({ ...emptyServiceType });
        setIsEditServiceType(false);
        setServiceTypeModalOpen(true);
    };
    const openEditServiceTypeModal = (type) => {
        setServiceTypeForm({ ...type });
        setIsEditServiceType(true);
        setServiceTypeModalOpen(true);
    };
    const handleServiceTypeFormChange = (field, value) => {
        setServiceTypeForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleServiceTypeModalSave = async () => {
        setServiceTypeModalLoading(true);
        try {
            const payload = {
                ...serviceTypeForm,
                organizationId,
            };
            if (isEditServiceType) {
                await servicesService.updateServiceType(payload);
            } else {
                await servicesService.addServiceType(payload);
            }
            setServiceTypeModalOpen(false);
            await fetchServiceTypes();
        } catch (err) {
            // Optionally show error
        } finally {
            setServiceTypeModalLoading(false);
        }
    };

    // --- Service Modal Handlers ---
    const openAddServiceModal = (serviceTypeId) => {
        setServiceForm({ ...emptyService });
        setServiceTypeIdForService(serviceTypeId);
        setIsEditService(false);
        setServiceModalOpen(true);
    };
    const openEditServiceModal = (service, serviceTypeId) => {
        setServiceForm({ ...service });
        setServiceTypeIdForService(serviceTypeId);
        setIsEditService(true);
        setServiceModalOpen(true);
    };
    const handleServiceFormChange = (field, value) => {
        setServiceForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleServiceModalSave = async () => {
        setServiceModalLoading(true);
        try {
            const payload = {
                ...serviceForm,
                serviceTypeId: serviceTypeIdForService,
            };

            if (isEditService) {
                await servicesService.updateService(payload);
            } else {
                await servicesService.addService(payload); // addService handles both add and update by id
            }
            setServiceModalOpen(false);
            await fetchServicesByType(serviceTypeIdForService);
        } catch (err) {
            // Optionally show error
        } finally {
            setServiceModalLoading(false);
        }
    };

    if (loading) {
        return (
            <Center style={{ minHeight: 200 }}>
                <Loader />
            </Center>
        );
    }
    if (error) {
        return (
            <Center style={{ minHeight: 200 }}>
                <Text color="red">{error}</Text>
            </Center>
        );
    }

    return (
        <>
            <Group mb="md">
                <Button onClick={openAddServiceTypeModal}>Add Service Type</Button>
            </Group>
            <Table withBorder withColumnBorders striped highlightOnHover>
                <thead>
                    <tr>
                        <th style={{ width: 40 }}></th>
                        <th style={{ width: 80 }}>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th style={{ width: 80 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {serviceTypes.map((type) => (
                        <>
                            <tr key={type.id}>
                                <td>
                                    <Button size="xs" variant="light" onClick={() => handleRowExpand(type)}>
                                        {expandedRows.includes(type.id) ? "-" : "+"}
                                    </Button>
                                </td>
                                <td>{type.id}</td>
                                <td>{type.name}</td>
                                <td>{type.description}</td>
                                <td>
                                    <Button size="xs" variant="outline" onClick={() => openEditServiceTypeModal(type)}>
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                            {expandedRows.includes(type.id) && (
                                <tr key={"expanded-" + type.id}>
                                    <td colSpan={5} style={{ background: "#f8f9fa", padding: 0 }}>
                                        <div style={{ marginLeft: 32 }}>
                                            <Group mb="xs">
                                                <Button size="xs" onClick={() => openAddServiceModal(type.id)}>
                                                    Add Service
                                                </Button>
                                            </Group>
                                            <Table
                                                withBorder
                                                withColumnBorders
                                                striped
                                                highlightOnHover
                                                style={{ margin: 0 }}
                                            >
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: 80 }}>ID</th>
                                                        <th>Service Name</th>
                                                        <th>Description</th>
                                                        <th style={{ width: 100 }}>Rate</th>
                                                        <th style={{ width: 80 }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(servicesByType[type.id] || []).map((service) => (
                                                        <tr key={service.id}>
                                                            <td>{service.id}</td>
                                                            <td>{service.name}</td>
                                                            <td>{service.description}</td>
                                                            <td>${service.rate || 0}</td>
                                                            <td>
                                                                <Button size="xs" variant="outline" onClick={() => openEditServiceModal(service, type.id)}>
                                                                    Edit
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(servicesByType[type.id] || []).length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} style={{ textAlign: "center" }}>
                                                                No services found for this type.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </Table>

            {/* Service Type Modal */}
            <Modal
                opened={serviceTypeModalOpen}
                onClose={() => setServiceTypeModalOpen(false)}
                title={isEditServiceType ? "Edit Service Type" : "Add Service Type"}
                centered
            >
                <TextInput
                    label="Name"
                    value={serviceTypeForm.name}
                    onChange={(e) => handleServiceTypeFormChange("name", e.target.value)}
                    required
                    mb="sm"
                />
                <Textarea
                    label="Description"
                    value={serviceTypeForm.description}
                    onChange={(e) => handleServiceTypeFormChange("description", e.target.value)}
                    required
                    mb="sm"
                />
                <Group position="right">
                    <Button loading={serviceTypeModalLoading} onClick={handleServiceTypeModalSave}>
                        Save
                    </Button>
                </Group>
            </Modal>

            {/* Service Modal */}
            <Modal
                opened={serviceModalOpen}
                onClose={() => setServiceModalOpen(false)}
                title={isEditService ? "Edit Service" : "Add Service"}
                centered
            >
                <TextInput
                    label="Name"
                    value={serviceForm.name}
                    onChange={(e) => handleServiceFormChange("name", e.target.value)}
                    required
                    mb="sm"
                />
                <Textarea
                    label="Description"
                    value={serviceForm.description}
                    onChange={(e) => handleServiceFormChange("description", e.target.value)}
                    required
                    mb="sm"
                />
                <NumberInput
                    label="Rate"
                    value={serviceForm.rate}
                    onChange={(value) => handleServiceFormChange("rate", value)}
                    min={0}
                    precision={2}
                    step={0.01}
                    placeholder="0.00"
                    mb="sm"
                />
                <Group position="right">
                    <Button loading={serviceModalLoading} onClick={handleServiceModalSave}>
                        Save
                    </Button>
                </Group>
            </Modal>
        </>
    );
};

export default Services; 