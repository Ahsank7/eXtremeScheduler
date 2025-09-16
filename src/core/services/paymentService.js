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

export {
    getBillingInfoList,
    getWageInfoList,
    testCardCharge
};

