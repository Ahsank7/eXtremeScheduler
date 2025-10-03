import { useEffect, useState, useCallback } from "react";
import { AppTable, AppModal } from "shared/components";
import { Button, LoadingOverlay, Badge } from "@mantine/core";
import { profileService, contactService } from "core/services";
import { helperFunctions } from "shared/utils";
import { notifications } from "@mantine/notifications";
import { AddUpdateUserContact } from "shared/components/user/AddUpdateUserContact";
import { AppConfirmationModal } from "shared/components/modal/AppConfirmationModal";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons";

export function Contact({ userId, organizationId, franchiseId }) {
  const [Contact, setContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const tableColumns = [
    "SrNo",
    "Type",
    "First Name",
    "Phone",
    "Email",
    "Mobile",
    "Actions",
  ];

  const fetchContact = useCallback(async () => {
    setIsLoading(true);
    const request = {
      userId: userId,
      sortColumn: "id",
      sortType: "desc",
      pageNumber: 1,
      pageSize: 100,
    };

    try {
      const response = await profileService.getContactList(request);
      console.log('Contact Response:', response); // Debug log
      setContact(response?.response || []);
    } catch (error) {
      console.error("Failed to fetch contact data:", error);
      setContact([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleActionClick = async (action, rowId) => {
    setCurrentRowId(rowId);

    if (action === "Delete") {
      setIsConfirmationModalOpen(true);
    } else if (action === "Edit") {
      setIsModalOpen(true);
    } else if (action === "Add") {
      setIsModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await contactService.deleteContactItem(currentRowId);
      notifications.show({
        title: "Success",
        message: "Contact item deleted successfully",
        color: "green",
      });
      fetchContact();
    } catch (error) {
      console.error("Failed to delete Contact item:", error);
    }
    setIsConfirmationModalOpen(false);
  };

  const openAddModal = () => {
    setCurrentRowId(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchContact();
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={openAddModal}
        >
          Create
        </Button>
      </div>
      <AppTable thead={tableColumns}>
        {Contact &&
          Contact.map((row, index) => (
            <tr key={index}>
              <td>{helperFunctions.getRowNumber(100, 1, index)}</td>
              <td>
                <Badge color="blue" variant="light">
                  {row.contactType || "N/A"}
                </Badge>
              </td>
              <td>{row.firstName}</td>
              <td>{row.phoneNo}</td>
              <td>{row.email}</td>
              <td>{row.mobileNo}</td>
              <td>
                <Button.Group>
                  <Button 
                    onClick={() => handleActionClick("Edit", row.id)}
                    leftIcon={<IconEdit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button
                    color="red"
                    onClick={() => handleActionClick("Delete", row.id)}
                    leftIcon={<IconTrash size={16} />}
                  >
                    Delete
                  </Button>
                </Button.Group>
              </td>
            </tr>
          ))}
      </AppTable>

      <AppModal
        opened={isModalOpen}
        onClose={closeModal}
        title={currentRowId ? "Edit Contact" : "Add Contact"}
        size="xl"
      >
        <AddUpdateUserContact
          userId={userId}
          id={currentRowId}
          onModalClose={closeModal}
          organizationId={organizationId}
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
        Are you sure you want to delete this Contact item?
      </AppConfirmationModal>
    </>
  );
}
