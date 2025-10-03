import React, { useState, useEffect, useCallback } from "react";
import { Button, TextInput, Select, LoadingOverlay } from "@mantine/core";
import { authenticationService } from "core/services";
import { helperFunctions } from "shared/utils";
import { notifications } from "@mantine/notifications";

export function Creadentials({ userId, userType }) {
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");



  const fetchCredentials = useCallback(async () => {
    if (userId) {
      setIsFetching(true);
      try {
        const response = await authenticationService.getUserCredentials(userId);
        
        // Only set values if they exist in the response, don't auto-fill with browser data
        if (response && response.userName) {
          setUserName(response.userName);
        } else {
          setUserName("");
        }
        
        if (response && response.password) {
          setPassword(response.password);
        } else {
          setPassword("");
        }
      } catch (error) {
        console.error('Error fetching credentials:', error);
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "Error",
          message: "Failed to fetch the Credentials",
          color: "red",
          style: {
            backgroundColor: "white",
          },
        });
      } finally {
        setIsFetching(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);





  const saveCredentials = async () => {
    if (!userName || !password) {
      notifications.show({
        title: "Error",
        message: "Username and password are required",
        color: "red",
      });
      return;
    }



    setIsLoading(true);
    try {
      const credentialsData = {
        userId: userId,
        userName: userName,
        password: password,
      };



      const result = await authenticationService.saveUpdateUserCredentials(credentialsData);
      notifications.show({
        title: "Success",
        message: result.message,
        color: "green",
      });

      fetchCredentials();
          } catch (error) {
        console.error('Error saving credentials:', error);
        let errorMessage = "Failed to save credentials";
        
        if (error.response) {
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data && error.response.data.errors) {
            errorMessage = error.response.data.errors.join(', ');
          }
        }
      
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={isFetching} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div style={{ maxWidth: "400px" }}>
          <TextInput
            label="Username"
            placeholder="Enter username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ marginBottom: "10px" }}
            required
            autoComplete="new-username"
          />
          <TextInput
            label="Password"
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: "10px" }}
            required
            autoComplete="new-password"
          />

        
            <Button 
              onClick={saveCredentials}
              loading={isLoading}
              fullWidth
            >
              Save
            </Button>

        </div>
      </div>
    </>
  );
}
