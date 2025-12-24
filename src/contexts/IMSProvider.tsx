// IMS Provider stub - no longer using Adobe Identity Management Services
import React from 'react';
import { IMSContext } from "./IMSContext";
import IMS from "../utils/IMS";

export default function IMSProvider({ children }: { children: React.ReactNode }) {
  return (
    <IMSContext.Provider value={IMS}>
      {children}
    </IMSContext.Provider>
  );
}
