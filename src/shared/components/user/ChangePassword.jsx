import React, { useState } from "react";
import { Button, TextInput, LoadingOverlay, ActionIcon } from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons";
import { authenticationService } from "core/services";
import { notifications } from "@mantine/notifications";

export function ChangePassword({ userId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!oldPassword.trim()) {
      notifications.show({
        title: "Error",
        message: "Old password is required",
        color: "red",
      });
      return false;
    }

    if (!newPassword.trim()) {
      notifications.show({
        title: "Error",
        message: "New password is required",
        color: "red",
      });
      return false;
    }

    if (newPassword.length < 6) {
      notifications.show({
        title: "Error",
        message: "New password must be at least 6 characters long",
        color: "red",
      });
      return false;
    }

    if (newPassword !== confirmPassword) {
      notifications.show({
        title: "Error",
        message: "New password and confirm password do not match",
        color: "red",
      });
      return false;
    }

    if (oldPassword === newPassword) {
      notifications.show({
        title: "Error",
        message: "New password must be different from old password",
        color: "red",
      });
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const changePasswordData = {
        userId: userId,
        oldPassword: oldPassword,
        newPassword: newPassword,
      };

      const result = await authenticationService.changePassword(changePasswordData);
      
      notifications.show({
        title: "Success",
        message: result.message || "Password changed successfully!",
        color: "green",
      });

      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to change password",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div style={{ maxWidth: "400px", width: "100%" }}>
          <TextInput
            label="Old Password"
            placeholder="Enter your current password"
            type={showOldPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{ marginBottom: "15px" }}
            required
            autoComplete="off"
            rightSection={
              <ActionIcon
                onClick={() => setShowOldPassword(!showOldPassword)}
                variant="subtle"
                size="sm"
              >
                {showOldPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </ActionIcon>
            }
          />
          
          <TextInput
            label="New Password"
            placeholder="Enter new password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ marginBottom: "15px" }}
            required
            autoComplete="off"
            rightSection={
              <ActionIcon
                onClick={() => setShowNewPassword(!showNewPassword)}
                variant="subtle"
                size="sm"
              >
                {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </ActionIcon>
            }
          />
          
          <TextInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ marginBottom: "20px" }}
            required
            autoComplete="off"
            rightSection={
              <ActionIcon
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                variant="subtle"
                size="sm"
              >
                {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </ActionIcon>
            }
          />
          
          <Button 
            onClick={handleChangePassword}
            loading={isLoading}
            fullWidth
            disabled={!oldPassword || !newPassword || !confirmPassword}
          >
            Change Password
          </Button>
        </div>
      </div>
    </>
  );
} 