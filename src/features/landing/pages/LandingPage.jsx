import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Grid,
  TextInput,
  Textarea,
  Group,
  Stack,
  Card,
  Badge,
  Box,
  Anchor,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconUsers, IconChartBar, IconPhone, IconMail, IconCheck } from "@tabler/icons";
import { packageService, landingService } from "core/services";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);

  const contactForm = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must be at least 2 characters" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      phone: (value) => (value.length > 0 && value.length < 10 ? "Invalid phone number" : null),
      message: (value) => (value.length < 10 ? "Message must be at least 10 characters" : null),
    },
  });

  const demoForm = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      preferredDate: "",
      message: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must be at least 2 characters" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      phone: (value) => (value.length > 0 && value.length < 10 ? "Invalid phone number" : null),
      company: (value) => (value.length < 2 ? "Company name must be at least 2 characters" : null),
    },
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoadingPackages(true);
      const response = await packageService.getAllPackages(false);
      if (response?.data) {
        setPackages(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load pricing packages",
        color: "red",
      });
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const handleContactSubmit = async (values) => {
    try {
      setIsSubmittingContact(true);
      const response = await landingService.submitContactRequest(values);
      if (response?.success) {
        notifications.show({
          title: "Success",
          message: response.message || "Thank you for contacting us! We'll get back to you soon.",
          color: "green",
        });
        contactForm.reset();
      } else {
        throw new Error(response?.message || "Failed to submit contact form");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || error?.message || "Failed to submit contact form. Please try again.",
        color: "red",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleDemoSubmit = async (values) => {
    try {
      setIsSubmittingDemo(true);
      const response = await landingService.requestDemo(values);
      if (response?.success) {
        notifications.show({
          title: "Success",
          message: response.message || "Demo request submitted! We'll contact you to schedule a demo.",
          color: "green",
        });
        demoForm.reset();
      } else {
        throw new Error(response?.message || "Failed to submit demo request");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || error?.message || "Failed to submit demo request. Please try again.",
        color: "red",
      });
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateTotalMonthly = (pkg) => {
    return (
      pkg.perClientCharge +
      pkg.infrastructureCost +
      pkg.supportCharges +
      pkg.newFeatureReportCharges
    );
  };

  return (
    <Box>
      {/* Header with Login Button */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "white",
          borderBottom: "1px solid #e9ecef",
          padding: "1rem 0",
        }}
      >
        <Container size="xl">
          <Group position="apart" align="center">
            <Title order={3} c="blue">
              CareSync
            </Title>
            <Button onClick={() => navigate("/login")} variant="filled" color="blue">
              Login
            </Button>
          </Group>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "4rem 0",
        }}
      >
        <Container size="xl">
          <Stack align="center" spacing="xl">
            <Title order={1} size={48} ta="center" fw={700}>
              Transform Your Home Care Management
            </Title>
            <Text size="xl" ta="center" maw={800}>
              The ultimate scheduling solution designed specifically for home care organizations.
              Streamline caregiver management, optimize scheduling, and deliver exceptional care
              with our comprehensive platform.
            </Text>
            <Group>
              <Button size="lg" variant="white" color="blue" onClick={() => {
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}>
                View Pricing
              </Button>
              <Button
                size="lg"
                variant="white"
                color="blue"
                onClick={() => {
                  document.getElementById("request-demo")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Request Demo
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container size="xl" py={60}>
        <Title order={2} ta="center" mb={40}>
          Powerful Features for Home Care Management
        </Title>
        <Grid>
          <Grid.Col md={4}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack align="center" ta="center">
                <ThemeIcon size={60} radius="md" variant="light" color="blue">
                  <IconCalendar size={30} />
                </ThemeIcon>
                <Title order={4}>Smart Scheduling</Title>
                <Text c="dimmed">
                  Intelligent scheduling system that optimizes caregiver assignments and ensures
                  seamless coverage for all your clients.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col md={4}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack align="center" ta="center">
                <ThemeIcon size={60} radius="md" variant="light" color="green">
                  <IconUsers size={30} />
                </ThemeIcon>
                <Title order={4}>Caregiver Management</Title>
                <Text c="dimmed">
                  Comprehensive tools to manage your caregiver team, track availability, and
                  maintain detailed profiles.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col md={4}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack align="center" ta="center">
                <ThemeIcon size={60} radius="md" variant="light" color="orange">
                  <IconChartBar size={30} />
                </ThemeIcon>
                <Title order={4}>Analytics & Reports</Title>
                <Text c="dimmed">
                  Real-time insights and comprehensive reporting to help you make data-driven
                  decisions and improve operations.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box id="pricing" style={{ backgroundColor: "#f8f9fa", padding: "4rem 0" }}>
        <Container size="xl">
          <Stack align="center" spacing="xl" mb={40}>
            <Title order={2} ta="center">
              Choose Your Plan
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={600}>
              Flexible pricing options designed to scale with your home care organization
            </Text>
          </Stack>

          {isLoadingPackages ? (
            <Text ta="center" py={40}>
              Loading pricing plans...
            </Text>
          ) : packages.length === 0 ? (
            <Text ta="center" py={40} c="dimmed">
              No pricing plans available at the moment. Please contact us for more information.
            </Text>
          ) : (
            <Grid>
              {packages.map((pkg) => (
                <Grid.Col key={pkg.id} md={4} sm={6}>
                  <Card shadow="md" padding="xl" radius="md" withBorder h="100%">
                    <Stack>
                      <Group position="apart" align="flex-start">
                        <Title order={3}>{pkg.name}</Title>
                        {pkg.isActive && <Badge color="green">Active</Badge>}
                      </Group>
                      {pkg.description && (
                        <Text size="sm" c="dimmed">
                          {pkg.description}
                        </Text>
                      )}
                      <Divider />
                      <Stack spacing="xs">
                        {pkg.initialOneTimeCost > 0 && (
                          <Group position="apart">
                            <Text size="sm">One-Time Setup:</Text>
                            <Text fw={600}>{formatCurrency(pkg.initialOneTimeCost)}</Text>
                          </Group>
                        )}
                        {pkg.perClientCharge > 0 && (
                          <Group position="apart">
                            <Text size="sm">Per Client:</Text>
                            <Text fw={600}>{formatCurrency(pkg.perClientCharge)}</Text>
                          </Group>
                        )}
                        {pkg.infrastructureCost > 0 && (
                          <Group position="apart">
                            <Text size="sm">Infrastructure:</Text>
                            <Text fw={600}>{formatCurrency(pkg.infrastructureCost)}</Text>
                          </Group>
                        )}
                        {pkg.supportCharges > 0 && (
                          <Group position="apart">
                            <Text size="sm">Support:</Text>
                            <Text fw={600}>{formatCurrency(pkg.supportCharges)}</Text>
                          </Group>
                        )}
                        {pkg.newFeatureReportCharges > 0 && (
                          <Group position="apart">
                            <Text size="sm">New Features:</Text>
                            <Text fw={600}>{formatCurrency(pkg.newFeatureReportCharges)}</Text>
                          </Group>
                        )}
                        <Divider />
                        <Group position="apart">
                          <Text size="lg" fw={700}>
                            Monthly Total:
                          </Text>
                          <Text size="xl" fw={700} c="blue">
                            {formatCurrency(calculateTotalMonthly(pkg))}
                          </Text>
                        </Group>
                      </Stack>
                      <Button
                        fullWidth
                        mt="md"
                        variant="light"
                        onClick={() => {
                          document.getElementById("request-demo")?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        Get Started
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Request Demo Section */}
      <Box id="request-demo" style={{ padding: "4rem 0" }}>
        <Container size="xl">
          <Grid>
            <Grid.Col md={6}>
              <Stack>
                <Title order={2}>Request a Demo</Title>
                <Text size="lg" c="dimmed">
                  See how CareSync can transform your home care operations. Schedule a
                  personalized demo with our team.
                </Text>
                <Stack spacing="xs" mt="md">
                  <Group>
                    <IconCheck size={20} color="green" />
                    <Text>Live product walkthrough</Text>
                  </Group>
                  <Group>
                    <IconCheck size={20} color="green" />
                    <Text>Customized to your needs</Text>
                  </Group>
                  <Group>
                    <IconCheck size={20} color="green" />
                    <Text>Q&A with our experts</Text>
                  </Group>
                </Stack>
              </Stack>
            </Grid.Col>
            <Grid.Col md={6}>
              <Paper shadow="sm" p="xl" radius="md" withBorder>
                <form onSubmit={demoForm.onSubmit(handleDemoSubmit)}>
                  <Stack>
                    <TextInput
                      label="Full Name"
                      placeholder="John Doe"
                      required
                      {...demoForm.getInputProps("name")}
                    />
                    <TextInput
                      label="Email"
                      placeholder="john@example.com"
                      type="email"
                      required
                      {...demoForm.getInputProps("email")}
                    />
                    <TextInput
                      label="Phone"
                      placeholder="+1 (555) 123-4567"
                      {...demoForm.getInputProps("phone")}
                    />
                    <TextInput
                      label="Company Name"
                      placeholder="Your Company"
                      required
                      {...demoForm.getInputProps("company")}
                    />
                    <TextInput
                      label="Preferred Date/Time"
                      placeholder="e.g., Next Monday at 2 PM"
                      {...demoForm.getInputProps("preferredDate")}
                    />
                    <Textarea
                      label="Additional Notes"
                      placeholder="Tell us about your specific needs..."
                      minRows={3}
                      {...demoForm.getInputProps("message")}
                    />
                    <Button type="submit" fullWidth loading={isSubmittingDemo}>
                      Request Demo
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Contact Us Section */}
      <Box id="contact" style={{ backgroundColor: "#f8f9fa", padding: "4rem 0" }}>
        <Container size="xl">
          <Grid>
            <Grid.Col md={6}>
              <Stack>
                <Title order={2}>Contact Us</Title>
                <Text size="lg" c="dimmed">
                  Have questions? We're here to help. Reach out to our team and we'll get back to
                  you as soon as possible.
                </Text>
                <Stack spacing="md" mt="md">
                  <Group>
                    <ThemeIcon size={40} radius="md" variant="light" color="blue">
                      <IconMail size={20} />
                    </ThemeIcon>
                    <Stack spacing={0}>
                      <Text fw={600}>Email</Text>
                      <Anchor href="mailto:asproducts123@hotmail.com" c="blue">
                       asproducts123@hotmail.com
                      </Anchor>
                    </Stack>
                  </Group>
                  <Group>
                    <ThemeIcon size={40} radius="md" variant="light" color="green">
                      <IconPhone size={20} />
                    </ThemeIcon>
                    <Stack spacing={0}>
                      <Text fw={600}>Phone</Text>
                      <Anchor href="tel:+1-555-123-4567" c="blue">
                        +1 (555) 123-4567
                      </Anchor>
                    </Stack>
                  </Group>
                </Stack>
              </Stack>
            </Grid.Col>
            <Grid.Col md={6}>
              <Paper shadow="sm" p="xl" radius="md" withBorder>
                <form onSubmit={contactForm.onSubmit(handleContactSubmit)}>
                  <Stack>
                    <TextInput
                      label="Name"
                      placeholder="Your name"
                      required
                      {...contactForm.getInputProps("name")}
                    />
                    <TextInput
                      label="Email"
                      placeholder="your.email@example.com"
                      type="email"
                      required
                      {...contactForm.getInputProps("email")}
                    />
                    <TextInput
                      label="Phone"
                      placeholder="+1 (555) 123-4567"
                      {...contactForm.getInputProps("phone")}
                    />
                    <Textarea
                      label="Message"
                      placeholder="How can we help you?"
                      required
                      minRows={4}
                      {...contactForm.getInputProps("message")}
                    />
                    <Button type="submit" fullWidth loading={isSubmittingContact}>
                      Send Message
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box style={{ backgroundColor: "#2c3e50", color: "white", padding: "2rem 0" }}>
        <Container size="xl">
          <Group position="apart">
            <Text>© {new Date().getFullYear()} CareSync. All rights reserved.</Text>
            <Group>
              <Anchor href="#pricing" c="white" onClick={(e) => {
                e.preventDefault();
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Pricing
              </Anchor>
              <Anchor href="#contact" c="white" onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Contact
              </Anchor>
              <Button variant="subtle" color="white" onClick={() => navigate("/login")}>
                Login
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;

