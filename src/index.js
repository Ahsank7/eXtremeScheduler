import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
//import "@mantine/notifications/styles.css";
import "./styles/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, useTheme } from "./core/context/ThemeContext";
import { SidebarProvider } from "./core/context/SidebarContext";
import { PermissionProvider } from "./core/context/PermissionContext";

const AppWrapper = () => {
  const { colorScheme } = useTheme();
  
  return (
    <MantineProvider 
      withGlobalStyles 
      withNormalizeCSS
      theme={{
        colorScheme,
        primaryColor: 'blue',
        fontFamily: 'Inter, sans-serif',
        headings: {
          fontFamily: 'Inter, sans-serif',
        },
      }}
    >
      <Notifications />
      <App />
    </MantineProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>

  // </React.StrictMode>
  <BrowserRouter>
    <ThemeProvider>
      <SidebarProvider>
        <PermissionProvider>
          <AppWrapper />
        </PermissionProvider>
      </SidebarProvider>
    </ThemeProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
