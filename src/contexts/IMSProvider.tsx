/**
 * IMS AUTHENTICATION PROVIDER
 * ============================
 *
 * Provides the IMS singleton instance through React Context.
 * The IMS class handles all authentication logic, token management,
 * and profile data. This provider simply makes it available to the
 * component tree.
 *
 * Waits for IMS to be ready (onReady callback) before rendering children.
 *
 * USAGE:
 * ```tsx
 * // Wrap your app
 * <IMSProvider>
 *   <App />
 * </IMSProvider>
 *
 * // Use in components via the consumer hook
 * const ims = useIMS();
 * const token = ims.tokenData?.token;
 * const profile = ims.profileData;
 * ims.logout();
 * ```
 */

import { type ReactNode, useState, useEffect } from "react";
import IMS from "../utils/IMS";
import { IMSContext } from "./IMSContext";

interface IMSProviderProps {
  children: ReactNode;
}

export function IMSProvider({ children }: IMSProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for IMS to be ready
    IMS.ready.then(() => {
      console.log("IMS ready - rendering app");
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return null;
  }

  return <IMSContext.Provider value={IMS}>{children}</IMSContext.Provider>;
}
export default IMSProvider;

