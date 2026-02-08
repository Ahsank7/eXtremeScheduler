import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Container, Group, Text, Anchor, Stack, SimpleGrid } from "@mantine/core";
import caresynxLogo from "../../../assets/images/caresynx-logo.png";

const NAV_ITEMS = [
  { label: "Home", path: "/", match: (p) => p === "/" || p === "/home" },
  { label: "Products", path: "/products", match: (p) => p.startsWith("/products") },
  { label: "Contact", path: "/contact", match: (p) => p === "/contact" },
];

const PublicSiteLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#faf5ff",
      }}
    >
      {/* Header - Glassmorphism */}
      <Box
        className="landing-glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid rgba(99, 102, 241, 0.08)",
          padding: "0.6rem 0",
        }}
      >
        {/* Gradient accent line */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%)",
          }}
        />
        <Container size="xl">
          <Group position="apart" align="center">
            <Group
              spacing="sm"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <img
                src={caresynxLogo}
                alt="CareSyncX"
                style={{
                  height: 80,
                  width: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </Group>

            <Group spacing={32}>
              {NAV_ITEMS.map((item) => (
                <Text
                  key={item.label}
                  className={`landing-nav-link ${item.match(path) ? "active" : ""}`}
                  size="sm"
                  fw={600}
                  color={item.match(path) ? "#6366f1" : "#475569"}
                  onClick={() => navigate(item.path)}
                  style={{
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                    padding: "8px 0",
                  }}
                >
                  {item.label}
                </Text>
              ))}
            </Group>
          </Group>
        </Container>
      </Box>

      <Box style={{ flex: 1 }}>
        <Outlet />
      </Box>

      {/* Footer - Dark Gradient */}
      <Box
        style={{
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          color: "white",
          padding: "3.5rem 0 2rem",
          marginTop: "auto",
          position: "relative",
        }}
      >
        {/* Top gradient line */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 30%, #06b6d4 60%, #f59e0b 100%)",
          }}
        />
        <Container size="xl">
          <SimpleGrid
            cols={3}
            breakpoints={[
              { maxWidth: "md", cols: 2 },
              { maxWidth: "sm", cols: 1 },
            ]}
            spacing="xl"
          >
            {/* Brand */}
            <Stack spacing="md">
              <img
                src={caresynxLogo}
                alt="CareSyncX"
                style={{
                  height: 48,
                  width: "auto",
                  display: "block",
                  objectFit: "contain",
                  filter: "brightness(1.2)",
                }}
              />
              <Text c="gray.5" size="sm" maw={250} style={{ lineHeight: 1.7 }}>
                Empowering care organizations with modern, cloud-based software solutions.
              </Text>
            </Stack>

            {/* Products */}
            <Stack spacing="sm">
              <Text fw={700} size="sm" style={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#a78bfa" }}>
                Products
              </Text>
              <Anchor className="landing-footer-link" c="gray.4" size="sm" onClick={() => navigate("/products/home-care")}>
                CareSync Home Care
              </Anchor>
              <Text c="gray.6" size="sm" style={{ fontStyle: "italic" }}>
                CareSync HMS (Coming Soon)
              </Text>
            </Stack>

            {/* Company */}
            <Stack spacing="sm">
              <Text fw={700} size="sm" style={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#a78bfa" }}>
                Company
              </Text>
              <Anchor className="landing-footer-link" c="gray.4" size="sm" onClick={() => navigate("/")}>
                Home
              </Anchor>
              <Anchor className="landing-footer-link" c="gray.4" size="sm" onClick={() => navigate("/products")}>
                Products
              </Anchor>
              <Anchor className="landing-footer-link" c="gray.4" size="sm" onClick={() => navigate("/contact")}>
                Contact Us
              </Anchor>
            </Stack>

          </SimpleGrid>

          {/* Bottom bar */}
          <Box
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              marginTop: "2.5rem",
              paddingTop: "1.5rem",
            }}
          >
            <Group position="apart">
              <Text c="gray.6" size="xs">
                &copy; {new Date().getFullYear()} CareSyncX. All rights reserved.
              </Text>
              <Group spacing="lg">
                <Text c="gray.6" size="xs" style={{ cursor: "pointer" }}>Privacy Policy</Text>
                <Text c="gray.6" size="xs" style={{ cursor: "pointer" }}>Terms of Service</Text>
              </Group>
            </Group>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicSiteLayout;
