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
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconMail, IconPhone, IconClock } from "@tabler/icons";
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

  return (
    <Box
      style={{
        padding: "3rem 0 4rem",
        background: "linear-gradient(180deg, #ffffff 0%, rgba(254, 242, 248, 0.3) 30%, rgba(240, 253, 244, 0.3) 100%)",
      }}
    >
      <Container size="xl">
        <Stack align="center" spacing="md" mb="xl">
          <Title order={2} ta="center" size={36} fw={700}>
            Get in touch
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Questions about care-focused software or how CareSyncX can help your organization? We're here to help.
          </Text>
        </Stack>

        <Grid align="center" gutter="xl">
          <Grid.Col md={5}>
            <Paper
              p="xl"
              radius="lg"
              style={{
                background: "linear-gradient(135deg, #db2777 0%, #7c3aed 50%, #059669 100%)",
                color: "white",
              }}
            >
              <Stack spacing="xl">
                <div>
                  <Title order={4} c="white" mb="xs">
                    Contact information
                  </Title>
                  <Text size="sm" c="gray.3">
                    Reach out for demos, support, or to talk about your care organization's needs.
                  </Text>
                </div>
                <Group>
                  <ThemeIcon size={48} radius="md" variant="white" color="pink">
                    <IconMail size={24} />
                  </ThemeIcon>
                  <Stack spacing={2}>
                    <Text fw={600} size="sm">
                      Email
                    </Text>
                    <Anchor href="mailto:admin@caresynx.com" c="white" size="sm">
                      admin@caresynx.com
                    </Anchor>
                  </Stack>
                </Group>
                <Group>
                  <ThemeIcon size={48} radius="md" variant="white" color="green">
                    <IconPhone size={24} />
                  </ThemeIcon>
                  <Stack spacing={2}>
                    <Text fw={600} size="sm">
                      WhatsApp / Phone
                    </Text>
                    <Anchor href="tel:+923465315102" c="white" size="sm">
                      +92 (346) 5315102
                    </Anchor>
                  </Stack>
                </Group>
                <Group>
                  <ThemeIcon size={48} radius="md" variant="white" color="teal">
                    <IconClock size={24} />
                  </ThemeIcon>
                  <Stack spacing={2}>
                    <Text fw={600} size="sm">
                      Business hours
                    </Text>
                    <Text size="sm" c="gray.3">
                      Support available
                    </Text>
                  </Stack>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col md={7}>
            <Paper shadow="xl" p="xl" radius="lg" withBorder style={{ backgroundColor: "#fff" }}>
              <Stack spacing="md" mb="md">
                <Title order={3}>Send a message</Title>
                <Text size="sm" c="dimmed">
                  Tell us about your organization or what you need—we'll get back to you soon.
                </Text>
              </Stack>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack spacing="md">
                  <TextInput
                    label="Your name"
                    placeholder="John Doe"
                    required
                    size="md"
                    {...form.getInputProps("name")}
                  />
                  <TextInput
                    label="Email"
                    placeholder="your.email@example.com"
                    type="email"
                    required
                    size="md"
                    {...form.getInputProps("email")}
                  />
                  <TextInput
                    label="Phone"
                    placeholder="+1 (555) 123-4567"
                    size="md"
                    {...form.getInputProps("phone")}
                  />
                  <Textarea
                    label="Message"
                    placeholder="How can we help you? (e.g. demo, pricing, care workflow)"
                    required
                    minRows={5}
                    size="md"
                    {...form.getInputProps("message")}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isSubmitting}
                    style={{ backgroundColor: "#059669" }}
                    leftIcon={<IconMail size={20} />}
                  >
                    Send message
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactPage;
