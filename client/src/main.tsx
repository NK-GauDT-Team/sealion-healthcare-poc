import { createRoot } from "react-dom/client";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// createRoot(document.getElementById("root")!).render(
//   <QueryClientProvider client={queryClient}>
//     <App />
//   </QueryClientProvider>
// );

// Vite exposes the repo base as "/sealion-healthcare-poc/"
const routerBase = import.meta.env.BASE_URL.replace(/\/$/, ""); // remove trailing slash

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WouterRouter base={routerBase}>
      <App />
    </WouterRouter>
  </React.StrictMode>
);