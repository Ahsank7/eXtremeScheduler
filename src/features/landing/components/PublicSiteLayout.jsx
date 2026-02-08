import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Container, Group, Button, Text, Anchor, Stack } from "@mantine/core";
import CareSyncXLogo from "./CareSyncXLogo";

const PublicSiteLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isHome = path === "/" || path === "/home";
  const isProducts = path.startsWith("/products");
  const isContact = path === "/contact";

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #f0f4ff 0%, #faf5ff 50%, #f0f9ff 100%)",
      }}
    >
      {/* CareSyncX Header - subtle gradient like logo */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "linear-gradient(90deg, rgba(240,244,255,0.98) 0%, rgba(250,245,255,0.98) 50%, rgba(240,249,255,0.98) 100%)",
          borderBottom: "1px solid rgba(124, 58, 237, 0.12)",
          padding: "0.75rem 0",
          boxShadow: "0 2px 16px rgba(79, 140, 255, 0.08)",
        }}
      >
        <Container size="xl">
          <Group position="apart" align="center">
            <CareSyncXLogo variant="header" onClick={() => navigate("/")} />

            <Group spacing="xs">
              <Button
                variant={isHome ? "filled" : "subtle"}
                color="violet"
                size="md"
                onClick={() => navigate("/")}
                style={{
                  fontWeight: 600,
                  ...(isHome ? { backgroundColor: "#7c3aed", color: "white" } : {}),
                }}
              >
                Home
              </Button>
              <Button
                variant={isProducts ? "filled" : "subtle"}
                color="violet"
                size="md"
                onClick={() => navigate("/products")}
                style={{
                  fontWeight: 600,
                  ...(isProducts ? { backgroundColor: "#7c3aed", color: "white" } : {}),
                }}
              >
                Products
              </Button>
              <Button
                variant={isContact ? "filled" : "subtle"}
                color="violet"
                size="md"
                onClick={() => navigate("/contact")}
                style={{
                  fontWeight: 600,
                  ...(isContact ? { backgroundColor: "#7c3aed", color: "white" } : {}),
                }}
              >
                Contact
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      <Box style={{ flex: 1 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          color: "white",
          padding: "2.5rem 0",
          marginTop: "auto",
        }}
      >
        <Container size="xl">
          <Group position="apart" align="flex-start">
            <Stack spacing="xs">
              <CareSyncXLogo variant="footer" />
              <Text c="gray.4" size="sm" maw={280}>
                Empowering care organizations with modern software solutions.
              </Text>
              <Text c="gray.5" size="xs">
                © {new Date().getFullYear()} CareSyncX. All rights reserved.
              </Text>
            </Stack>
            <Group spacing="xl">
              <Stack spacing="xs">
                <Text fw={600} size="sm">Quick Links</Text>
                <Anchor c="gray.4" size="sm" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                  Home
                </Anchor>
                <Anchor c="gray.4" size="sm" onClick={() => navigate("/products")} style={{ cursor: "pointer" }}>
                  Products
                </Anchor>
                <Anchor c="gray.4" size="sm" onClick={() => navigate("/contact")} style={{ cursor: "pointer" }}>
                  Contact
                </Anchor>
              </Stack>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicSiteLayout;
