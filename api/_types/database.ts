/**
 * Database model type definitions
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  passwordHash: string | null;
  createdAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string | null;
  emailSnapshot: string;
  total: number;
  currency: string;
  status: string;
  paymentProvider: string | null;
  paymentIntentId: string | null;
  createdAt: Date;
}

export interface PasswordSetupToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

// Database row types (as returned from PostgreSQL)
export interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  password_hash: string | null;
  created_at: Date;
}

export interface AddressRow {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string;
  country: string;
  created_at: Date;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  email_snapshot: string;
  total: number;
  currency: string;
  status: string;
  payment_provider: string | null;
  payment_intent_id: string | null;
  created_at: Date;
}

export interface PasswordSetupTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

// Helper functions to convert database rows to models
export function userRowToModel(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export function addressRowToModel(row: AddressRow): Address {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    region: row.region,
    postalCode: row.postal_code,
    country: row.country,
    createdAt: row.created_at,
  };
}

export function orderRowToModel(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    emailSnapshot: row.email_snapshot,
    total: parseFloat(row.total.toString()),
    currency: row.currency,
    status: row.status,
    paymentProvider: row.payment_provider,
    paymentIntentId: row.payment_intent_id,
    createdAt: row.created_at,
  };
}

export function passwordSetupTokenRowToModel(row: PasswordSetupTokenRow): PasswordSetupToken {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdAt: row.created_at,
  };
}


