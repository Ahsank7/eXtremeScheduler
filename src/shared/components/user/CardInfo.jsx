import { Button, TextInput, Textarea, Loader, Select, LoadingOverlay } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { accountService, lookupService, paymentService } from "core/services";
import { localStoreService } from "core/services";
import { UserType } from "core/enum";

// Luhn algorithm for card number validation
const luhnCheck = (cardNumber) => {
  if (!cardNumber) return false;
  
  const digits = cardNumber.replace(/\s/g, '').split('').map(Number);
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Format card number with spaces for better readability
const formatCardNumber = (value) => {
  if (!value) return value;
  
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

const schema = zod.object({
  cardHolderName: zod.string().nonempty("Card Holder Name is required").max(50, "Card Holder Name must be 50 characters or less"),
  cardNumber: zod.string()
    .nonempty("Card Number is required")
    .refine((val) => luhnCheck(val), "Invalid card number"),
  cvv: zod.string()
    .nonempty("CVV is required")
    .regex(/^\d+$/, "CVV must contain only numbers")
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV must be at most 4 digits"),
  expiryMonth: zod.number().min(1, "Expiry Month is required").max(12, "Invalid expiry month"),
  expiryYear: zod.number().min(new Date().getFullYear(), "Card has expired"),
  typeId: zod.number().min(1, "Card type is required"),
}).refine((data) => {
  // Check if expiry date is in the past
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  
  if (data.expiryYear < currentYear) return false;
  if (data.expiryYear === currentYear && data.expiryMonth < currentMonth) return false;
  
  return true;
}, {
  message: "Card has expired",
  path: ["expiryMonth", "expiryYear"]
});

export const CardInfo = ({ userId, organizationId, userType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [typesOptions, settypesOptions] = useState([]);
  const [currentUserType, setCurrentUserType] = useState(null);

  const handleCardNumberChange = (event) => {
    const formatted = formatCardNumber(event.target.value);
    form.setFieldValue('cardNumber', formatted);
  };
  
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      cardHolderName: "",
      cardNumber: "",
      expiryMonth: 0,
      expiryYear: 0,
      cvv: "",
      typeId: 0,
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    setCurrentUserType(parseInt(userType));
  }, []);

  const fetchLookupData = async () => {
    try {
      const typeResponse = await lookupService.getLookupList({
        lookupType: "CardType",
        organizationId,
      });
      settypesOptions(
        (typeResponse?.result || []).map((item) => ({ value: item.id, label: item.name }))
      );
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch lookup data",
        color: "red",
      });
    }
  };

  useEffect(() => {
    if (typesOptions.length === 0) {
      fetchLookupData();
    }
  }, [typesOptions.length, organizationId]);

  const fetchUserCardInfo = async () => {
    if (userId) {
      setIsFetching(true);
      try {
        const response = await accountService.getUserCardInfo(userId);
        console.log('Card Info Response:', response); // Debug log
        
        // Mask card number for security (show only last 4 digits)
        const maskedCardNumber = response?.cardNumber 
          ? `**** **** **** ${response.cardNumber.slice(-4)}`
          : "";
          
        form.setValues({
          cardHolderName: response?.cardHolderName || "",
          cardNumber: maskedCardNumber,
          expiryMonth: response?.expiryMonth || 0,
          expiryYear: response?.expiryYear || 0,
          cvv: response?.cvv || "",
          typeId: response?.typeId || 0,
        });
      } catch (error) {
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "Error",
          message: "Failed to fetch Card item",
          color: "red",
          style: {
            backgroundColor: "white",
          },
        });
      } finally {
        setIsFetching(false);
      }
    }
  };

  useEffect(() => {
    fetchUserCardInfo();
  }, [userId]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    try {
      // Check if current user is Client UserType 1
      if (currentUserType === UserType.Clients) {
        // Check if card number is masked (not a real card number)
        if (values.cardNumber.includes('****')) {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Invalid Card Number",
            message: "Please enter the full card number, not the masked version.",
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
          setIsLoading(false);
          return;
        }
        
        // Perform $1 test charge for card validation
        setIsValidating(true);
        const testChargeData = {
          cardHolderName: values.cardHolderName,
          cardNumber: values.cardNumber.replace(/\s/g, ''), // Remove spaces for API
          cvv: values.cvv,
          expiryMonth: values.expiryMonth,
          expiryYear: values.expiryYear
        };

        try {
          const testChargeResult = await paymentService.testCardCharge(testChargeData);
          console.log('Test Charge Result:', testChargeResult); // Debug log
          
          // Check if the response indicates success
          if (!testChargeResult.success) {
            notifications.show({
              withCloseButton: true,
              autoClose: 5000,
              title: "Card Validation Failed",
              message: testChargeResult.message || "Card validation failed. Please check your card details.",
              color: "red",
              style: {
                backgroundColor: "white",
              },
            });
            setIsValidating(false);
            setIsLoading(false);
            return;
          }

          // Card validation successful, proceed with saving
          notifications.show({
            withCloseButton: true,
            autoClose: 3000,
            title: "Card Validated",
            message: "Card validated successfully with $1 test charge. Proceeding to save card information.",
            color: "green",
            style: {
              backgroundColor: "white",
            },
          });
          
          // Reset validation state
          setIsValidating(false);
        } catch (error) {
          console.error("Card validation error:", error);
          let errorMessage = "Failed to validate card. Please check your card details and try again.";
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Card Validation Error",
            message: errorMessage,
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
          setIsValidating(false);
          setIsLoading(false);
          return;
        }
      }

        // Check if card number is masked (not a real card number) for all users
        if (values.cardNumber.includes('****')) {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Invalid Card Number",
            message: "Please enter the full card number, not the masked version.",
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
          setIsLoading(false);
          return;
        }
        
        // Check if card number is empty after removing spaces
        if (!values.cardNumber.replace(/\s/g, '')) {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Invalid Card Number",
            message: "Please enter a valid card number.",
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
          setIsLoading(false);
          return;
        }
      
      // Proceed with saving card info (for all user types)
      let userCardInfoObj = {
        userId: userId,
        cardHolderName: values.cardHolderName,
        cardNumber: values.cardNumber.replace(/\s/g, ''), // Remove spaces for storage
        expiryMonth: values.expiryMonth,
        expiryYear: values.expiryYear,
        cvv: values.cvv,
        typeId: values.typeId,
      };

      let result = await accountService.upsertUserCardInfo(userCardInfoObj);
      
      const successMessage = currentUserType === UserType.Clients 
        ? "Card information saved successfully after $1 validation charge."
        : result.message;

      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Success",
        message: successMessage,
        color: "green",
        style: {
          backgroundColor: "white",
        },
      });

      fetchUserCardInfo();
    } catch (error) {
      console.error("Save card error:", error);
      let errorMessage = "Failed to save card information. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (currentUserType === UserType.Clients) {
        errorMessage = `Failed to save card information: ${errorMessage}`;
      }

      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Error",
        message: errorMessage,
        color: "red",
        style: {
          backgroundColor: "white",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={isFetching} />
      <form
        onSubmit={form.onSubmit((values) =>
          handleSubmit({ ...values, typeId: values.typeId })
        )}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div style={{ maxWidth: "400px" }}>
            <h2 style={{ 
              textAlign: "center", 
              marginBottom: "1.5rem", 
              color: "#495057",
              fontSize: "1.5rem",
              fontWeight: "600"
            }}>
              {currentUserType === UserType.Clients ? "Add Credit/Debit Card" : "Add Credit/Debit Card"}
            </h2>
            
            {currentUserType === UserType.Clients && (
              <div style={{ 
                marginBottom: "1.5rem", 
                padding: "0.75rem", 
                backgroundColor: "#e7f3ff", 
                border: "1px solid #b3d9ff", 
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                color: "#0056b3"
              }}>
                <strong>Important:</strong> A $1.00 test charge will be made to validate your card. This charge will be immediately refunded and will not appear on your final statement.
              </div>
            )}
            
            <Select
              label="Type"
              placeholder="Select Type"
              {...form.getInputProps("typeId")}
              data={typesOptions}
              required
            />
            <TextInput
              label="Card Holder Name"
              placeholder="Enter Card Holder Name (max 50 characters)"
              required
              maxLength={50}
              {...form.getInputProps("cardHolderName")}
            />
            <TextInput
              label="Card Number"
              placeholder="Enter Card Number (e.g., 4242 4242 4242 4242)"
              {...form.getInputProps("cardNumber")}
              onChange={handleCardNumberChange}
              required
            />
            {form.values.cardNumber && form.values.cardNumber.includes('****') && (
              <div style={{ 
                marginTop: "0.25rem", 
                fontSize: "0.75rem", 
                color: "#6c757d",
                fontStyle: "italic"
              }}>
                Card number is masked for security. Enter the full number to update.
              </div>
            )}
            <Select
              label="Expiry Month"
              placeholder="Select Expiry Month"
              {...form.getInputProps("expiryMonth")}
              data={[...Array(12).keys()].map((month) => ({
                value: month + 1,
                label: month + 1,
              }))}
              required
            />
            <Select
              label="Expiry Year"
              placeholder="Select Expiry Year"
              {...form.getInputProps("expiryYear")}
              data={[...Array(36).keys()].map((year) => ({
                value: year + 2024,
                label: year + 2024,
              }))}
              required
            />
            <TextInput
              label="CVV"
              placeholder="Enter CVV (max 4 characters)"
              {...form.getInputProps("cvv")}
              maxLength={4}
              required
            />

            {currentUserType === UserType.Clients && isValidating && (
              <div style={{ 
                marginTop: "1rem", 
                padding: "1rem", 
                backgroundColor: "#fff3cd", 
                border: "1px solid #ffeaa7", 
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                color: "#856404",
                textAlign: "center"
              }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <Loader size="sm" style={{ marginRight: "0.5rem" }} />
                  Processing $1.00 test charge...
                </div>
                <div style={{ fontSize: "0.75rem", color: "#856404" }}>
                  This may take a few moments. Please do not close this page.
                </div>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              mt="xl"
              size="md"
              loading={isLoading || isValidating}
              loaderPosition="right"
              disabled={isValidating}
            >
              {currentUserType === UserType.Clients 
                ? (isValidating ? "Validating Card..." : "Validate & Save Card") 
                : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
