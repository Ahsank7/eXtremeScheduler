import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import FranchiseList from "../components/franchiseList";
import AddFranchise from "../components/AddFranchise";
import { stringhelper } from "shared/utils";
import { AppModal, AppContainer } from "shared/components";
import { localStoreService, franchiseService } from "core/services";

const Organizations = () => {
  const [franchises, setFranchises] = useState([]);

  const { orgName } = useParams();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const { selectedMenu: org } = useOutletContext();

  useEffect(() => {
    getFranchises();
  }, [orgName, org]);

  const getFranchises = async () => {
    const userID = localStoreService.getUserID();

    if (org) {
      const response = await franchiseService.getFranchiseList(
        org.id,
        userID
      );

      if (response.isSuccess) {
          setFranchises(response.data);
      } else {
        console.error(response.errors);
      }
    }
  };

  const handleFranchise = (franchise) => {
    navigate(
      `/franchises/${stringhelper.removeSpaceFromString(
        franchise.name
      )}/dashboard`
    );
  };

  const handleModalClose = async () => {
    close();
    await getFranchises();
  };

  return (
    <>
      <AppContainer
        title={org?.label}
        button={<Button onClick={open}>Create Franchise</Button>}
        showDivider="true"
        margionTop="2rem"
      >
        <FranchiseList franchises={franchises} onFranchise={handleFranchise} />
      </AppContainer>

      <AppModal
        opened={opened}
        size="lg"
        onClose={close}
        title="Create Franchise"
      >
        <AddFranchise
          organizationId={org?.id}
          onModalClose={handleModalClose}
        />
      </AppModal>
    </>
  );
};

export default Organizations;
