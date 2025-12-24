/**
 * IMS CONTEXT DEFINITION
 * =======================
 *
 * Defines the React Context for the IMS singleton instance.
 */

import { createContext } from "react";
import type { Ims } from "../utils/IMS";

export const IMSContext = createContext<Ims | null>(null);

export default IMSContext;
