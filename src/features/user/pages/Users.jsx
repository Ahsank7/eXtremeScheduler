import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, LoadingOverlay, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AppTable, AppContainer, AppDrawer } from "shared/components";
import { localStoreService, profileService } from "core/services";
import { helperFunctions } from "shared/utils";
import { UserType } from "core/enum";
import { DataTable } from "mantine-datatable";
import { IconEdit, IconSend, IconTrash } from "@tabler/icons";

const Users = ({ userTypeID }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [clients, setClients] = useState([]);

  const [opened, { open: onFilterBtnOpen, close: onFilterBtnClose }] =
    useDisclosure(false);

  //filers
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [tableHeight, setTableHeight] = useState(500);
  //filers

  useEffect(() => {
    const calculateTableHeight = () => {
      const windowHeight = window.innerHeight;
      // Account for header, navigation, padding, and status buttons
      const reservedHeight = 200; // Adjust this value based on your layout
      const calculatedHeight = Math.max(400, windowHeight - reservedHeight);
      setTableHeight(calculatedHeight);
    };

    // Calculate initial height
    calculateTableHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateTableHeight);

    // Cleanup
    return () => window.removeEventListener('resize', calculateTableHeight);
  }, []);

  const navigate = useNavigate();
  const { franchiseName } = useParams();

  const pageSize = 25;
  const tableColumns = [
    {
      accessor: "index",
      title: "SrNo",
      textAlignment: "left",
      render: (record) => clients.indexOf(record) + 1,
      noWrap: true,
    },
    {
      accessor: "userNo",
      title: "UserNo",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "firstName",
      title: "First Name",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "lastName",
      title: "Last Name",
      textAlignment: "left",
    },
    {
      accessor: "alias",
      title: "Alias",
      textAlignment: "left",
    },
    {
      accessor: "phoneNo",
      title: "Phone Number",
      textAlignment: "left",
    },
    {
      accessor: "mobileNo",
      title: "Mobile Number",
      textAlignment: "left",
    },
    /*{
      accessor: "passportNo",
      title: "Passport Number",
      textAlignment: "left",
    },*/
    {
      accessor: "email",
      title: "Email",
      textAlignment: "left",
    },
    {
      accessor: "joiningDate",
      title: "DOJ",
      textAlignment: "left",
      render: (record) => new Date(record.joiningDate).toLocaleDateString('en-US'),
    },
    {
      accessor: "gender",
      title: "Gender",
      textAlignment: "left",
    },
    {
      accessor: "birthDate",
      title: "DOB",
      textAlignment: "left",
      render: (record) => new Date(record.birthDate).toLocaleDateString('en-US'),
    },
    /*{
      accessor: "ethnicity",
      title: "Ethnicity",
      textAlignment: "left",
    },
    {
      accessor: "nationality",
      title: "Nationality",
      textAlignment: "left",
    },
    {
      accessor: "identityNo",
      title: "Identity Number",
      textAlignment: "left",
    },
    {
      accessor: "notes",
      title: "Notes",
      textAlignment: "left",
    },*/
    {
      accessor: "status",
      title: "Status",
      textAlignment: "left",
      render: (record) => record.status === 'Active' ? <span style={{ color: 'green' }}>Active</span> : <span style={{ color: 'red' }}>In-Active</span>,
    },
    {
      accessor: "actions",
      title: "",
      textAlignment: "left",
    },
  ];

  useEffect(() => {
    getUsers();
  }, [pageNumber, userTypeID]);

  const getUsers = async () => {
    const obj = {};

    obj.franchiseId = localStoreService.getFranchiseID();
    obj.firstName = firstName;
    obj.lastName = lastName;
    obj.phoneNumber = phoneNumber;
    obj.mobileNumber = mobileNumber;
    obj.email = email;
    obj.userType = userTypeID;
    obj.pageNumber = pageNumber;
    obj.pageSize = pageSize;
    obj.sortColumn = "ID";
    obj.sortType = "asc";

    setIsLoading(true);
    const { data, totalRecords } = await profileService.getUsers(obj);
    setClients(data.response);
    setTotalRecords(data.totalRecords);
    setIsLoading(false);
  };

  const handlePagination = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  const handleFilter = async () => {
    onFilterBtnClose();
    await getUsers();
  };

  const handleProfileDetail = (selectedRow) => {
    let userID = selectedRow
      ? selectedRow.userId
      : "00000000-0000-0000-0000-000000000000";

    navigate(`/franchises/${franchiseName}/profile/${userID}/${userTypeID}`);
  };

  return (
    <>
      <AppContainer
        title={
          Object.entries(UserType).find(
            ([key, value]) => value == userTypeID
          )?.[0]
        }
        button={
          <Button onClick={() => handleProfileDetail(null)}>
            Create
          </Button>
        }
        showDivider="true"
      >
        <LoadingOverlay visible={isLoading} />

        <DataTable
          height="70vh"
          striped
          highlightOnHover
          columns={tableColumns}
          records={clients}
          noRecordsText="No records to show"

          customRowAttributes={(record) => ({
            onDoubleClick: (e) => {
              handleProfileDetail(record);
            },
          })}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          page={pageNumber}
          onPageChange={(p) => handlePagination(p)}
          paginationSize="lg"
        />
        {/* <AppTable
          thead={tableColumns}
          currentPage={pageNumber}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPagination={handlePagination}
          onFilterBtn={onFilterBtnOpen}
        >
          {clients.map((row, index) => (
            <tr key={index} onClick={() => handleProfileDetail(row)}>
              <td>
                {helperFunctions.getRowNumber(pageSize, pageNumber, index)}
              </td>
              <td>{row.userNo}</td>
              <td>{row.firstName}</td>
              <td>{row.lastName}</td>
              <td>{row.alias}</td>
              <td>{row.phoneNo}</td>
              <td>{row.mobileNo}</td>
              <td>{row.passportNo}</td>
              <td>{row.email}</td>
              <td>{row.joiningDate}</td>
              <td>{row.gender}</td>
              <td>{row.birthDate}</td>
              <td>{row.ethnicity}</td>
              <td>{row.nationality}</td>
              <td>{row.identityNo}</td>
              <td>{row.notes}</td>
              <td>{row.status}</td>
              <td></td>
            </tr>
          ))}
        </AppTable> */}
      </AppContainer>

      <AppDrawer
        opened={opened}
        close={onFilterBtnClose}
        onFilter={handleFilter}
      >
        <form>
          <TextInput
            label="First Name"
            placeholder="john"
            size="md"
            mt="md"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextInput
            label="Last Name"
            placeholder="Doe"
            size="md"
            mt="md"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextInput
            label="Phone Number"
            placeholder="0001234567"
            size="md"
            mt="md"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <TextInput
            label="Mobile Number"
            placeholder="0001234567"
            size="md"
            mt="md"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
          <TextInput
            label="Email"
            placeholder="example@gmail.com"
            size="md"
            mt="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>
      </AppDrawer>
    </>
  );
};

export default Users;
