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
  IconArrowRight,
  IconSend,
} from "@tabler/icons";
import { landingService } from "core/services";
import { useNavigate } from "react-router-dom";
import {
  DashboardMockup,
  HowItWorks,
  StatsRings,
  BeforeAfter,
} from "../components/Infographics";

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
    initialValues: { name: "", email: "", phone: "", company: "", preferredDate: "", message: "" },
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
        notifications.show({ title: "Success", message: response.message || "Thank you! We'll get back to you soon.", color: "green" });
        contactForm.reset();
      } else throw new Error(response?.message || "Failed to submit");
    } catch (error) {
      notifications.show({ title: "Error", message: error?.response?.data?.message || error?.message || "Failed to submit. Please try again.", color: "red" });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleDemoSubmit = async (values) => {
    try {
      setIsSubmittingDemo(true);
      const response = await landingService.requestDemo(values);
      if (response?.success) {
        notifications.show({ title: "Success", message: response.message || "Demo request submitted! We'll contact you soon.", color: "green" });
        demoForm.reset();
      } else throw new Error(response?.message || "Failed to submit");
    } catch (error) {
      notifications.show({ title: "Error", message: error?.response?.data?.message || error?.message || "Failed to submit. Please try again.", color: "red" });
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  const features = [
    { icon: IconDashboard, title: "Real-Time Dashboard", desc: "Live dashboards for tasks, schedules, staff availability, and key metrics.", from: "#6366f1", to: "#06b6d4" },
    { icon: IconCalendar, title: "Smart Scheduling", desc: "Intelligent scheduling and caregiver assignments for seamless coverage.", from: "#6366f1", to: "#8b5cf6" },
    { icon: IconUsers, title: "Team Management", desc: "Manage clients, service providers, and staff with profiles and availability.", from: "#06b6d4", to: "#10b981" },
    { icon: IconFileInvoice, title: "Billing Management", desc: "Automated billing, invoices, payment status, and billing reports.", from: "#f59e0b", to: "#ef4444" },
    { icon: IconCash, title: "Wage Management", desc: "Payroll, wage calculations, payment tracking, and wage reports.", from: "#8b5cf6", to: "#ec4899" },
    { icon: IconReportAnalytics, title: "Advanced Reports", desc: "Reporting for billing, payroll, attendance, and analytics.", from: "#8b5cf6", to: "#6366f1" },
    { icon: IconClipboardCheck, title: "Attendance Tracking", desc: "Check-in/out, attendance logs, and time sheet generation.", from: "#10b981", to: "#06b6d4" },
    { icon: IconMapPin, title: "Multi-Franchise Support", desc: "Multiple locations with franchise settings and reporting.", from: "#f59e0b", to: "#f97316" },
    { icon: IconBell, title: "Complaint Management", desc: "Track complaints and resolution workflows.", comingSoon: true, from: "#94a3b8", to: "#cbd5e1" },
  ];

  const inputStyles = {
    input: {
      borderColor: "rgba(99, 102, 241, 0.15)",
      "&:focus": { borderColor: "#6366f1" },
    },
  };

  return (
    <Box>
      {/* ===== HERO ===== */}
      <Box
        style={{
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a1a2e 100%)",
          color: "white",
          padding: "5rem 0 4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box className="landing-float" style={{ position: "absolute", top: "-30%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box className="landing-float-reverse" style={{ position: "absolute", bottom: "-20%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box className="landing-spin-slow" style={{ position: "absolute", top: "20%", left: "75%", width: 60, height: 60, border: "2px solid rgba(245,158,11,0.2)", borderRadius: 12, pointerEvents: "none" }} />
        <Box className="landing-dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }} />

        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Grid align="center" gutter={48}>
            <Grid.Col md={6}>
              <Stack spacing="xl">
                <Badge
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "#6366f1", to: "#8b5cf6" }}
                  radius="xl"
                  styles={{ root: { padding: "12px 24px", textTransform: "none", fontSize: 14, fontWeight: 600, width: "fit-content" } }}
                >
                  CareSync Home Care
                </Badge>
                <Title order={1} fw={900} style={{ fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.1 }}>
                  Transform Your Home Care{" "}
                  <span className="landing-gradient-text-warm">Management Today</span>
                </Title>
                <Text size="lg" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontSize: 18, maxWidth: 520 }}>
                  The ultimate scheduling solution designed specifically for home care organizations.
                  Streamline caregiver management, optimize scheduling, billing, payroll, and deliver
                  exceptional care with our comprehensive all-in-one platform.
                </Text>
                <Group spacing="lg">
                  <Button
                    className="landing-btn-lift"
                    size="xl"
                    variant="white"
                    color="dark"
                    radius="xl"
                    leftIcon={<IconCalendar size={22} />}
                    onClick={() => document.getElementById("request-demo")?.scrollIntoView({ behavior: "smooth" })}
                    styles={{ root: { fontWeight: 700, fontSize: 16, height: 56, padding: "0 32px" } }}
                  >
                    Request Demo
                  </Button>
                  <Button
                    className="landing-btn-lift"
                    size="xl"
                    variant="outline"
                    radius="xl"
                    onClick={() => navigate("/login")}
                    styles={{
                      root: {
                        fontWeight: 700, fontSize: 16, height: 56, padding: "0 32px",
                        borderColor: "rgba(255,255,255,0.3)", color: "white",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.5)" },
                      },
                    }}
                  >
                    Live Demo
                  </Button>
                </Group>

                {/* Trust strip */}
                <Group spacing="xl" mt="md">
                  {[
                    { number: "10K+", label: "Tasks Scheduled" },
                    { number: "500+", label: "Active Users" },
                    { number: "99%", label: "Uptime" },
                  ].map(({ number, label }) => (
                    <Box key={label}>
                      <Text fw={900} size="xl" style={{ color: "white", lineHeight: 1 }}>{number}</Text>
                      <Text size="xs" style={{ color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</Text>
                    </Box>
                  ))}
                </Group>
              </Stack>
            </Grid.Col>

            {/* Right – Dashboard Mockup */}
            <Grid.Col md={6}>
              <DashboardMockup />
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* ===== STATS RINGS INFOGRAPHIC ===== */}
      <StatsRings />

      {/* ===== ABOUT SECTION ===== */}
      <Box id="about" style={{ backgroundColor: "#fff", padding: "5rem 0", position: "relative", overflow: "hidden" }}>
        <Box className="landing-pulse" style={{ position: "absolute", top: "-10%", right: "-5%", width: "30%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Grid align="center" gutter={48}>
            <Grid.Col md={6}>
              <Stack spacing="lg">
                <Badge
                  size="lg"
                  variant="light"
                  color="violet"
                  radius="xl"
                  styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}
                >
                  About CareSync Home Care
                </Badge>
                <Title order={2} fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
                  Your Complete Home Care{" "}
                  <span className="landing-gradient-text">Management Solution</span>
                </Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  A comprehensive platform built for home care organizations. Manage caregivers, clients,
                  schedules, billing, and payroll in one place — with real-time dashboards, automated billing,
                  wage management, and reporting.
                </Text>
                <Button
                  className="landing-btn-lift"
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "#6366f1", to: "#06b6d4" }}
                  radius="xl"
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  rightIcon={<IconArrowRight size={18} />}
                  styles={{ root: { fontWeight: 700, width: "fit-content" } }}
                >
                  Explore Features
                </Button>
              </Stack>
            </Grid.Col>
            <Grid.Col md={6}>
              <Paper
                shadow="xl"
                p="xl"
                radius={20}
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #302b63 100%)",
                  color: "white",
                  minHeight: 380,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box className="landing-float-slow" style={{ position: "absolute", top: "-15%", right: "-10%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
                <Stack spacing="xl" style={{ position: "relative", zIndex: 1 }}>
                  {[
                    { icon: IconCheck, number: "10,000+", label: "Tasks Scheduled", color: "#fbbf24" },
                    { icon: IconUsers, number: "500+", label: "Active Users", color: "#34d399" },
                    { icon: IconClock, number: "24/7", label: "Support", color: "#f472b6" },
                  ].map(({ icon: Icon, number, label, color }) => (
                    <Group key={label} spacing="md">
                      <Box
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(8px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={26} color={color} />
                      </Box>
                      <div>
                        <Text fw={900} size="xl" style={{ letterSpacing: "-0.5px" }}>{number}</Text>
                        <Text size="sm" style={{ opacity: 0.8 }}>{label}</Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* ===== FEATURES ===== */}
      <Box id="features" style={{ background: "linear-gradient(180deg, #faf5ff 0%, #eef2ff 50%, #f0f9ff 100%)", padding: "5rem 0" }}>
        <Container size="xl">
          <Stack align="center" spacing="md" mb={48}>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "#6366f1", to: "#8b5cf6" }}
              radius="xl"
              styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}
            >
              Features
            </Badge>
            <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
              Everything You Need{" "}
              <span className="landing-gradient-text">In One Platform</span>
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={700}>
              From scheduling to payroll — powerful features for home care organizations.
            </Text>
          </Stack>
          <Grid gutter="lg">
            {features.map(({ icon: Icon, title, desc, from, to, comingSoon }) => (
              <Grid.Col key={title} md={4} sm={6}>
                <Card
                  className="landing-card-hover"
                  shadow="sm"
                  padding="xl"
                  radius="lg"
                  h="100%"
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(8px)",
                    border: comingSoon ? "2px dashed rgba(99, 102, 241, 0.15)" : "1px solid rgba(99, 102, 241, 0.08)",
                  }}
                >
                  <Stack align="center" ta="center" spacing="md">
                    <Box
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 16px ${from}25`,
                      }}
                    >
                      <Icon size={32} color="white" />
                    </Box>
                    <Title order={4} fw={700}>{title}</Title>
                    {comingSoon && (
                      <Badge variant="gradient" gradient={{ from: "#f59e0b", to: "#ef4444" }} size="sm" radius="xl">
                        Coming Soon
                      </Badge>
                    )}
                    <Text c="dimmed" size="sm" style={{ lineHeight: 1.7 }}>{desc}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== HOW IT WORKS – workflow infographic ===== */}
      <HowItWorks />

      {/* ===== BEFORE / AFTER COMPARISON ===== */}
      <BeforeAfter />

      {/* ===== REQUEST DEMO ===== */}
      <Box id="request-demo" style={{ background: "linear-gradient(180deg, #f0f9ff 0%, #faf5ff 100%)", padding: "5rem 0" }}>
        <Container size="xl">
          <Grid align="center" gutter={48}>
            <Grid.Col md={6}>
              <Stack spacing="lg">
                <Badge
                  size="lg"
                  variant="light"
                  color="violet"
                  radius="xl"
                  styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}
                >
                  Request Demo
                </Badge>
                <Title order={2} fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
                  See CareSync Home Care{" "}
                  <span className="landing-gradient-text">In Action</span>
                </Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  Schedule a personalized demo and discover how we can transform your home care operations.
                </Text>
                <Stack spacing="md" mt="md">
                  {[
                    { text: "Live Product Walkthrough", color: "#10b981" },
                    { text: "Customized to Your Needs", color: "#6366f1" },
                    { text: "Q&A with Our Experts", color: "#8b5cf6" },
                    { text: "No Commitment Required", color: "#f59e0b" },
                  ].map(({ text, color }) => (
                    <Group key={text} spacing="md">
                      <Box
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: `${color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconCheck size={20} color={color} />
                      </Box>
                      <Text fw={600}>{text}</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
            <Grid.Col md={6}>
              <Paper shadow="xl" p="xl" radius={20} style={{ background: "white", border: "1px solid rgba(99, 102, 241, 0.08)" }}>
                <Stack spacing="md" mb="xl">
                  <Title order={3} fw={800}>Schedule Your Demo</Title>
                  <Text size="sm" c="dimmed">Fill out the form and we'll get back within 24 hours.</Text>
                </Stack>
                <form onSubmit={demoForm.onSubmit(handleDemoSubmit)}>
                  <Stack spacing="md">
                    <TextInput label="Full Name" placeholder="John Doe" required size="md" radius="md" styles={inputStyles} {...demoForm.getInputProps("name")} />
                    <TextInput label="Email" placeholder="john@example.com" type="email" required size="md" radius="md" styles={inputStyles} {...demoForm.getInputProps("email")} />
                    <TextInput label="Phone" placeholder="+1 (555) 123-4567" size="md" radius="md" styles={inputStyles} {...demoForm.getInputProps("phone")} />
                    <TextInput label="Company" placeholder="Your Company" required size="md" radius="md" styles={inputStyles} {...demoForm.getInputProps("company")} />
                    <TextInput label="Preferred Date/Time" placeholder="e.g., Next Monday 2 PM" size="md" radius="md" styles={inputStyles} {...demoForm.getInputProps("preferredDate")} />
                    <Textarea label="Notes (Optional)" placeholder="Your needs..." minRows={3} size="md" radius="md" styles={inputStyles} {...demoForm.getInputProps("message")} />
                    <Button
                      className="landing-btn-lift"
                      type="submit"
                      fullWidth
                      size="lg"
                      radius="xl"
                      loading={isSubmittingDemo}
                      variant="gradient"
                      gradient={{ from: "#6366f1", to: "#06b6d4" }}
                      leftIcon={<IconCalendar size={20} />}
                      styles={{ root: { fontWeight: 700, height: 52 } }}
                    >
                      Request Demo
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* ===== CONTACT ===== */}
      <Box id="contact" style={{ backgroundColor: "#fff", padding: "5rem 0" }}>
        <Container size="xl">
          <Stack align="center" spacing="md" mb={48}>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "#6366f1", to: "#8b5cf6" }}
              radius="xl"
              styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}
            >
              Contact
            </Badge>
            <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
              Get in{" "}
              <span className="landing-gradient-text">Touch</span>
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={700}>
              Questions or need assistance? We're here to help.
            </Text>
          </Stack>
          <Grid align="stretch" gutter="xl">
            <Grid.Col md={5}>
              <Paper
                p="xl"
                radius={20}
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #302b63 100%)",
                  color: "white",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box className="landing-float-slow" style={{ position: "absolute", top: "-20%", right: "-15%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
                <Stack spacing="xl" style={{ position: "relative", zIndex: 1 }}>
                  <Title order={4} c="white" mb="xs" fw={800}>Contact Information</Title>
                  {[
                    { icon: IconMail, label: "Email", value: "asproducts123@hotmail.com", href: "mailto:asproducts123@hotmail.com" },
                    { icon: IconPhone, label: "WhatsApp", value: "+92 (346) 5315102", href: "tel:+923465315102" },
                    { icon: IconClock, label: "Support", value: "Available when you need us", href: null },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <Group key={label} spacing="md">
                      <Box style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={24} color="white" />
                      </Box>
                      <Stack spacing={2}>
                        <Text fw={600} size="sm" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</Text>
                        {href ? <Anchor href={href} c="white" size="sm" fw={600}>{value}</Anchor> : <Text size="sm" c="white" fw={600}>{value}</Text>}
                      </Stack>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col md={7}>
              <Paper shadow="xl" p="xl" radius={20} style={{ background: "white", border: "1px solid rgba(99, 102, 241, 0.08)" }}>
                <Stack spacing="md" mb="xl">
                  <Title order={3} fw={800}>Send a Message</Title>
                  <Text size="sm" c="dimmed">We'll respond within 24 hours.</Text>
                </Stack>
                <form onSubmit={contactForm.onSubmit(handleContactSubmit)}>
                  <Stack spacing="md">
                    <TextInput label="Your Name" placeholder="John Doe" required size="md" radius="md" styles={inputStyles} {...contactForm.getInputProps("name")} />
                    <TextInput label="Email" placeholder="your.email@example.com" type="email" required size="md" radius="md" styles={inputStyles} {...contactForm.getInputProps("email")} />
                    <TextInput label="Phone" placeholder="+1 (555) 123-4567" size="md" radius="md" styles={inputStyles} {...contactForm.getInputProps("phone")} />
                    <Textarea label="Message" placeholder="How can we help?" required minRows={5} size="md" radius="md" styles={inputStyles} {...contactForm.getInputProps("message")} />
                    <Button
                      className="landing-btn-lift"
                      type="submit"
                      fullWidth
                      size="lg"
                      radius="xl"
                      loading={isSubmittingContact}
                      variant="gradient"
                      gradient={{ from: "#6366f1", to: "#8b5cf6" }}
                      leftIcon={<IconSend size={20} />}
                      styles={{ root: { fontWeight: 700, height: 52 } }}
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
    </Box>
  );
};

export default CareSyncHomeCarePage;
