import { useState } from "react";
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
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { 
  IconCalendar, 
  IconUsers, 
  IconPhone, 
  IconMail, 
  IconCheck,
  IconDashboard,
  IconCash,
  IconReportAnalytics,
  IconFileInvoice,
  IconClipboardCheck,
  IconBell,
  IconClock,
  IconMapPin,
} from "@tabler/icons";
import { landingService } from "core/services";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
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


  return (
    <Box>
      {/* Enhanced Navigation Header */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "white",
          borderBottom: "1px solid #e9ecef",
          padding: "1rem 0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Container size="xl">
          <Group position="apart" align="center">
            {/* Logo and Brand */}
            <Group spacing="xs">
              <IconCalendar size={32} color="#228be6" />
              <Title order={2} c="blue" style={{ fontWeight: 700 }}>
                CareSync Scheduler
              </Title>
            </Group>

            {/* Navigation Menu */}
            <Group spacing="xs" style={{ display: window.innerWidth > 768 ? 'flex' : 'none' }}>
              <Button
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                style={{ 
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                styles={(theme) => ({
                  root: {
                    '&:hover': {
                      backgroundColor: theme.colors.blue[0],
                      color: theme.colors.blue[7],
                    }
                  }
                })}
              >
                About
              </Button>
              <Button
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                style={{ 
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                styles={(theme) => ({
                  root: {
                    '&:hover': {
                      backgroundColor: theme.colors.blue[0],
                      color: theme.colors.blue[7],
                    }
                  }
                })}
              >
                Features
              </Button>
              <Button
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                style={{ 
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                styles={(theme) => ({
                  root: {
                    '&:hover': {
                      backgroundColor: theme.colors.blue[0],
                      color: theme.colors.blue[7],
                    }
                  }
                })}
              >
                Contact
              </Button>
            </Group>

            {/* Live Demo Button */}
            <Button onClick={() => navigate("/login")} variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} size="md">
              Live Demo
            </Button>
          </Group>
        </Container>
      </Box>

      {/* Enhanced Hero Section with Animated Background */}
      <Box
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          color: "white",
          padding: "5rem 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background elements */}
        <Box
          style={{
            position: "absolute",
            top: "-50%",
            right: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <Box
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        
        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Stack align="center" spacing="xl">
            <Badge size="lg" variant="light" color="white" style={{ color: "#667eea" }}>
              🚀 The Future of Home Care Management
            </Badge>
            <Title order={1} size={56} ta="center" fw={800} style={{ lineHeight: 1.2 }}>
              Transform Your Home Care
              <br />
              <Text component="span" variant="gradient" gradient={{ from: 'yellow', to: 'orange', deg: 45 }}>
                Management Today
              </Text>
            </Title>
            <Text size="xl" ta="center" maw={900} fw={400} style={{ lineHeight: 1.6 }}>
              The ultimate scheduling solution designed specifically for home care organizations.
              Streamline caregiver management, optimize scheduling, billing, payroll, and deliver 
              exceptional care with our comprehensive all-in-one platform.
            </Text>
            <Group spacing="lg" mt="lg">
              <Button
                size="xl"
                variant="filled"
                leftIcon={<IconCalendar size={24} />}
                onClick={() => {
                  document.getElementById("request-demo")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  backgroundColor: "#ffffff",
                  color: "#667eea",
                  border: "2px solid #ffffff",
                  fontWeight: 700,
                }}
                styles={(theme) => ({
                  root: {
                    '&:hover': {
                      backgroundColor: "#f8f9fa",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    }
                  }
                })}
              >
                Request Demo
              </Button>
            </Group>
          </Stack>
        </Container>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
        `}</style>
      </Box>

      {/* About Section */}
      <Box id="about" style={{ backgroundColor: "#fff", padding: "4rem 0" }}>
        <Container size="xl">
          <Grid align="center" gutter="xl">
            <Grid.Col md={6}>
              <Stack spacing="lg">
                <Badge size="lg" variant="dot" color="blue">About Scheduler</Badge>
                <Title order={2} size={42} fw={700}>
                  Your Complete Home Care Management Solution
                </Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  Scheduler is a comprehensive platform built from the ground up to address the 
                  unique challenges of home care organizations. We understand that managing caregivers, 
                  clients, schedules, billing, and payroll can be overwhelming. That's why we've created 
                  an all-in-one solution that streamlines every aspect of your operations.
                </Text>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  With powerful features like real-time dashboards, automated billing, wage management, 
                  comprehensive reporting, and more - you can focus on what matters most: delivering 
                  exceptional care to your clients.
                </Text>
                <Group>
                  <Button 
                    size="lg" 
                    variant="gradient" 
                    gradient={{ from: 'blue', to: 'cyan' }}
                    onClick={() => {
                      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Explore Features
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col md={6}>
              <Paper 
                shadow="xl" 
                p="xl" 
                radius="lg"
                style={{ 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Stack spacing="xl">
                  <Group>
                    <ThemeIcon size={50} radius="md" variant="white" color="blue">
                      <IconCheck size={30} />
                    </ThemeIcon>
                    <div>
                      <Text size="xl" fw={700}>10,000+</Text>
                      <Text size="sm">Tasks Scheduled</Text>
                    </div>
                  </Group>
                  <Group>
                    <ThemeIcon size={50} radius="md" variant="white" color="blue">
                      <IconUsers size={30} />
                    </ThemeIcon>
                    <div>
                      <Text size="xl" fw={700}>500+</Text>
                      <Text size="sm">Active Users</Text>
                    </div>
                  </Group>
                  <Group>
                    <ThemeIcon size={50} radius="md" variant="white" color="blue">
                      <IconClock size={30} />
                    </ThemeIcon>
                    <div>
                      <Text size="xl" fw={700}>24/7</Text>
                      <Text size="sm">Support Available</Text>
                    </div>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Features Section */}
      <Box id="features" style={{ backgroundColor: "#f8f9fa", padding: "5rem 0" }}>
        <Container size="xl">
          <Stack align="center" spacing="md" mb={50}>
            <Badge size="lg" variant="dot" color="blue">Features</Badge>
            <Title order={2} ta="center" size={42} fw={700}>
              Everything You Need in One Platform
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={700}>
              From scheduling to payroll, we've got you covered with powerful features 
              designed specifically for home care organizations.
            </Text>
          </Stack>
          
          <Grid gutter="lg">
            <Grid.Col md={4} sm={6}>
              <Card 
                shadow="md" 
                padding="xl" 
                radius="lg" 
                withBorder 
                h="100%"
                style={{ 
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  "&:hover": { transform: "translateY(-5px)" }
                }}
              >
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                    <IconDashboard size={35} />
                  </ThemeIcon>
                  <Title order={4}>Real-Time Dashboard</Title>
                  <Text c="dimmed" size="sm">
                    Get instant insights with live dashboards showing tasks, schedules, 
                    staff availability, and key metrics at a glance.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col md={4} sm={6}>
              <Card shadow="md" padding="xl" radius="lg" withBorder h="100%">
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'blue' }}>
                    <IconCalendar size={35} />
                  </ThemeIcon>
                  <Title order={4}>Smart Scheduling</Title>
                  <Text c="dimmed" size="sm">
                    Intelligent scheduling system that optimizes caregiver assignments 
                    and ensures seamless coverage for all clients.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col md={4} sm={6}>
              <Card shadow="md" padding="xl" radius="lg" withBorder h="100%">
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from: 'teal', to: 'green' }}>
                    <IconUsers size={35} />
                  </ThemeIcon>
                  <Title order={4}>Team Management</Title>
                  <Text c="dimmed" size="sm">
                    Manage clients, service providers, and staff with comprehensive 
                    profiles, documents, and availability tracking.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col md={4} sm={6}>
              <Card shadow="md" padding="xl" radius="lg" withBorder h="100%">
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from: 'orange', to: 'red' }}>
                    <IconFileInvoice size={35} />
                  </ThemeIcon>
                  <Title order={4}>Billing Management</Title>
                  <Text c="dimmed" size="sm">
                    Automated billing generation, invoice tracking, payment status 
                    monitoring, and comprehensive billing reports.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col md={4} sm={6}>
              <Card shadow="md" padding="xl" radius="lg" withBorder h="100%">
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from: 'pink', to: 'purple' }}>
                    <IconCash size={35} />
                  </ThemeIcon>
                  <Title order={4}>Wage Management</Title>
                  <Text c="dimmed" size="sm">
                    Streamlined payroll processing, automatic wage calculations, 
                    payment tracking, and detailed wage reports.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col md={4} sm={6}>
              <Card shadow="md" padding="xl" radius="lg" withBorder h="100%">
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'grape' }}>
                    <IconReportAnalytics size={35} />
                  </ThemeIcon>
                  <Title order={4}>Advanced Reports</Title>
                  <Text c="dimmed" size="sm">
                    Comprehensive reporting tools for billing, payroll, attendance, 
                    and performance analytics with export capabilities.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col md={4} sm={6}>
              <Card shadow="md" padding="xl" radius="lg" withBorder h="100%">
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from: 'lime', to: 'teal' }}>
                    <IconClipboardCheck size={35} />
                  </ThemeIcon>
                  <Title order={4}>Attendance Tracking</Title>
                  <Text c="dimmed" size="sm">
                    Real-time check-in/check-out tracking, attendance logs, 
                    and automated time sheet generation for accurate records.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col md={4} sm={6}>
              <Card shadow="md" padding="xl" radius="lg" withBorder h="100%">
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from: 'yellow', to: 'orange' }}>
                    <IconMapPin size={35} />
                  </ThemeIcon>
                  <Title order={4}>Multi-Franchise Support</Title>
                  <Text c="dimmed" size="sm">
                    Manage multiple locations seamlessly with franchise-specific 
                    settings, staff assignments, and reporting.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col md={4} sm={6}>
              <Card shadow="md" padding="xl" radius="lg" withBorder h="100%" style={{ border: "2px dashed #dee2e6" }}>
                <Stack align="center" ta="center" spacing="md">
                  <ThemeIcon size={70} radius="md" variant="light" color="gray">
                    <IconBell size={35} />
                  </ThemeIcon>
                  <Title order={4}>Complaint Management</Title>
                  <Badge color="yellow" size="sm">Coming Soon</Badge>
                  <Text c="dimmed" size="sm">
                    Track and manage client complaints, feedback, and resolution 
                    workflows for improved service quality.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Request Demo Section */}
      <Box 
        id="request-demo" 
        style={{ 
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          padding: "5rem 0" 
        }}
      >
        <Container size="xl">
          <Grid align="center" gutter="xl">
            <Grid.Col md={6}>
              <Stack spacing="lg">
                <Badge size="lg" variant="dot" color="blue">Request Demo</Badge>
                <Title order={2} size={42} fw={700}>
                  See Scheduler in Action
                </Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  Experience firsthand how Scheduler can transform your home care operations. 
                  Schedule a personalized demo with our team and discover all the features.
                </Text>
                
                <Stack spacing="md" mt="lg">
                  <Group>
                    <ThemeIcon size={40} radius="md" variant="light" color="green">
                      <IconCheck size={22} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600}>Live Product Walkthrough</Text>
                      <Text size="sm" c="dimmed">See all features in real-time</Text>
                    </div>
                  </Group>
                  <Group>
                    <ThemeIcon size={40} radius="md" variant="light" color="blue">
                      <IconCheck size={22} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600}>Customized to Your Needs</Text>
                      <Text size="sm" c="dimmed">Tailored demo for your organization</Text>
                    </div>
                  </Group>
                  <Group>
                    <ThemeIcon size={40} radius="md" variant="light" color="purple">
                      <IconCheck size={22} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600}>Q&A with Our Experts</Text>
                      <Text size="sm" c="dimmed">Get all your questions answered</Text>
                    </div>
                  </Group>
                  <Group>
                    <ThemeIcon size={40} radius="md" variant="light" color="orange">
                      <IconCheck size={22} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600}>No Commitment Required</Text>
                      <Text size="sm" c="dimmed">Free demo with no obligations</Text>
                    </div>
                  </Group>
                </Stack>
              </Stack>
            </Grid.Col>
            
            <Grid.Col md={6}>
              <Paper shadow="xl" p="xl" radius="lg" withBorder style={{ backgroundColor: "white" }}>
                <Stack spacing="md" mb="xl">
                  <Title order={3}>Schedule Your Demo</Title>
                  <Text size="sm" c="dimmed">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </Text>
                </Stack>
                
                <form onSubmit={demoForm.onSubmit(handleDemoSubmit)}>
                  <Stack spacing="md">
                    <TextInput
                      label="Full Name"
                      placeholder="John Doe"
                      required
                      size="md"
                      {...demoForm.getInputProps("name")}
                    />
                    <TextInput
                      label="Email Address"
                      placeholder="john@example.com"
                      type="email"
                      required
                      size="md"
                      {...demoForm.getInputProps("email")}
                    />
                    <TextInput
                      label="Phone Number"
                      placeholder="+1 (555) 123-4567"
                      size="md"
                      {...demoForm.getInputProps("phone")}
                    />
                    <TextInput
                      label="Company Name"
                      placeholder="Your Company"
                      required
                      size="md"
                      {...demoForm.getInputProps("company")}
                    />
                    <TextInput
                      label="Preferred Date/Time"
                      placeholder="e.g., Next Monday at 2 PM"
                      size="md"
                      {...demoForm.getInputProps("preferredDate")}
                    />
                    <Textarea
                      label="Additional Notes (Optional)"
                      placeholder="Tell us about your specific needs and requirements..."
                      minRows={3}
                      size="md"
                      {...demoForm.getInputProps("message")}
                    />
                    <Button 
                      type="submit" 
                      fullWidth 
                      size="lg"
                      loading={isSubmittingDemo}
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                      leftIcon={<IconCalendar size={20} />}
                    >
                      Request Demo Now
                    </Button>
                    <Text size="xs" c="dimmed" ta="center">
                      We respect your privacy. Your information will never be shared.
                    </Text>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Contact Us Section */}
      <Box id="contact" style={{ backgroundColor: "#fff", padding: "5rem 0" }}>
        <Container size="xl">
          <Stack align="center" spacing="md" mb={50}>
            <Badge size="lg" variant="dot" color="blue">Contact Us</Badge>
            <Title order={2} ta="center" size={42} fw={700}>
              Get in Touch
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={700}>
              Have questions or need assistance? Our team is here to help. 
              Reach out and we'll get back to you as soon as possible.
            </Text>
          </Stack>
          
          <Grid align="center" gutter="xl">
            <Grid.Col md={5}>
              <Stack spacing="xl">
                <Paper 
                  p="xl" 
                  radius="lg" 
                  style={{ 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white"
                  }}
                >
                  <Stack spacing="xl">
                    <div>
                      <Title order={4} c="white" mb="md">Contact Information</Title>
                      <Text size="sm" c="gray.3">
                        We're available 24/7 to answer your questions and provide support.
                      </Text>
                    </div>
                    
                    <Group>
                      <ThemeIcon size={50} radius="md" variant="white" color="blue">
                        <IconMail size={26} />
                      </ThemeIcon>
                      <Stack spacing={2}>
                        <Text fw={600} size="sm">Email Us</Text>
                        <Anchor href="mailto:asproducts123@hotmail.com" c="white" size="sm">
                          asproducts123@hotmail.com
                        </Anchor>
                      </Stack>
                    </Group>
                    
                    <Group>
                      <ThemeIcon size={50} radius="md" variant="white" color="blue">
                        <IconPhone size={26} />
                      </ThemeIcon>
                      <Stack spacing={2}>
                        <Text fw={600} size="sm">Whatsapp Us</Text>
                        <Anchor href="tel:+92 (346) 5315102" c="white" size="sm">
                          +92 (346) 5315102
                        </Anchor>
                      </Stack>
                    </Group>
                    
                    <Group>
                      <ThemeIcon size={50} radius="md" variant="white" color="blue">
                        <IconClock size={26} />
                      </ThemeIcon>
                      <Stack spacing={2}>
                        <Text fw={600} size="sm">Business Hours</Text>
                        <Text size="sm" c="gray.3">24/7 Support Available</Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Paper>
                
                <Text size="sm" c="dimmed" ta="center">
                  Need immediate assistance? Try our <strong>Live Demo</strong> to explore features instantly!
                </Text>
              </Stack>
            </Grid.Col>
            
            <Grid.Col md={7}>
              <Paper shadow="xl" p="xl" radius="lg" withBorder style={{ backgroundColor: "white" }}>
                <Stack spacing="md" mb="xl">
                  <Title order={3}>Send us a Message</Title>
                  <Text size="sm" c="dimmed">
                    Fill out the form and our team will respond within 24 hours.
                  </Text>
                </Stack>
                
                <form onSubmit={contactForm.onSubmit(handleContactSubmit)}>
                  <Stack spacing="md">
                    <TextInput
                      label="Your Name"
                      placeholder="John Doe"
                      required
                      size="md"
                      {...contactForm.getInputProps("name")}
                    />
                    <TextInput
                      label="Email Address"
                      placeholder="your.email@example.com"
                      type="email"
                      required
                      size="md"
                      {...contactForm.getInputProps("email")}
                    />
                    <TextInput
                      label="Phone Number"
                      placeholder="+1 (555) 123-4567"
                      size="md"
                      {...contactForm.getInputProps("phone")}
                    />
                    <Textarea
                      label="Your Message"
                      placeholder="How can we help you?"
                      required
                      minRows={5}
                      size="md"
                      {...contactForm.getInputProps("message")}
                    />
                    <Button 
                      type="submit" 
                      fullWidth 
                      size="lg"
                      loading={isSubmittingContact}
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                      leftIcon={<IconMail size={20} />}
                    >
                      Send Message
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Footer */}
      <Box style={{ background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)", color: "white", padding: "3rem 0" }}>
        <Container size="xl">
          <Grid gutter="xl">
            <Grid.Col md={4}>
              <Stack spacing="md">
                <Group spacing="xs">
                  <IconCalendar size={32} color="#3498db" />
                  <Title order={3} c="white">
                    CareSync Scheduler
                  </Title>
                </Group>
                <Text c="gray.4" size="sm">
                  Your complete home care management solution. Streamline operations, 
                  optimize scheduling, and deliver exceptional care.
                </Text>
                <Group spacing="xs">
                  <Text c="gray.4" size="sm">© {new Date().getFullYear()} Scheduler. All rights reserved.</Text>
                </Group>
              </Stack>
            </Grid.Col>
            
            <Grid.Col md={4}>
              <Stack spacing="md">
                <Title order={5} c="white">Quick Links</Title>
                <Stack spacing="xs">
                  <Anchor 
                    c="gray.4" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    About Us
                  </Anchor>
                  <Anchor 
                    c="gray.4" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Features
                  </Anchor>
                  <Anchor 
                    c="gray.4" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Contact
                  </Anchor>
                </Stack>
              </Stack>
            </Grid.Col>
            
            <Grid.Col md={4}>
              <Stack spacing="md">
                <Title order={5} c="white">Get Started</Title>
                <Text c="gray.4" size="sm">
                  Ready to transform your home care management?
                </Text>
                <Button 
                  variant="gradient" 
                  gradient={{ from: 'blue', to: 'cyan' }}
                  fullWidth
                  size="md"
                  onClick={() => navigate("/login")}
                >
                  Try Live Demo
                </Button>
                <Text c="gray.5" size="xs" ta="center">
                  No credit card required • Free trial available
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;

