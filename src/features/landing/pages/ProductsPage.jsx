import { Box, Container, Title, Text, Card, Stack, Group, Button, Badge } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconHome, IconStethoscope } from "@tabler/icons";
import BannerSlider from "../components/BannerSlider";

const ProductsPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box style={{ padding: "2rem 0 3rem" }}>
        <Container size="xl">
          <Stack spacing="xl">
            <Stack align="center" spacing="xs">
              <Title order={2} ta="center" size={32} fw={700}>
                Our Products
              </Title>
              <Text c="dimmed" ta="center" maw={560}>
                Explore CareSyncX products built for care organizations.
              </Text>
            </Stack>

            <BannerSlider />

            <Group position="center" grow style={{ alignItems: "stretch" }}>
              {/* CareSync Home Care */}
              <Card
                shadow="md"
                padding="xl"
                radius="lg"
                withBorder
                style={{
                  maxWidth: 400,
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onClick={() => navigate("/products/home-care")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <Stack spacing="md">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #4f8cff 0%, #22d3ee 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconHome size={28} color="white" />
                  </Box>
                  <Title order={4}>CareSync Home Care</Title>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                    The complete home care management solution. Scheduling, billing, payroll,
                    reporting, and more—all in one platform.
                  </Text>
                  <Button
                    variant="gradient"
                    gradient={{ from: "indigo", to: "cyan" }}
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/products/home-care");
                    }}
                  >
                    Learn more
                  </Button>
                </Stack>
              </Card>

              {/* CareSync HMS */}
              <Card
                shadow="md"
                padding="xl"
                radius="lg"
                withBorder
                style={{
                  maxWidth: 400,
                  opacity: 0.92,
                  position: "relative",
                }}
              >
                <Badge
                  color="gray"
                  variant="light"
                  size="lg"
                  style={{ position: "absolute", top: 16, right: 16 }}
                >
                  Coming soon
                </Badge>
                <Stack spacing="md">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconStethoscope size={28} color="white" />
                  </Box>
                  <Title order={4}>CareSync HMS</Title>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                    Healthcare Management System for broader clinical and operational needs.
                    We're building it—stay tuned.
                  </Text>
                  <Button variant="light" color="gray" fullWidth disabled>
                    Coming soon
                  </Button>
                </Stack>
              </Card>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default ProductsPage;
