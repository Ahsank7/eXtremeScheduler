import React, { useState, useEffect } from "react";
import { AppTable, AppModal } from "shared/components";
import {
  Button,
  Select,
  Container,
  Group,
  Tooltip,
  Input,
} from "@mantine/core";
import { userService } from "core/services";
import { localStoreService, profileService } from "core/services";
import { helperFunctions } from "shared/utils";
// Removed the import for 'react-data-table-component' due to the error

export function SearchServiceProviders({ onSelection, multiSelect = true }) {
  const [filters, setFilters] = useState({
    name: "",
    userNo: "",
    gender: "",
    age: "",
    availability: "",
  });
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // Added state to manage modal visibility

  const pageSize = 25;

  //filers
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [userNo, setUserNo] = useState("");

  const handleSearch = async () => {
    const obj = {};

    obj.franchiseId = "971E7A3B-4A0E-4890-BE27-ACE41E9705A7";
    obj.firstName = firstName;
    obj.lastName = lastName;
    obj.phoneNumber = phoneNumber;
    obj.mobileNumber = mobileNumber;
    obj.email = email;
    obj.pageNumber = pageNumber;
    obj.pageSize = pageSize;
    obj.sortColumn = "ID";
    obj.sortType = "asc";

    setIsLoading(true);
    const { data, totalRecords } = await profileService.getServiceProviders(
      obj
    );
    setServiceProviders(data.response);
    setTotalRecords(totalRecords);
    setIsLoading(false);
  };

  const handleSelection = () => {
    onSelection(selectedProviders);
  };

  const handlePagination = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  const handleModal = () => {
    setIsOpen(!isOpen); // Toggle modal visibility
  };

  const tableColumns = [
    "SrNo",
    "UserId",
    "User No",
    "First Name",
    "Last Name",
    "Mobile Number",
    "Email",
  ];

  return (
    <>
      <Button onClick={handleModal}>Open Service Providers Grid</Button>
      <AppModal
        opened={isOpen}
        onClose={handleModal}
        title="Search Service Providers"
        zIndex={1000} // Increased zIndex to ensure this modal is on top of other modals
      >
        <Container fluid>
          <Group position="apart" style={{ width: "100%" }}>
            <Input
              name="userNo"
              onChange={(e) => setUserNo(e.target.value)}
              placeholder="User No"
            />
            <Input
              name="firstname"
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
            <Input
              name="lastname"
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
            <Input
              name="phoneNumber"
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
            />
            <Input
              name="mobileNumber"
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Mobile Number"
            />
            <Input
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <Button onClick={handleSearch}>Search</Button>
          </Group>

          <Container showdivider="true">
            <AppTable
              thead={tableColumns}
              currentPage={pageNumber}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPagination={handlePagination}
            >
              {serviceProviders.map((row, index) => (
                <tr key={index}>
                  <td>
                    {helperFunctions.getRowNumber(pageSize, pageNumber, index)}
                  </td>
                  <td>{row.userId}</td>
                  <td>{row.userNo}</td>
                  <td>{row.firstName}</td>
                  <td>{row.lastName}</td>
                  <td>{row.mobileNo}</td>
                  <td>{row.email}</td>
                </tr>
              ))}
            </AppTable>
          </Container>

          <Button onClick={handleSelection}>Select</Button>
        </Container>
      </AppModal>
    </>
  );
}
