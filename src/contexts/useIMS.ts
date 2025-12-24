// IMS hook stub - no longer using Adobe Identity Management Services
import { useContext } from 'react';
import { IMSContext } from './IMSContext';
import type { Ims } from '../utils/IMS';

export default function useIMS(): Ims {
  const context = useContext(IMSContext);
  if (!context) {
    return {
      tokenData: undefined,
      adobeid: undefined,
    };
  }
  return context;
}
