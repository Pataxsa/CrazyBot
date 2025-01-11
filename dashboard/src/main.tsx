import "./index-min.css";

import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { createRoot } from "react-dom/client";

import Layout from "@/components/Layout";
import App from "./App";
import Docs from "./Docs";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<App />} />
                    <Route path="docs" element={<Docs />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
