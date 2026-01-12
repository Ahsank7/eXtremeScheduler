import {
  Table,
  Badge,
  LoadingOverlay,
  Paper,
  Stack,
  Title,
  Button,
  Group,
  Text,
  Modal,
  Alert,
  Grid,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { packageService } from "core/services";
import { IconFileInvoice, IconCheck, IconX, IconAlertCircle } from "@tabler/icons";

const PackageInvoices = ({ organizationId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadInvoices();
    }
  }, [organizationId]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await packageService.getOrganizationInvoices(organizationId);
      setInvoices(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading invoices:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load invoices",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (invoice) => {
    if (!window.confirm(`Process payment of $${invoice.totalAmount?.toFixed(2)} for invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    setProcessingPayment(true);
    try {
      await packageService.processInvoicePayment({
        invoiceId: invoice.id,
        organizationId: organizationId,
      });

      notifications.show({
        title: "Success",
        message: "Payment processed successfully",
        color: "green",
      });

      loadInvoices();
    } catch (error) {
      console.error("Error processing payment:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to process payment",
        color: "red",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleViewDetails = async (invoice) => {
    try {
      const response = await packageService.getInvoiceById(invoice.id);
      setSelectedInvoice(response);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error("Error loading invoice details:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load invoice details",
        color: "red",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toFixed(2) || "0.00"}`;
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      Paid: "green",
      Pending: "yellow",
      Failed: "red",
    };
    return <Badge color={colors[status] || "gray"}>{status}</Badge>;
  };

  const rows = invoices.map((invoice) => (
    <tr key={invoice.id} style={{ cursor: "pointer" }} onClick={() => handleViewDetails(invoice)}>
      <td>{invoice.invoiceNumber}</td>
      <td>{formatDate(invoice.billingPeriodStart)}</td>
      <td>{formatDate(invoice.billingPeriodEnd)}</td>
      <td>{invoice.clientCount}</td>
      <td>{formatCurrency(invoice.totalAmount)}</td>
      <td>{invoice.isInitialCharge ? "Yes" : "No"}</td>
      <td>{getPaymentStatusBadge(invoice.paymentStatus)}</td>
      <td>{formatDate(invoice.paymentDate)}</td>
      <td onClick={(e) => e.stopPropagation()}>
        {invoice.paymentStatus === "Pending" && (
          <Button
            size="xs"
            color="blue"
            onClick={() => handleProcessPayment(invoice)}
            loading={processingPayment}
          >
            Process Payment
          </Button>
        )}
      </td>
    </tr>
  ));

  return (
    <Paper shadow="md" radius="md" p="xl" withBorder style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} />
      <Stack spacing="md">
        <Group position="apart">
          <Title order={4}>Package Invoices</Title>
          <Button leftIcon={<IconFileInvoice size={16} />} onClick={loadInvoices} variant="outline">
            Refresh
          </Button>
        </Group>

        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Period Start</th>
              <th>Period End</th>
              <th>Clients</th>
              <th>Total Amount</th>
              <th>Initial Charge</th>
              <th>Status</th>
              <th>Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Stack>

      <Modal
        opened={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedInvoice(null);
        }}
        title={`Invoice Details - ${selectedInvoice?.invoiceNumber || ""}`}
        size="lg"
        centered
      >
        {selectedInvoice && (
          <Stack spacing="md">
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" weight={600}>Invoice Number:</Text>
                <Text>{selectedInvoice.invoiceNumber}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" weight={600}>Invoice Date:</Text>
                <Text>{formatDate(selectedInvoice.invoiceDate)}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" weight={600}>Billing Period:</Text>
                <Text>
                  {formatDate(selectedInvoice.billingPeriodStart)} - {formatDate(selectedInvoice.billingPeriodEnd)}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" weight={600}>Payment Status:</Text>
                {getPaymentStatusBadge(selectedInvoice.paymentStatus)}
              </Grid.Col>
            </Grid>

            <Alert title="Charges Breakdown" color="blue">
              <Stack spacing="xs">
                <Group position="apart">
                  <Text size="sm">Per Client Charge ({selectedInvoice.clientCount} clients):</Text>
                  <Text size="sm">{formatCurrency(selectedInvoice.perClientCharge * selectedInvoice.clientCount)}</Text>
                </Group>
                {selectedInvoice.isInitialCharge && (
                  <Group position="apart">
                    <Text size="sm">Initial One-Time Cost:</Text>
                    <Text size="sm">{formatCurrency(selectedInvoice.initialOneTimeCost)}</Text>
                  </Group>
                )}
                <Group position="apart">
                  <Text size="sm">Infrastructure Cost:</Text>
                  <Text size="sm">{formatCurrency(selectedInvoice.infrastructureCost)}</Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Support Charges:</Text>
                  <Text size="sm">{formatCurrency(selectedInvoice.supportCharges)}</Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Feature/Report Charges:</Text>
                  <Text size="sm">{formatCurrency(selectedInvoice.newFeatureReportCharges)}</Text>
                </Group>
                <Group position="apart">
                  <Text size="sm" weight={600}>Subtotal:</Text>
                  <Text size="sm" weight={600}>{formatCurrency(selectedInvoice.subTotal)}</Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Tax:</Text>
                  <Text size="sm">{formatCurrency(selectedInvoice.taxAmount)}</Text>
                </Group>
                <Group position="apart">
                  <Text size="md" weight={700}>Total:</Text>
                  <Text size="md" weight={700}>{formatCurrency(selectedInvoice.totalAmount)}</Text>
                </Group>
              </Stack>
            </Alert>

            {selectedInvoice.paymentFailureReason && (
              <Alert icon={<IconAlertCircle size={16} />} title="Payment Failed" color="red">
                {selectedInvoice.paymentFailureReason}
              </Alert>
            )}

            {selectedInvoice.paymentTransactionId && (
              <Text size="sm" color="dimmed">
                Transaction ID: {selectedInvoice.paymentTransactionId}
              </Text>
            )}
          </Stack>
        )}
      </Modal>
    </Paper>
  );
};

export default PackageInvoices;

