const enviroment = {
    // Use environment variables for different deployments
    baseURL: process.env.REACT_APP_API_URL || "https://localhost:7094/api/",
};

export default enviroment;
