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

const CareSyncHomeCarePage = () => {
  const navigate = useNavigate();
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);

  const contactForm = useForm({
    initialValues: { name: "", email: "", phone: "", message: "" },
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
      } else throw new Error(response?.message || "Failed to submit contact form");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || error?.message || "Failed to submit. Please try again.",
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
      } else throw new Error(response?.message || "Failed to submit demo request");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || error?.message || "Failed to submit demo. Please try again.",
        color: "red",
      });
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          color: "white",
          padding: "5rem 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box style={{ position: "absolute", top: "-50%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.1)", animation: "float 6s ease-in-out infinite" }} />
        <Box style={{ position: "absolute", bottom: "-30%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.08)", animation: "float 8s ease-in-out infinite reverse" }} />
        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Stack align="center" spacing="xl">
            <Badge size="lg" variant="light" color="white" style={{ color: "#667eea" }}>
              CareSync Home Care
            </Badge>
            <Title order={1} size={56} ta="center" fw={800} style={{ lineHeight: 1.2 }}>
              Transform Your Home Care
              <br />
              <Text component="span" variant="gradient" gradient={{ from: "yellow", to: "orange", deg: 45 }}>
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
                onClick={() => document.getElementById("request-demo")?.scrollIntoView({ behavior: "smooth" })}
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)", backgroundColor: "#fff", color: "#667eea", border: "2px solid #fff", fontWeight: 700 }}
              >
                Request Demo
              </Button>
              <Button size="xl" variant="outline" style={{ borderColor: "white", color: "white" }} onClick={() => navigate("/login")}>
                Live Demo
              </Button>
            </Group>
          </Stack>
        </Container>
        <style>{`@keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }`}</style>
      </Box>

      {/* About Section */}
      <Box id="about" style={{ backgroundColor: "#fff", padding: "4rem 0" }}>
        <Container size="xl">
          <Grid align="center" gutter="xl">
            <Grid.Col md={6}>
              <Stack spacing="lg">
                <Badge size="lg" variant="dot" color="blue">About CareSync Home Care</Badge>
                <Title order={2} size={42} fw={700}>Your Complete Home Care Management Solution</Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  A comprehensive platform built for home care organizations. Manage caregivers, clients, schedules, billing, and payroll in one place—with real-time dashboards, automated billing, wage management, and reporting.
                </Text>
                <Button size="lg" variant="gradient" gradient={{ from: "blue", to: "cyan" }} onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                  Explore Features
                </Button>
              </Stack>
            </Grid.Col>
            <Grid.Col md={6}>
              <Paper shadow="xl" p="xl" radius="lg" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Stack spacing="xl">
                  <Group><ThemeIcon size={50} radius="md" variant="white" color="blue"><IconCheck size={30} /></ThemeIcon><div><Text size="xl" fw={700}>10,000+</Text><Text size="sm">Tasks Scheduled</Text></div></Group>
                  <Group><ThemeIcon size={50} radius="md" variant="white" color="blue"><IconUsers size={30} /></ThemeIcon><div><Text size="xl" fw={700}>500+</Text><Text size="sm">Active Users</Text></div></Group>
                  <Group><ThemeIcon size={50} radius="md" variant="white" color="blue"><IconClock size={30} /></ThemeIcon><div><Text size="xl" fw={700}>24/7</Text><Text size="sm">Support</Text></div></Group>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" style={{ backgroundColor: "#f8f9fa", padding: "5rem 0" }}>
        <Container size="xl">
          <Stack align="center" spacing="md" mb={50}>
            <Badge size="lg" variant="dot" color="blue">Features</Badge>
            <Title order={2} ta="center" size={42} fw={700}>Everything You Need in One Platform</Title>
            <Text size="lg" c="dimmed" ta="center" maw={700}>From scheduling to payroll—powerful features for home care organizations.</Text>
          </Stack>
          <Grid gutter="lg">
            {[
              { icon: IconDashboard, title: "Real-Time Dashboard", desc: "Live dashboards for tasks, schedules, staff availability, and key metrics.", from: "blue", to: "cyan" },
              { icon: IconCalendar, title: "Smart Scheduling", desc: "Intelligent scheduling and caregiver assignments for seamless coverage.", from: "indigo", to: "blue" },
              { icon: IconUsers, title: "Team Management", desc: "Manage clients, service providers, and staff with profiles and availability.", from: "teal", to: "green" },
              { icon: IconFileInvoice, title: "Billing Management", desc: "Automated billing, invoices, payment status, and billing reports.", from: "orange", to: "red" },
              { icon: IconCash, title: "Wage Management", desc: "Payroll, wage calculations, payment tracking, and wage reports.", from: "pink", to: "purple" },
              { icon: IconReportAnalytics, title: "Advanced Reports", desc: "Reporting for billing, payroll, attendance, and analytics.", from: "violet", to: "grape" },
              { icon: IconClipboardCheck, title: "Attendance Tracking", desc: "Check-in/out, attendance logs, and time sheet generation.", from: "lime", to: "teal" },
              { icon: IconMapPin, title: "Multi-Franchise Support", desc: "Multiple locations with franchise settings and reporting.", from: "yellow", to: "orange" },
              { icon: IconBell, title: "Complaint Management", desc: "Track complaints and resolution workflows.", from: "gray", to: "gray", comingSoon: true },
            ].map(({ icon: Icon, title, desc, from, to, comingSoon }) => (
              <Grid.Col key={title} md={4} sm={6}>
                <Card shadow="md" padding="xl" radius="lg" withBorder h="100%">
                  <Stack align="center" ta="center" spacing="md">
                    <ThemeIcon size={70} radius="md" variant="gradient" gradient={{ from, to }}>
                      <Icon size={35} />
                    </ThemeIcon>
                    <Title order={4}>{title}</Title>
                    {comingSoon && <Badge color="yellow" size="sm">Coming Soon</Badge>}
                    <Text c="dimmed" size="sm">{desc}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Request Demo Section */}
      <Box id="request-demo" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", padding: "5rem 0" }}>
        <Container size="xl">
          <Grid align="center" gutter="xl">
            <Grid.Col md={6}>
              <Stack spacing="lg">
                <Badge size="lg" variant="dot" color="blue">Request Demo</Badge>
                <Title order={2} size={42} fw={700}>See CareSync Home Care in Action</Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  Schedule a personalized demo and discover how we can transform your home care operations.
                </Text>
                <Stack spacing="md" mt="lg">
                  {["Live Product Walkthrough", "Customized to Your Needs", "Q&A with Our Experts", "No Commitment Required"].map((t, i) => (
                    <Group key={t}><ThemeIcon size={40} radius="md" variant="light" color={["green", "blue", "purple", "orange"][i]}><IconCheck size={22} /></ThemeIcon><div><Text fw={600}>{t}</Text></div></Group>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
            <Grid.Col md={6}>
              <Paper shadow="xl" p="xl" radius="lg" withBorder style={{ backgroundColor: "white" }}>
                <Stack spacing="md" mb="xl">
                  <Title order={3}>Schedule Your Demo</Title>
                  <Text size="sm" c="dimmed">Fill out the form and we'll get back within 24 hours.</Text>
                </Stack>
                <form onSubmit={demoForm.onSubmit(handleDemoSubmit)}>
                  <Stack spacing="md">
                    <TextInput label="Full Name" placeholder="John Doe" required size="md" {...demoForm.getInputProps("name")} />
                    <TextInput label="Email" placeholder="john@example.com" type="email" required size="md" {...demoForm.getInputProps("email")} />
                    <TextInput label="Phone" placeholder="+1 (555) 123-4567" size="md" {...demoForm.getInputProps("phone")} />
                    <TextInput label="Company" placeholder="Your Company" required size="md" {...demoForm.getInputProps("company")} />
                    <TextInput label="Preferred Date/Time" placeholder="e.g., Next Monday 2 PM" size="md" {...demoForm.getInputProps("preferredDate")} />
                    <Textarea label="Notes (Optional)" placeholder="Your needs..." minRows={3} size="md" {...demoForm.getInputProps("message")} />
                    <Button type="submit" fullWidth size="lg" loading={isSubmittingDemo} variant="gradient" gradient={{ from: "blue", to: "cyan" }} leftIcon={<IconCalendar size={20} />}>Request Demo</Button>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box id="contact" style={{ backgroundColor: "#fff", padding: "5rem 0" }}>
        <Container size="xl">
          <Stack align="center" spacing="md" mb={50}>
            <Badge size="lg" variant="dot" color="blue">Contact</Badge>
            <Title order={2} ta="center" size={42} fw={700}>Get in Touch</Title>
            <Text size="lg" c="dimmed" ta="center" maw={700}>Questions or need assistance? We're here to help.</Text>
          </Stack>
          <Grid align="center" gutter="xl">
            <Grid.Col md={5}>
              <Paper p="xl" radius="lg" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <Stack spacing="xl">
                  <Title order={4} c="white" mb="md">Contact Information</Title>
                  <Group><ThemeIcon size={50} radius="md" variant="white" color="blue"><IconMail size={26} /></ThemeIcon><Stack spacing={2}><Text fw={600} size="sm">Email</Text><Anchor href="mailto:admin@caresynx.com" c="white" size="sm">admin@caresynx.com</Anchor></Stack></Group>
                  <Group><ThemeIcon size={50} radius="md" variant="white" color="blue"><IconPhone size={26} /></ThemeIcon><Stack spacing={2}><Text fw={600} size="sm">WhatsApp</Text><Anchor href="tel:+923465315102" c="white" size="sm">+92 (346) 5315102</Anchor></Stack></Group>
                  <Group><ThemeIcon size={50} radius="md" variant="white" color="blue"><IconClock size={26} /></ThemeIcon><Stack spacing={2}><Text fw={600} size="sm">Support</Text><Text size="sm" c="gray.3">Available when you need us</Text></Stack></Group>
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col md={7}>
              <Paper shadow="xl" p="xl" radius="lg" withBorder>
                <Stack spacing="md" mb="xl"><Title order={3}>Send a Message</Title><Text size="sm" c="dimmed">We'll respond within 24 hours.</Text></Stack>
                <form onSubmit={contactForm.onSubmit(handleContactSubmit)}>
                  <Stack spacing="md">
                    <TextInput label="Your Name" placeholder="John Doe" required size="md" {...contactForm.getInputProps("name")} />
                    <TextInput label="Email" placeholder="your.email@example.com" type="email" required size="md" {...contactForm.getInputProps("email")} />
                    <TextInput label="Phone" placeholder="+1 (555) 123-4567" size="md" {...contactForm.getInputProps("phone")} />
                    <Textarea label="Message" placeholder="How can we help?" required minRows={5} size="md" {...contactForm.getInputProps("message")} />
                    <Button type="submit" fullWidth size="lg" loading={isSubmittingContact} variant="gradient" gradient={{ from: "blue", to: "cyan" }} leftIcon={<IconMail size={20} />}>Send Message</Button>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default CareSyncHomeCarePage;
