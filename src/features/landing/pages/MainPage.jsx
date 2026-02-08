import {
  Box,
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  SimpleGrid,
  Card,
  Badge,
  Grid,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  IconHeart,
  IconShield,
  IconRocket,
  IconCalendar,
  IconUsers,
  IconReportAnalytics,
  IconArrowRight,
  IconCash,
} from "@tabler/icons";
import {
  DashboardMockup,
  HowItWorks,
  StatsRings,
  FeatureShowcase,
  BeforeAfter,
} from "../components/Infographics";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* ===== HERO SECTION – with Dashboard Mockup ===== */}
      <Box
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a1a2e 100%)",
          padding: "5rem 0 4rem",
        }}
      >
        {/* Decorative floating shapes */}
        <Box className="landing-float" style={{ position: "absolute", top: "8%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box className="landing-float-reverse" style={{ position: "absolute", bottom: "5%", left: "3%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box className="landing-float-slow" style={{ position: "absolute", top: "40%", left: "15%", width: 120, height: 120, borderRadius: "50%", border: "2px solid rgba(6,182,212,0.15)", pointerEvents: "none" }} />
        <Box className="landing-spin-slow" style={{ position: "absolute", top: "15%", left: "70%", width: 60, height: 60, border: "2px solid rgba(245,158,11,0.2)", borderRadius: 12, pointerEvents: "none" }} />
        <Box className="landing-dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />

        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Grid align="center" gutter={48}>
            {/* Left – text content */}
            <Grid.Col md={6}>
              <Stack spacing="xl">
                <Badge
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "#6366f1", to: "#8b5cf6" }}
                  radius="xl"
                  styles={{ root: { padding: "12px 24px", textTransform: "none", fontSize: 14, fontWeight: 600, width: "fit-content" } }}
                >
                  The Future of Home Care Management
                </Badge>

                <Title
                  order={1}
                  fw={900}
                  style={{ fontSize: "clamp(36px, 4.5vw, 60px)", lineHeight: 1.1, color: "white" }}
                >
                  Smart Care.{" "}
                  <span className="landing-gradient-text">Simplified.</span>
                </Title>

                <Text
                  size="lg"
                  style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontSize: 18, maxWidth: 480 }}
                >
                  A modern, cloud-based platform designed for home care agencies.
                  Scheduling, billing, payroll, and reporting — all in one place.
                </Text>

                <Group spacing="md">
                  <Button
                    className="landing-btn-lift"
                    size="xl"
                    variant="gradient"
                    gradient={{ from: "#6366f1", to: "#8b5cf6" }}
                    radius="xl"
                    onClick={() => navigate("/products")}
                    rightIcon={<IconArrowRight size={20} />}
                    styles={{ root: { fontWeight: 700, fontSize: 16, padding: "0 32px", height: 56 } }}
                  >
                    Explore Products
                  </Button>
                  <Button
                    className="landing-btn-lift"
                    size="xl"
                    variant="outline"
                    radius="xl"
                    onClick={() => navigate("/contact")}
                    styles={{
                      root: {
                        fontWeight: 700, fontSize: 16, padding: "0 32px", height: 56,
                        borderColor: "rgba(255,255,255,0.3)", color: "white",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.5)" },
                      },
                    }}
                  >
                    Contact Us
                  </Button>
                </Group>

                {/* Trust strip */}
                <Group spacing="xl" mt="md">
                  {[
                    { number: "10K+", label: "Tasks" },
                    { number: "500+", label: "Users" },
                    { number: "24/7", label: "Support" },
                  ].map(({ number, label }) => (
                    <Box key={label}>
                      <Text fw={900} size="xl" style={{ color: "white", lineHeight: 1 }}>{number}</Text>
                      <Text size="xs" style={{ color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</Text>
                    </Box>
                  ))}
                </Group>
              </Stack>
            </Grid.Col>

            {/* Right – Dashboard Mockup infographic */}
            <Grid.Col md={6}>
              <DashboardMockup />
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* ===== STATS RINGS INFOGRAPHIC ===== */}
      <StatsRings />

      {/* ===== ABOUT SECTION ===== */}
      <Box
        style={{
          padding: "5rem 0",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #faf5ff 0%, #eef2ff 50%, #f0f9ff 100%)",
        }}
      >
        <Box className="landing-pulse" style={{ position: "absolute", top: "-15%", right: "-8%", width: "35%", height: "70%", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Stack align="center" spacing="md" mb={48}>
            <Badge size="lg" variant="gradient" gradient={{ from: "#6366f1", to: "#8b5cf6" }} radius="xl" styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}>
              Who We Are
            </Badge>
            <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
              One Organization.{" "}
              <span className="landing-gradient-text">Multiple Solutions.</span>
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={700} style={{ lineHeight: 1.7 }}>
              CareSyncX is your partner for care-focused software. We build tools that help home care
              agencies and healthcare teams save time, reduce errors, and put the focus back on people.
            </Text>
          </Stack>

          <SimpleGrid cols={3} breakpoints={[{ maxWidth: "md", cols: 1 }]} spacing="xl">
            {[
              { icon: IconHeart, title: "Care-First Approach", desc: "Every product is built around the needs of care providers and their clients. We listen, then we build.", gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", borderColor: "#6366f1" },
              { icon: IconShield, title: "Reliable & Secure", desc: "Enterprise-grade reliability and security so you can focus on care, not IT. Your data stays safe and available.", gradient: "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)", borderColor: "#06b6d4" },
              { icon: IconRocket, title: "Built to Grow", desc: "From small teams to large organizations — our solutions scale with you. Start small, grow without switching tools.", gradient: "linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%)", borderColor: "#8b5cf6" },
            ].map(({ icon: Icon, title, desc, gradient, borderColor }) => (
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
                  borderTopColor: borderColor,
                }}
              >
                <Stack spacing="md">
                  <Box style={{ width: 60, height: 60, borderRadius: 16, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.2)" }}>
                    <Icon size={30} color="white" />
                  </Box>
                  <Title order={4} fw={700}>{title}</Title>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>{desc}</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ===== HOW IT WORKS – workflow infographic ===== */}
      <HowItWorks />

      {/* ===== FEATURE SHOWCASE – large alternating cards ===== */}
      <FeatureShowcase />

      {/* ===== BEFORE / AFTER COMPARISON ===== */}
      <BeforeAfter />

      {/* ===== FEATURES STRIP ===== */}
      <Box style={{ padding: "5rem 0", background: "linear-gradient(180deg, #f0f9ff 0%, #faf5ff 100%)" }}>
        <Container size="xl">
          <Stack align="center" spacing="md" mb={48}>
            <Badge size="lg" variant="light" color="violet" radius="xl" styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}>
              What We Offer
            </Badge>
            <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
              Everything You Need{" "}
              <span className="landing-gradient-text">In One Place</span>
            </Title>
          </Stack>

          <SimpleGrid cols={3} breakpoints={[{ maxWidth: "md", cols: 1 }]} spacing="lg">
            {[
              { icon: IconCalendar, title: "Smart Scheduling", desc: "Drag-and-drop planning, smart assignments, and real-time updates.", accentColor: "#6366f1" },
              { icon: IconCash, title: "Billing & Payroll", desc: "Generate invoices, track payments, and run payroll seamlessly.", accentColor: "#06b6d4" },
              { icon: IconReportAnalytics, title: "Advanced Reports", desc: "Dashboards and exports for billing, attendance, and performance.", accentColor: "#8b5cf6" },
            ].map(({ icon: Icon, title, desc, accentColor }) => (
              <Box
                key={title}
                className="landing-card-hover"
                style={{
                  padding: "2rem",
                  borderRadius: 20,
                  background: `linear-gradient(135deg, ${accentColor}0a 0%, ${accentColor}04 100%)`,
                  borderLeft: `4px solid ${accentColor}`,
                  boxShadow: `0 2px 16px ${accentColor}08`,
                  cursor: "default",
                }}
              >
                <Box style={{ width: 52, height: 52, borderRadius: 14, background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: `0 4px 12px ${accentColor}30` }}>
                  <Icon size={26} color="white" />
                </Box>
                <Title order={5} mb={8} fw={700}>{title}</Title>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>{desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ===== CTA BAND ===== */}
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
              Ready to Simplify Your{" "}
              <span className="landing-gradient-text">Operations?</span>
            </Title>
            <Text ta="center" size="lg" style={{ color: "rgba(255,255,255,0.8)", maxWidth: 560 }}>
              Join care organizations that already use CareSyncX to save time and deliver better outcomes.
            </Text>
            <Group position="center" spacing="md" mt="sm">
              <Button className="landing-btn-lift" size="lg" variant="white" color="dark" radius="xl" onClick={() => navigate("/products")} rightIcon={<IconArrowRight size={18} />} styles={{ root: { fontWeight: 700, padding: "0 28px", height: 52 } }}>
                Explore Products
              </Button>
              <Button className="landing-btn-lift" size="lg" variant="outline" radius="xl" onClick={() => navigate("/contact")} styles={{ root: { fontWeight: 700, padding: "0 28px", height: 52, borderColor: "rgba(255,255,255,0.25)", color: "white", "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" } } }}>
                Get in Touch
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default MainPage;
