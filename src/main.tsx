import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ShopProvider } from "./context/ShopContext";
import "./styles/styles.css";
import "./styles/stable.css";

const RouterBaseName = import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={RouterBaseName}>
      <ShopProvider>
        <Suspense fallback={<div className="route-loader" />}>
          <App />
        </Suspense>
      </ShopProvider>
    </BrowserRouter>
  </React.StrictMode>
);
