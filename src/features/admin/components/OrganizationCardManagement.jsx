import {
  Button,
  TextInput,
  NumberInput,
  Select,
  Modal,
  Stack,
  Group,
  Paper,
  Title,
  Badge,
  Alert,
  LoadingOverlay,
  Grid,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useForm, zodResolver } from "@mantine/form";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { packageService } from "core/services";
import { IconCreditCard, IconCheck, IconX, IconAlertCircle, IconInfoCircle } from "@tabler/icons";

const schema = zod.object({
  cardHolderName: zod.string().min(1, "Card holder name is required"),
  cardNumber: zod.string().min(13, "Card number must be at least 13 digits").max(19, "Card number must be at most 19 digits"),
  expiryMonth: zod.number().min(1).max(12),
  expiryYear: zod.number().min(new Date().getFullYear()),
  cvv: zod.string().min(3).max(4),
  typeId: zod.number().min(1),
});

const OrganizationCardManagement = ({ organizationId }) => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      cardHolderName: "",
      cardNumber: "",
      expiryMonth: new Date().getMonth() + 1,
      expiryYear: new Date().getFullYear(),
      cvv: "",
      typeId: 1, // 1 = Credit Card, 2 = Debit Card
    },
  });

  useEffect(() => {
    if (organizationId) {
      loadCard();
    }
  }, [organizationId]);

  const loadCard = async () => {
    setLoading(true);
    try {
      const response = await packageService.getOrganizationCard(organizationId);
      if (response) {
        setCard(response);
        form.setValues({
          cardHolderName: response.cardHolderName || "",
          cardNumber: response.cardNumber ? "****" + response.cardNumber.slice(-4) : "",
          expiryMonth: response.expiryMonth || new Date().getMonth() + 1,
          expiryYear: response.expiryYear || new Date().getFullYear(),
          cvv: "",
          typeId: response.typeId || 1,
        });
      }
    } catch (error) {
      console.error("Error loading card:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (card) {
      form.setValues({
        cardHolderName: card.cardHolderName || "",
        cardNumber: "", // Don't show full card number
        expiryMonth: card.expiryMonth || new Date().getMonth() + 1,
        expiryYear: card.expiryYear || new Date().getFullYear(),
        cvv: "",
        typeId: card.typeId || 1,
      });
    } else {
      form.reset();
    }
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await packageService.saveUpdateOrganizationCard(organizationId, {
        id: card?.id || null,
        organizationId: organizationId,
        cardHolderName: values.cardHolderName,
        cardNumber: values.cardNumber,
        expiryMonth: values.expiryMonth,
        expiryYear: values.expiryYear,
        cvv: values.cvv,
        typeId: values.typeId,
        isActive: true,
      });

      notifications.show({
        title: "Success",
        message: "Card information saved successfully",
        color: "green",
      });

      setModalOpen(false);
      loadCard();
    } catch (error) {
      console.error("Error saving card:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to save card information",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const response = await packageService.validateOrganizationCard(organizationId);
      notifications.show({
        title: response ? "Valid" : "Invalid",
        message: response ? "Card is valid and active" : "Card is expired or invalid",
        color: response ? "green" : "red",
      });
    } catch (error) {
      console.error("Error validating card:", error);
      notifications.show({
        title: "Error",
        message: "Failed to validate card",
        color: "red",
      });
    } finally {
      setValidating(false);
    }
  };

  const formatCardNumber = (number) => {
    if (!number) return "";
    if (number.startsWith("****")) return number; // Already masked
    return "****" + number.slice(-4);
  };

  const isCardExpired = () => {
    if (!card) return false;
    const currentDate = new Date();
    const expiryDate = new Date(card.expiryYear, card.expiryMonth - 1, 1);
    return expiryDate < currentDate;
  };

  return (
    <Paper shadow="md" radius="md" p="xl" withBorder style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} />
      <Stack spacing="md">
        <Group position="apart">
          <Title order={4}>Payment Card Information</Title>
          <Group>
            {card && (
              <Button
                variant="outline"
                onClick={handleValidate}
                loading={validating}
                leftIcon={<IconCheck size={16} />}
              >
                Validate Card
              </Button>
            )}
            <Button leftIcon={<IconCreditCard size={16} />} onClick={handleOpenModal}>
              {card ? "Update Card" : "Add Card"}
            </Button>
          </Group>
        </Group>

        {card ? (
          <>
            {isCardExpired() && (
              <Alert icon={<IconAlertCircle size={16} />} title="Card Expired" color="red">
                This card has expired. Please update with a valid card.
              </Alert>
            )}
            <Grid>
              <Grid.Col span={6}>
                <TextInput label="Card Holder Name" value={card.cardHolderName} readOnly />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Card Number" value={formatCardNumber(card.cardNumber)} readOnly />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Expiry"
                  value={`${card.expiryMonth.toString().padStart(2, "0")}/${card.expiryYear}`}
                  readOnly
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput label="Card Type" value={card.typeId === 1 ? "Credit Card" : "Debit Card"} readOnly />
              </Grid.Col>
              <Grid.Col span={4}>
                <Badge color={card.isActive ? "green" : "red"} size="lg">
                  {card.isActive ? "Active" : "Inactive"}
                </Badge>
              </Grid.Col>
            </Grid>
          </>
        ) : (
          <Alert icon={<IconAlertCircle size={16} />} title="No Card on File" color="yellow">
            No payment card has been added for this organization. Please add a card to enable automatic billing.
          </Alert>
        )}
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={card ? "Update Payment Card" : "Add Payment Card"}
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack spacing="md">
            <Alert icon={<IconInfoCircle size={16} />} title="Card Validation" color="blue">
              A $1.00 test charge will be made to validate your card. This charge will be immediately refunded and will not appear on your final statement.
            </Alert>
            <TextInput
              label="Card Holder Name"
              placeholder="John Doe"
              required
              {...form.getInputProps("cardHolderName")}
            />
            <TextInput
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              required
              maxLength={19}
              {...form.getInputProps("cardNumber")}
            />
            <Grid>
              <Grid.Col span={4}>
                <NumberInput
                  label="Expiry Month"
                  placeholder="MM"
                  min={1}
                  max={12}
                  required
                  {...form.getInputProps("expiryMonth")}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Expiry Year"
                  placeholder="YYYY"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 20}
                  required
                  {...form.getInputProps("expiryYear")}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="CVV"
                  placeholder="123"
                  required
                  maxLength={4}
                  type="password"
                  {...form.getInputProps("cvv")}
                />
              </Grid.Col>
            </Grid>
            <Select
              label="Card Type"
              data={[
                { value: 1, label: "Credit Card" },
                { value: 2, label: "Debit Card" },
              ]}
              required
              {...form.getInputProps("typeId")}
            />
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save Card
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
};

export default OrganizationCardManagement;

