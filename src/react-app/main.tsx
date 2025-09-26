import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Importar BrowserRouter
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter> {/* Envolver App com BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>
);