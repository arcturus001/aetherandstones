/**
 * IMS AUTHENTICATION CONSUMER HOOK
 * =================================
 * 
 * Hook to access the IMS singleton instance from context.
 * Provides direct access to all IMS methods and properties.
 * 
 * USAGE:
 * ```tsx
 * const ims = useIMS();
 * 
 * // Access token
 * const token = ims.tokenData?.token;
 * 
 * // Access profile
 * const profile = ims.profileData;
 * 
 * // Sign out
 * ims.logout();
 * 
 * // Check if authenticated
 * const isAuthenticated = !!ims.tokenData?.token;
 * ```
 */

import { useContext } from 'react';
import { IMSContext } from './IMSContext';

export function useIMS() {
  const context = useContext(IMSContext);
  if (!context) {
    throw new Error('useIMS must be used within an IMSProvider');
  }
  return context;
}
export default useIMS;


