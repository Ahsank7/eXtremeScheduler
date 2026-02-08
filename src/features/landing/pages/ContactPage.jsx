import { useState } from "react";
import {
  Box,
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
  Anchor,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconMail, IconPhone, IconClock, IconSend } from "@tabler/icons";
import { landingService } from "core/services";

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
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

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const response = await landingService.submitContactRequest(values);
      if (response?.success) {
        notifications.show({
          title: "Success",
          message: response.message || "Thank you for contacting us! We'll get back to you soon.",
          color: "green",
        });
        form.reset();
      } else {
        throw new Error(response?.message || "Failed to submit");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || error?.message || "Failed to submit. Please try again.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: IconMail,
      label: "Email",
      value: "asproducts123@hotmail.com",
      href: "mailto:asproducts123@hotmail.com",
      color: "#6366f1",
    },
    {
      icon: IconPhone,
      label: "WhatsApp",
      value: "+92 (346) 5315102",
      href: "tel:+923465315102",
      color: "#06b6d4",
    },
    {
      icon: IconClock,
      label: "Business Hours",
      value: "Support available",
      href: null,
      color: "#8b5cf6",
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box
        style={{
          padding: "4rem 0 3rem",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        }}
      >
        <Box
          className="landing-float"
          style={{
            position: "absolute",
            top: "15%",
            right: "12%",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Box
          className="landing-dot-grid"
          style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }}
        />

        <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
          <Stack align="center" spacing="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "#6366f1", to: "#8b5cf6" }}
              radius="xl"
              styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}
            >
              Contact Us
            </Badge>
            <Title
              order={1}
              ta="center"
              fw={900}
              style={{ fontSize: "clamp(32px, 4.5vw, 52px)", color: "white" }}
            >
              Get in{" "}
              <span className="landing-gradient-text">Touch</span>
            </Title>
            <Text ta="center" maw={600} style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1.7 }}>
              Have questions or need assistance? Our team is here to help you transform your operations.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Contact Content */}
      <Box
        style={{
          padding: "3rem 0 4rem",
          background: "linear-gradient(180deg, #faf5ff 0%, #eef2ff 100%)",
        }}
      >
        <Container size="xl">
          <Grid align="stretch" gutter="xl">
            {/* Contact Info Card */}
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
                {/* Decorative shapes */}
                <Box
                  className="landing-float-slow"
                  style={{
                    position: "absolute",
                    top: "-20%",
                    right: "-15%",
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.08)",
                    pointerEvents: "none",
                  }}
                />
                <Box
                  style={{
                    position: "absolute",
                    bottom: "-10%",
                    left: "-10%",
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.05)",
                    pointerEvents: "none",
                  }}
                />

                <Stack spacing="xl" style={{ position: "relative", zIndex: 1 }}>
                  <div>
                    <Title order={3} c="white" mb="xs" fw={800}>
                      Contact Information
                    </Title>
                    <Text size="sm" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      We're available to answer your questions and provide support.
                    </Text>
                  </div>

                  {contactItems.map(({ icon: Icon, label, value, href }) => (
                    <Group key={label} spacing="md">
                      <Box
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: "rgba(255, 255, 255, 0.15)",
                          backdropFilter: "blur(8px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={24} color="white" />
                      </Box>
                      <Stack spacing={2}>
                        <Text fw={600} size="sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                          {label}
                        </Text>
                        {href ? (
                          <Anchor href={href} c="white" size="sm" fw={600}>
                            {value}
                          </Anchor>
                        ) : (
                          <Text size="sm" c="white" fw={600}>
                            {value}
                          </Text>
                        )}
                      </Stack>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Contact Form */}
            <Grid.Col md={7}>
              <Paper
                shadow="xl"
                p="xl"
                radius={20}
                style={{
                  background: "white",
                  border: "1px solid rgba(99, 102, 241, 0.08)",
                }}
              >
                <Stack spacing="md" mb="xl">
                  <Title order={3} fw={800}>Send a Message</Title>
                  <Text size="sm" c="dimmed">
                    Fill out the form and we'll respond as soon as possible.
                  </Text>
                </Stack>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack spacing="md">
                    <TextInput
                      label="Your Name"
                      placeholder="John Doe"
                      required
                      size="md"
                      radius="md"
                      {...form.getInputProps("name")}
                      styles={{
                        input: {
                          borderColor: "rgba(99, 102, 241, 0.15)",
                          "&:focus": { borderColor: "#6366f1" },
                        },
                      }}
                    />
                    <TextInput
                      label="Email"
                      placeholder="your.email@example.com"
                      type="email"
                      required
                      size="md"
                      radius="md"
                      {...form.getInputProps("email")}
                      styles={{
                        input: {
                          borderColor: "rgba(99, 102, 241, 0.15)",
                          "&:focus": { borderColor: "#6366f1" },
                        },
                      }}
                    />
                    <TextInput
                      label="Phone"
                      placeholder="+1 (555) 123-4567"
                      size="md"
                      radius="md"
                      {...form.getInputProps("phone")}
                      styles={{
                        input: {
                          borderColor: "rgba(99, 102, 241, 0.15)",
                          "&:focus": { borderColor: "#6366f1" },
                        },
                      }}
                    />
                    <Textarea
                      label="Message"
                      placeholder="How can we help you?"
                      required
                      minRows={5}
                      size="md"
                      radius="md"
                      {...form.getInputProps("message")}
                      styles={{
                        input: {
                          borderColor: "rgba(99, 102, 241, 0.15)",
                          "&:focus": { borderColor: "#6366f1" },
                        },
                      }}
                    />
                    <Button
                      className="landing-btn-lift"
                      type="submit"
                      fullWidth
                      size="lg"
                      radius="xl"
                      loading={isSubmitting}
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

export default ContactPage;
