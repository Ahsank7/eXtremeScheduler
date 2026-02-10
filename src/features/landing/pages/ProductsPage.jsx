import {
  Box,
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  Badge,
  Grid,
  SimpleGrid,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  IconHome,
  IconStethoscope,
  IconArrowRight,
  IconStar,
  IconCalendar,
  IconCash,
  IconReportAnalytics,
  IconCheck,
  IconShield,
  IconRocket,
  IconHeart,
} from "@tabler/icons";
import { DashboardMockup } from "../components/Infographics";

const ProductsPage = () => {
  const navigate = useNavigate();

  const homeCareFeatures = [
    "Real-Time Dashboards",
    "Smart Scheduling",
    "Team Management",
    "Billing & Invoicing",
    "Wage & Payroll",
    "Advanced Reporting",
    "Attendance Tracking",
    "Multi-Franchise Support",
  ];

  return (
    <Box>
      {/* ===== HERO HEADER ===== */}
      <Box
        style={{
          padding: "5rem 0 4rem",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a1a2e 100%)",
        }}
      >
        <Box className="landing-float" style={{ position: "absolute", top: "5%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box className="landing-float-reverse" style={{ position: "absolute", bottom: "10%", left: "5%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box className="landing-spin-slow" style={{ position: "absolute", top: "25%", left: "80%", width: 50, height: 50, border: "2px solid rgba(6,182,212,0.2)", borderRadius: 10, pointerEvents: "none" }} />
        <Box className="landing-dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }} />

        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Stack align="center" spacing="lg">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "#6366f1", to: "#8b5cf6" }}
              radius="xl"
              styles={{ root: { padding: "12px 24px", textTransform: "none", fontSize: 14, fontWeight: 600 } }}
            >
              Our Products
            </Badge>
            <Title
              order={1}
              ta="center"
              fw={900}
              style={{ fontSize: "clamp(36px, 5vw, 60px)", color: "white", lineHeight: 1.1 }}
            >
              Built for{" "}
              <span className="landing-gradient-text">Care Organizations</span>
            </Title>
            <Text ta="center" maw={700} style={{ color: "rgba(255,255,255,0.7)", fontSize: 20, lineHeight: 1.7 }}>
              Explore caresynX products designed to streamline your operations,
              reduce manual work, and deliver exceptional care.
            </Text>

            {/* Trust indicators */}
            <Group spacing="xl" mt="md">
              {[
                { icon: IconShield, text: "Enterprise Security" },
                { icon: IconRocket, text: "Cloud-Based" },
                { icon: IconHeart, text: "Care-First Design" },
              ].map(({ icon: Icon, text }) => (
                <Group key={text} spacing="xs">
                  <Icon size={18} color="#a78bfa" />
                  <Text size="sm" style={{ color: "rgba(255,255,255,0.6)" }}>{text}</Text>
                </Group>
              ))}
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* ===== FLAGSHIP PRODUCT – caresynX Home Care ===== */}
      <Box
        style={{
          padding: "5rem 0",
          background: "linear-gradient(180deg, #faf5ff 0%, #eef2ff 50%, #f0f9ff 100%)",
        }}
      >
        <Container size="xl">
          {/* Section header */}
          <Stack align="center" spacing="md" mb={56}>
            <Badge size="lg" variant="light" color="indigo" radius="xl" styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}>
              Flagship Product
            </Badge>
            <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
              caresynX{" "}
              <span className="landing-gradient-text">Home Care</span>
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={700} style={{ lineHeight: 1.7 }}>
              The complete home care management solution — scheduling, billing, payroll, reporting,
              and more in one powerful platform.
            </Text>
          </Stack>

          {/* Product showcase with mockup */}
          <Grid align="center" gutter={48} mb={64}>
            <Grid.Col md={6}>
              <DashboardMockup />
            </Grid.Col>
            <Grid.Col md={6}>
              <Stack spacing="xl">
                <Group spacing="md">
                  <Box
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                    }}
                  >
                    <IconHome size={36} color="white" />
                  </Box>
                  <div>
                    <Title order={3} fw={800}>caresynX Home Care</Title>
                    <Text size="sm" c="dimmed">All-in-One Platform</Text>
                  </div>
                </Group>

                <Text size="md" c="dimmed" style={{ lineHeight: 1.8 }}>
                  Designed specifically for home care agencies, caresynX Home Care brings together
                  every tool you need — from intelligent scheduling and caregiver management to
                  automated billing, payroll, and advanced analytics.
                </Text>

                {/* Feature checklist */}
                <SimpleGrid cols={2} spacing="sm">
                  {homeCareFeatures.map((feature) => (
                    <Group key={feature} spacing="xs" noWrap>
                      <Box
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconCheck size={14} color="white" />
                      </Box>
                      <Text size="sm" fw={600}>{feature}</Text>
                    </Group>
                  ))}
                </SimpleGrid>

                <Button
                  className="landing-btn-lift"
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "#6366f1", to: "#06b6d4" }}
                  radius="xl"
                  rightIcon={<IconArrowRight size={20} />}
                  onClick={() => navigate("/products/home-care")}
                  styles={{ root: { fontWeight: 700, width: "fit-content", padding: "0 32px", height: 52 } }}
                >
                  Explore Home Care
                </Button>
              </Stack>
            </Grid.Col>
          </Grid>

          {/* Key capabilities strip */}
          <SimpleGrid cols={3} breakpoints={[{ maxWidth: "md", cols: 1 }]} spacing="lg">
            {[
              {
                icon: IconCalendar,
                title: "Smart Scheduling",
                desc: "Drag-and-drop planning with intelligent caregiver-client matching and real-time availability.",
                gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                accent: "#6366f1",
              },
              {
                icon: IconCash,
                title: "Billing & Payroll",
                desc: "Automated invoicing, payment tracking, wage calculations, and comprehensive financial reports.",
                gradient: "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
                accent: "#06b6d4",
              },
              {
                icon: IconReportAnalytics,
                title: "Advanced Analytics",
                desc: "Real-time dashboards, custom reports, and data-driven insights for smarter decisions.",
                gradient: "linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%)",
                accent: "#8b5cf6",
              },
            ].map(({ icon: Icon, title, desc, gradient, accent }) => (
              <Card
                key={title}
                className="landing-card-hover"
                shadow="md"
                padding="xl"
                radius="lg"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(99,102,241,0.08)",
                  borderTopWidth: 4,
                  borderTopColor: accent,
                }}
              >
                <Stack spacing="md">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 16px ${accent}30`,
                    }}
                  >
                    <Icon size={28} color="white" />
                  </Box>
                  <Title order={4} fw={700}>{title}</Title>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>{desc}</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ===== COMING SOON – caresynX HMS ===== */}
      <Box style={{ padding: "5rem 0", background: "#fff", position: "relative", overflow: "hidden" }}>
        <Box className="landing-pulse" style={{ position: "absolute", top: "-10%", left: "-5%", width: "30%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Container size="md" style={{ position: "relative", zIndex: 1 }}>
          <Card
            className="landing-coming-soon"
            shadow="lg"
            padding={0}
            radius={24}
            style={{
              overflow: "hidden",
              border: "2px dashed rgba(99, 102, 241, 0.2)",
            }}
          >
            <Grid align="stretch" gutter={0}>
              {/* Left – gradient panel */}
              <Grid.Col md={5}>
                <Box
                  style={{
                    background: "linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)",
                    padding: "3rem 2rem",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box className="landing-float-slow" style={{ position: "absolute", top: "-20%", right: "-15%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
                  <Box
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 24,
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <IconStethoscope size={44} color="white" />
                  </Box>
                  <Badge
                    variant="gradient"
                    gradient={{ from: "#f59e0b", to: "#ef4444" }}
                    size="xl"
                    radius="xl"
                    styles={{ root: { padding: "10px 24px", textTransform: "none", fontWeight: 700 } }}
                  >
                    Coming Soon
                  </Badge>
                </Box>
              </Grid.Col>

              {/* Right – details */}
              <Grid.Col md={7}>
                <Box style={{ padding: "3rem 2.5rem" }}>
                  <Stack spacing="lg">
                    <div>
                      <Title order={3} fw={800} mb={8}>caresynX HMS</Title>
                      <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
                        A comprehensive Healthcare Management System for broader clinical and
                        operational needs. We're building something special to help healthcare
                        organizations beyond home care.
                      </Text>
                    </div>
                    <Stack spacing="xs">
                      {[
                        "Clinical workflow management",
                        "Patient records & documentation",
                        "Multi-department coordination",
                        "Compliance & regulatory tools",
                      ].map((item) => (
                        <Group key={item} spacing="xs">
                          <IconStar size={16} color="#f59e0b" />
                          <Text size="sm" fw={500} c="dimmed">{item}</Text>
                        </Group>
                      ))}
                    </Stack>
                    <Button
                      variant="light"
                      color="gray"
                      radius="xl"
                      size="md"
                      disabled
                      leftIcon={<IconStar size={18} />}
                      styles={{ root: { fontWeight: 700, width: "fit-content" } }}
                    >
                      Stay Tuned
                    </Button>
                  </Stack>
                </Box>
              </Grid.Col>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* ===== WHY CHOOSE US CTA ===== */}
      <Box
        style={{
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          padding: "4rem 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box className="landing-float" style={{ position: "absolute", top: "10%", right: "5%", width: 100, height: 100, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.2)", pointerEvents: "none" }} />
        <Box className="landing-float-reverse" style={{ position: "absolute", bottom: "15%", left: "8%", width: 70, height: 70, borderRadius: 14, border: "2px solid rgba(139,92,246,0.15)", pointerEvents: "none" }} />

        <Container size="md" style={{ position: "relative", zIndex: 1 }}>
          <Stack align="center" spacing="lg">
            <Title order={2} ta="center" fw={800} style={{ color: "white", fontSize: "clamp(24px, 3.5vw, 36px)" }}>
              Ready to Transform Your{" "}
              <span className="landing-gradient-text">Operations?</span>
            </Title>
                <Text ta="center" size="lg" style={{ color: "rgba(255,255,255,0.8)", maxWidth: 560 }}>
              Discover how caresynX can help your organization save time, reduce errors,
              and focus on what matters most — delivering exceptional care.
            </Text>
            <Group position="center" spacing="md" mt="sm">
              <Button
                className="landing-btn-lift"
                size="lg"
                variant="white"
                color="dark"
                radius="xl"
                onClick={() => navigate("/products/home-care")}
                rightIcon={<IconArrowRight size={18} />}
                styles={{ root: { fontWeight: 700, padding: "0 28px", height: 52 } }}
              >
                Get Started
              </Button>
              <Button
                className="landing-btn-lift"
                size="lg"
                variant="outline"
                radius="xl"
                onClick={() => navigate("/contact")}
                styles={{ root: { fontWeight: 700, padding: "0 28px", height: 52, borderColor: "rgba(255,255,255,0.25)", color: "white", "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" } } }}
              >
                Contact Us
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default ProductsPage;
