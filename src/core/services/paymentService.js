import { post } from "./httpService";


const getBillingInfoList = async (paymentObj) => {
    return await post("Billing/Detail/List", paymentObj);
};

const getWageInfoList = async (paymentObj) => {
    return await post("Wage/Detail/List", paymentObj);
};

const testCardCharge = async (cardData) => {
    return await post("Payment/test-charge", cardData);
};

const manualMarkAsPaid = async (paymentData) => {
    return await post("Payment/manual-mark-as-paid", paymentData);
};

export {
    getBillingInfoList,
    getWageInfoList,
    testCardCharge,
    manualMarkAsPaid
};

