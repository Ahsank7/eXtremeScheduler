import {
  Paper,
  createStyles,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Title,
  Text,
  Anchor,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
//import { useNavigate } from "react-router-dom";
import { z as zod } from "zod";
import { authenticationService, localStoreService, franchiseService, loginHistoryService } from "core/services";
import { getSystemInfo } from "core/utils/systemInfo";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { jwtDecode } from "jwt-decode";
import { stringhelper } from "shared/utils";

const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    backgroundImage: "url(/LoginPage.png?w=1280&q=80)",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right center",
    backgroundSize: "contain"
  },

  form: {
    borderRight: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    maxWidth: "23vw",
    paddingTop: "80rem",
    height: "100vh",
    [theme.fn.smallerThan("lg")]: {
      maxWidth: "30vw",
    },
    [theme.fn.smallerThan("md")]: {
      maxWidth: "35vw",
    },
    [theme.fn.smallerThan("sm")]: {
      maxWidth: "100vw",
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },
}));

const schema = zod.object({
  usename: zod.string().nonempty("Username is not valid"),
  password: zod.string().nonempty("Password is required"),
});

const Login = () => {
  const { classes } = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      usename: "",
      password: "",
      rememberMe: false,
    },
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);

      const response = await authenticationService.login({
        username: values.usename,
        password: values.password,
      });

      localStoreService.setToken(response.token);

      // Get user info from token
      const userInfo = localStoreService.getUserInfo();
      const userType = parseInt(userInfo.UserType, 10);
      const userId = userInfo.UserID;
      const organizationId = userInfo.OrganizationId;

      // Log login history
      try {
        const systemInfo = getSystemInfo();
        await loginHistoryService.insertLoginHistory({
          userId: userId,
          userName: userInfo.FullName,
          userEmail: userInfo.Email,
          userType: userType,
          organizationId: organizationId,
          franchiseId: userInfo.FranchiseId || null,
          ipAddress: systemInfo.ipAddress || 'Unknown',
          userAgent: systemInfo.userAgent,
          browserName: systemInfo.browserName,
          browserVersion: systemInfo.browserVersion,
          operatingSystem: systemInfo.operatingSystem,
          deviceType: systemInfo.deviceType,
          screenResolution: systemInfo.screenResolution,
          timezone: systemInfo.timezone,
          language: systemInfo.language,
          country: systemInfo.country,
          city: systemInfo.city,
          loginStatus: 'Success'
        });
      } catch (logError) {
        console.error('Failed to log login history:', logError);
        // Don't block login if logging fails
      }

      // Validate that we have all required user info
      if (!userType || !userId || !organizationId || isNaN(userType)) {
        console.error('Missing or invalid user info from token:', { userType, userId, organizationId });
        // Fallback to organizations if user info is incomplete or invalid
        window.location.href = "/organizations";
        return;
      }

      // For user types 1 (Clients) and 2 (Service Providers), navigate directly to first franchise profile
      if (userType === 1 || userType === 2) {
        console.log(`User type ${userType} detected, redirecting to first franchise profile`);
        try {
          // Show loading message for user experience
          notifications.show({
            withCloseButton: false,
            autoClose: 3000,
            title: "Login Successful",
            message: "Redirecting to your profile...",
            color: "green",
            style: {
              backgroundColor: "white",
            },
          });
          
          // Get franchise list for the user
          const franchiseResponse = await franchiseService.getFranchiseList(organizationId, userId);
          
          if (franchiseResponse.isSuccess && franchiseResponse.data && franchiseResponse.data.length > 0) {
            // Get the first franchise
            const firstFranchise = franchiseResponse.data[0];
            
            // Validate that the franchise has a name
            if (!firstFranchise.name) {
              console.error('Franchise name is missing:', firstFranchise);
              window.location.href = "/organizations";
              return;
            }
            
            const franchiseName = stringhelper.removeSpaceFromString(firstFranchise.name);
            
            console.log(`Navigating to franchise: ${franchiseName}, user: ${userId}, userType: ${userType}`);
            
            // Navigate directly to the user's profile in the first franchise
            window.location.href = `/franchises/${franchiseName}/profile/${userId}/${userType}`;
          } else {
            // Fallback to organizations if no franchises found
            console.warn('No franchises found for user, redirecting to organizations');
            window.location.href = "/organizations";
          }
        } catch (franchiseError) {
          console.error('Error getting franchise list:', franchiseError);
          // Fallback to organizations if there's an error
          window.location.href = "/organizations";
        }
      } else {
        // For user type 3 (Staffs) and others, keep current behavior
        console.log(`User type ${userType} detected, redirecting to organizations`);
        notifications.show({
          withCloseButton: false,
          autoClose: 3000,
          title: "Login Successful",
          message: "Redirecting to organizations...",
          color: "green",
          style: {
            backgroundColor: "white",
          },
        });
        window.location.href = "/organizations";
      }

    } catch (error) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Error",
        message: "Please try again",
        color: "red",
        style: {
          backgroundColor: "white",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} p={30}>
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Title
            className={classes.title}
            align="center"
            size="h2"
            mt="md"
            mb={50}
          >
            Welcome back to A2 Scheduler!
          </Title>

          <TextInput
            withAsterisk
            label="Usename"
            placeholder="john123"
            size="md"
            {...form.getInputProps("usename")}
          />
          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            {...form.getInputProps("password")}
          />
          <Checkbox
            label="Keep me logged in"
            mt="xl"
            size="md"
            {...form.getInputProps("rememberMe")}
          />
          <Button
            type="submit"
            fullWidth
            mt="xl"
            loading={isLoading}
            loaderPosition="right"
          >
            Login
          </Button>


        </form>
      </Paper>
    </div>
  );
};

export default Login;
