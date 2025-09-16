import React, { useEffect, useState, useCallback } from 'react'
import { AppTable, AppModal } from 'shared/components' // Added Button import
import { Button, Select } from "@mantine/core"; // Use Mantine's Select
import { lookupService } from 'core/services';
import { helperFunctions } from "shared/utils";
import { notifications } from "@mantine/notifications"; // Import notifications for success message
import AddLookup from './AddLookup'; // Import AddLookup component
import { AppConfirmationModal } from 'shared/components/modal/AppConfirmationModal'; // Import AppConfirmationModal for delete confirmation

function Lookup({ organizationid }) {
    const [lookup, setLookup] = useState(null);
    const [lookupDropdown, setLookupDropdown] = useState([]);
    const [selectedLookupType, setSelectedLookupType] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal visibility
    const [currentRowId, setCurrentRowId] = useState(0);

    const tableColumns = [
        "SrNo",
        // "Id",
        "Name",
        "Description",
        "IsActive",
        "Actions"
    ];

    const fetchLookup = useCallback(async () => {
        const request = {
            organizationId: organizationid,
            name: '',
            lookupType: selectedLookupType // Changed to directly use the state variable
        }

        const response = await lookupService.getLookupList(request);
        if (response && response.status === 200 && response.data) {
            setLookup(response.data.result);
        } else if (response && response.errors) {
            console.error("Failed to fetch lookup list:", response.errors);
        } else {
            console.error("Failed to fetch lookup list:", response);
        }
    }, [organizationid, selectedLookupType]);

    const fetchLookupDropdown = useCallback(async () => {
        const { data } = await lookupService.getLookupDropdownList();
        if (data && typeof data === 'object') {
            const dropdownOptions = Object.entries(data).map(([key, value]) => ({
                value: key,
                label: value
            }));
            setLookupDropdown(dropdownOptions);
            if (dropdownOptions.length > 0 && !selectedLookupType) {
                setSelectedLookupType(dropdownOptions[0].value); // Select first dropdown value by default
            }
        }
    }, []);

    useEffect(() => {
        fetchLookup();
    }, [selectedLookupType])

    useEffect(() => {
        fetchLookupDropdown();
    }, [])

    const handleActionClick = async (action, rowId) => {
        setCurrentRowId(rowId);

        if (action === 'Delete') {
            setIsConfirmationModalOpen(true); // Open confirmation modal instead of direct deletion
        } else if (action === 'Edit') {
            setIsModalOpen(true);
        } else if (action === 'Add') {
            setIsModalOpen(true);
        }
    };

    const handleDelete = async () => {
        try {
            await lookupService.deleteLookupItem(currentRowId);
            // Show success notification
            notifications.show({
                title: "Success",
                message: "Lookup item deleted successfully",
                color: "green",
            });
            // Refresh the lookup list after deletion
            fetchLookup();
        } catch (error) {
            console.error("Failed to delete lookup item:", error);
        }
        setIsConfirmationModalOpen(false); // Close confirmation modal after deletion
    };

    const openAddModal = () => {
        setCurrentRowId(null); // Ensure no rowId is set when adding a new entry
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        fetchLookup(); // Refresh the lookup list after closing the modal to ensure the latest data is fetched
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Select
                    label=""
                    placeholder="Select type"
                    data={lookupDropdown}
                    value={selectedLookupType}
                    onChange={(value) => setSelectedLookupType(value)} // Changed to directly use the value from the Select component
                    style={{ width: '200px' }}
                />
                <Button onClick={() => { handleActionClick('Add', 0) }}>Create</Button>
            </div>
            <AppTable thead={tableColumns}>
                {lookup && lookup.map((row, index) => (
                    <tr key={index}>
                        <td>{helperFunctions.getRowNumber(100, 1, index)}</td>
                        {/* <td>{row.id}</td> */}
                        <td>{row.name}</td>
                        <td>{row.description}</td>
                        <td>{row.isActive ? 'Yes' : 'No'}</td>
                        <td>
                            <Button.Group>
                                <Button onClick={() => handleActionClick('Edit', row.id)}>Edit</Button>
                                <Button color='red' onClick={() => handleActionClick('Delete', row.id)}>Delete</Button>
                            </Button.Group>
                        </td>
                    </tr>
                ))}
            </AppTable>

            <AppModal
                opened={isModalOpen}
                onClose={closeModal}
                title={currentRowId ? "Edit Lookup" : "Add Lookup"}
            >
                <AddLookup
                    organizationId={organizationid}
                    lookupId={selectedLookupType} // Pass lookupId as string
                    id={currentRowId}
                    onModalClose={closeModal}
                />
            </AppModal>

            <AppConfirmationModal
                opened={isConfirmationModalOpen}
                onClose={(confirmed) => {
                    if (confirmed) handleDelete();
                    else setIsConfirmationModalOpen(false);
                }}
                title="Confirm Deletion"
            >
                Are you sure you want to delete this lookup item?
            </AppConfirmationModal>
        </>
    )
}

export default Lookup