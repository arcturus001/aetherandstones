/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Shop from "./pages/Shop";
import EnergyGuide from "./pages/EnergyGuide";
import ComponentsReadme from "./pages/ComponentsReadme";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import CareGuide from "./pages/CareGuide";
import Warranty from "./pages/Warranty";
import About from "./pages/About";
import ShippingReturns from "./pages/ShippingReturns";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import ProductPreview from "./pages/ProductPreview";
import { style } from "./utils/styles";

function App() {
  const [isDarkMode] = useState(() => {
    // Check if user has a preference stored or system preference
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme on mount
  React.useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', theme);
    document.documentElement.style.colorScheme = theme;

    // Also try setting the class-based approach as fallback
    document.documentElement.classList.remove('spectrum--light', 'spectrum--dark', 'spectrum--darkest');
    document.documentElement.classList.add(isDarkMode ? 'spectrum--dark' : 'spectrum--light');

    console.log('Theme applied:', theme, 'isDarkMode:', isDarkMode);
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <div style={style({
        minHeight: "[100vh]",
        backgroundColor: "#050505",
        display: "flex",
        flexDirection: "column",
      })}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/energy" element={<EnergyGuide />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/care" element={<CareGuide />} />
          <Route path="/warranty" element={<Warranty />} />
          <Route path="/about" element={<About />} />
          <Route path="/shipping" element={<ShippingReturns />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/preview/:productId" element={<ProductPreview />} />
          <Route path="/framework" element={<ComponentsReadme />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
