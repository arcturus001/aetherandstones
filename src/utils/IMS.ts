// IMS functionality removed - no longer using Adobe Identity Management Services
// This file is kept as a stub to prevent import errors

export interface Ims {
  tokenData?: {
    token: string;
  };
  adobeid?: {
    client_id: string;
  };
}

const IMS = {
  tokenData: undefined,
  adobeid: undefined,
};

export default IMS;
