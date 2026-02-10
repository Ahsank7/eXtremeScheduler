import {
  Paper,
  Box,
  createStyles,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Title,
  Text,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z as zod } from "zod";
import { authenticationService, localStoreService, franchiseService, loginHistoryService, handleApiError, showSuccessNotification } from "core/services";
import { getSystemInfo } from "core/utils/systemInfo";
import { useState } from "react";
import { stringhelper } from "shared/utils";

const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "stretch",
    backgroundImage: "url(/LoginPage-HC.png?w=1280&q=80)",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right center",
    backgroundSize: "contain",
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
  },

  formColumn: {
    width: "100%",
    maxWidth: 440,
    minWidth: 320,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing.xl * 2,
    paddingLeft: theme.spacing.xl * 2.5,
    paddingRight: theme.spacing.xl * 2.5,
    borderRight: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]}`,
    background:
      theme.colorScheme === "dark"
        ? `linear-gradient(180deg, ${theme.colors.dark[6]} 0%, ${theme.colors.dark[7]} 22%, ${theme.colors.dark[7]} 78%, ${theme.colors.dark[6]} 100%)`
        : "linear-gradient(180deg, #eef4ff 0%, #f8fafc 18%, #ffffff 50%, #f8fafc 82%, #e0f2fe 100%)",
    boxShadow: theme.colorScheme === "dark" ? "none" : "4px 0 24px rgba(0,0,0,0.06)",
    position: "relative",
    overflow: "hidden",
    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
      boxShadow: "none",
      borderRight: "none",
    },
  },

  formColumnDecorTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "28%",
    background:
      theme.colorScheme === "dark"
        ? `linear-gradient(180deg, ${theme.colors.blue[9]}20 0%, transparent 100%)`
        : "linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%)",
    pointerEvents: "none",
  },

  formColumnDecorBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "28%",
    background:
      theme.colorScheme === "dark"
        ? `linear-gradient(0deg, ${theme.colors.cyan[9]}18 0%, transparent 100%)`
        : "linear-gradient(0deg, rgba(6, 182, 212, 0.06) 0%, transparent 100%)",
    pointerEvents: "none",
  },

  formInner: {
    maxWidth: 360,
    margin: "0 auto",
    width: "100%",
  },

  logoWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },

  logo: {
    height: 48,
    width: "auto",
    objectFit: "contain",
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.colors.gray[9],
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },

  subtitle: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[2] : theme.colors.gray[6],
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
    fontSize: theme.fontSizes.sm,
  },

  inputLabel: {
    fontWeight: 500,
    color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[7],
  },

  loginButton: {
    height: 44,
    fontSize: theme.fontSizes.md,
    fontWeight: 600,
    borderRadius: theme.radius.md,
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
    },
  },
}));

const schema = zod.object({
  username: zod.string().min(1, "Username is required"),
  password: zod.string().min(1, "Password is required"),
});

const Login = () => {
  const { classes } = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);

      const response = await authenticationService.login({
        username: values.username,
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
          ipAddress: null, // IP address will be captured by the backend
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
          showSuccessNotification("Redirecting to your profile...", "Login Successful");
          
          // Get franchise list for the user
          const franchiseResponse = await franchiseService.getFranchiseList(organizationId, userId);
          
          if (franchiseResponse && franchiseResponse.length > 0) {
            // Get the first franchise
            const firstFranchise = franchiseResponse[0];
            
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
        showSuccessNotification("Redirecting to organizations...", "Login Successful");
        window.location.href = "/organizations";
      }

    } catch (error) {
      handleApiError(error, "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logoUrl = process.env.PUBLIC_URL + "/simpleLogo.PNG";

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.formColumn} shadow="none" radius={0}>
        <Box className={classes.formColumnDecorTop} aria-hidden />
        <Box className={classes.formColumnDecorBottom} aria-hidden />
        <Box component="form" onSubmit={form.onSubmit((values) => handleSubmit(values))} className={classes.formInner} style={{ position: "relative", zIndex: 1 }}>
          <div className={classes.logoWrap}>
            <img src={logoUrl} alt="caresynX" className={classes.logo} />
          </div>
          <Title order={1} className={classes.title} align="center" size="h2">
            Welcome back to caresynX
          </Title>
          <Text className={classes.subtitle} align="center">
            Sign in to manage your schedules and care team
          </Text>

          <TextInput
            withAsterisk
            label="Username"
            placeholder="Enter your username"
            size="md"
            radius="md"
            variant="filled"
            labelProps={{ className: classes.inputLabel }}
            {...form.getInputProps("username")}
          />
          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Enter your password"
            mt="md"
            size="md"
            radius="md"
            variant="filled"
            labelProps={{ className: classes.inputLabel }}
            {...form.getInputProps("password")}
          />
          <Checkbox
            label="Keep me logged in"
            mt="lg"
            size="md"
            {...form.getInputProps("rememberMe")}
          />
          <Button
            type="submit"
            fullWidth
            mt="xl"
            size="md"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            className={classes.loginButton}
            loading={isLoading}
            loaderPosition="right"
          >
            Sign in
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default Login;
