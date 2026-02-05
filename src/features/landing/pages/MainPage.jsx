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
  ThemeIcon,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  IconHeart,
  IconShield,
  IconRocket,
  IconCalendar,
  IconChartBar,
  IconUsers,
  IconReportAnalytics,
  IconArrowRight,
} from "@tabler/icons";
import BannerSlider, { MAIN_PAGE_SLIDES } from "../components/BannerSlider";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero slider + CTAs */}
      <Box
        style={{
          padding: "1.5rem 0 2.5rem",
          background: "linear-gradient(180deg, rgba(79, 140, 255, 0.06) 0%, rgba(250, 245, 255, 0.2) 40%, transparent 100%)",
        }}
      >
        <Container size="xl">
          <BannerSlider slides={MAIN_PAGE_SLIDES} height={440} borderRadius={20} />
          <Group position="center" spacing="md" mt="lg">
            <Button
              size="lg"
              variant="gradient"
              gradient={{ from: "indigo", to: "violet" }}
              onClick={() => navigate("/products")}
              style={{ fontWeight: 600 }}
              rightIcon={<IconArrowRight size={18} />}
            >
              Our Products
            </Button>
            <Button
              size="lg"
              variant="outline"
              color="violet"
              onClick={() => navigate("/contact")}
              style={{ fontWeight: 600 }}
            >
              Contact Us
            </Button>
          </Group>
          <Text ta="center" size="sm" c="dimmed" mt="md">
            Trusted by care organizations to streamline scheduling, billing, and operations.
          </Text>
        </Container>
      </Box>

      {/* Stats strip */}
      <Box
        style={{
          background: "linear-gradient(90deg, #4f8cff 0%, #22d3ee 50%, #7c3aed 100%)",
          padding: "1.5rem 0",
          color: "white",
        }}
      >
        <Container size="xl">
          <SimpleGrid cols={3} breakpoints={[{ maxWidth: "sm", cols: 1 }]} spacing="xl">
            <Group position="center" spacing="sm">
              <ThemeIcon size={40} radius="md" variant="white" color="blue">
                <IconCalendar size={22} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">10,000+</Text>
                <Text size="xs" opacity={0.9}>Tasks scheduled</Text>
              </div>
            </Group>
            <Group position="center" spacing="sm">
              <ThemeIcon size={40} radius="md" variant="white" color="cyan">
                <IconUsers size={22} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">500+</Text>
                <Text size="xs" opacity={0.9}>Active users</Text>
              </div>
            </Group>
            <Group position="center" spacing="sm">
              <ThemeIcon size={40} radius="md" variant="white" color="violet">
                <IconChartBar size={22} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">24/7</Text>
                <Text size="xs" opacity={0.9}>Support</Text>
              </div>
            </Group>
          </SimpleGrid>
        </Container>
      </Box>

      {/* About CareSyncX - more colorful */}
      <Box
        style={{
          padding: "4rem 0",
          position: "relative",
          background: "linear-gradient(135deg, rgba(79, 140, 255, 0.12) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(34, 211, 238, 0.1) 100%)",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative blob */}
        <Box
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "40%",
            height: "80%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Box
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: "35%",
            height: "60%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79, 140, 255, 0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Stack align="center" spacing="md" mb="xl">
            <Badge size="lg" variant="gradient" gradient={{ from: "indigo", to: "violet" }}>
              Who we are
            </Badge>
            <Title order={2} ta="center" size={36} fw={700}>
              One organization. Multiple solutions.
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={680} style={{ lineHeight: 1.7 }}>
              CareSyncX is your partner for care-focused software. We build tools that help home care
              agencies and healthcare teams save time, reduce errors, and put the focus back on people.
              From scheduling and billing today to full hospital management tomorrow—we're here for the long run.
            </Text>
          </Stack>
          <SimpleGrid cols={3} breakpoints={[{ maxWidth: "md", cols: 1 }]} spacing="xl">
            {[
              {
                icon: IconHeart,
                title: "Care-first",
                desc: "Every product is built around the needs of care providers and their clients. We listen, then we build.",
                gradient: "linear-gradient(135deg, #4f8cff 0%, #7c3aed 100%)",
              },
              {
                icon: IconShield,
                title: "Reliable & secure",
                desc: "Enterprise-grade reliability and security so you can focus on care, not IT. Your data stays safe and available.",
                gradient: "linear-gradient(135deg, #22d3ee 0%, #4f8cff 100%)",
              },
              {
                icon: IconRocket,
                title: "Built to grow",
                desc: "From small teams to large organizations—our solutions scale with you. Start small, grow without switching tools.",
                gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              },
            ].map(({ icon: Icon, title, desc, gradient }) => (
              <Card
                key={title}
                shadow="md"
                padding="xl"
                radius="lg"
                withBorder
                style={{
                  background: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(8px)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  borderTop: "4px solid",
                  borderTopColor: title === "Care-first" ? "#4f8cff" : title === "Reliable & secure" ? "#22d3ee" : "#7c3aed",
                }}
                sx={(theme) => ({
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows.lg,
                  },
                })}
              >
                <Stack spacing="md">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={28} color="white" />
                  </Box>
                  <Title order={4}>{title}</Title>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                    {desc}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* What we offer - feature highlights */}
      <Box
        style={{
          padding: "4rem 0",
          background: "linear-gradient(180deg, rgba(250, 245, 255, 0.9) 0%, rgba(224, 231, 255, 0.6) 100%)",
        }}
      >
        <Container size="xl">
          <Stack align="center" spacing="md" mb="xl">
            <Badge size="lg" variant="light" color="violet">
              What we offer
            </Badge>
            <Title order={2} ta="center" size={32} fw={700}>
              Everything you need in one place
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={600}>
              Scheduling, billing, payroll, and reporting—designed for care.
            </Text>
          </Stack>
          <SimpleGrid cols={3} breakpoints={[{ maxWidth: "md", cols: 1 }]} spacing="lg">
            <Box
              style={{
                padding: "1.5rem",
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(79, 140, 255, 0.15) 0%, rgba(124, 58, 237, 0.08) 100%)",
                borderLeft: "4px solid #4f8cff",
                boxShadow: "0 2px 12px rgba(79, 140, 255, 0.1)",
              }}
            >
              <ThemeIcon size={44} radius="md" variant="light" color="blue" mb="sm">
                <IconCalendar size={24} />
              </ThemeIcon>
              <Title order={5} mb={4}>Scheduling made simple</Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                Drag-and-drop planning, smart assignments, and real-time updates so your team and clients are always in sync.
              </Text>
            </Box>
            <Box
              style={{
                padding: "1.5rem",
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(79, 140, 255, 0.08) 100%)",
                borderLeft: "4px solid #22d3ee",
                boxShadow: "0 2px 12px rgba(34, 211, 238, 0.1)",
              }}
            >
              <ThemeIcon size={44} radius="md" variant="light" color="cyan" mb="sm">
                <IconChartBar size={24} />
              </ThemeIcon>
              <Title order={5} mb={4}>Billing & payroll in one place</Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                Generate invoices, track payments, and run payroll without switching tools. Clear reports when you need them.
              </Text>
            </Box>
            <Box
              style={{
                padding: "1.5rem",
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)",
                borderLeft: "4px solid #7c3aed",
                boxShadow: "0 2px 12px rgba(124, 58, 237, 0.1)",
              }}
            >
              <ThemeIcon size={44} radius="md" variant="light" color="violet" mb="sm">
                <IconReportAnalytics size={24} />
              </ThemeIcon>
              <Title order={5} mb={4}>Reports that matter</Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                Dashboards and exports for billing, attendance, and performance. Make decisions with real data.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA band */}
      <Box
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #4f8cff 100%)",
          padding: "3rem 0",
          color: "white",
        }}
      >
        <Container size="md">
          <Stack align="center" spacing="lg">
            <Title order={2} ta="center" size={28} fw={700}>
              Ready to simplify your operations?
            </Title>
            <Text ta="center" size="lg" style={{ opacity: 0.95 }}>
              Join care organizations that already use CareSyncX to save time and deliver better outcomes.
            </Text>
            <Group position="center" spacing="md">
              <Button
                size="lg"
                variant="white"
                color="dark"
                onClick={() => navigate("/products")}
                rightIcon={<IconArrowRight size={18} />}
              >
                Explore products
              </Button>
              <Button
                size="lg"
                variant="outline"
                style={{ borderColor: "white", color: "white" }}
                onClick={() => navigate("/contact")}
              >
                Get in touch
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default MainPage;
