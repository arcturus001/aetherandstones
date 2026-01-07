/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are set for production
 */

interface EnvConfig {
  DATABASE_URL: string;
  APP_URL: string;
  EMAIL_PROVIDER_KEY: string; // RESEND_API_KEY
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SESSION_SECRET?: string; // Optional, will generate if not set
  FROM_EMAIL?: string; // Optional, defaults to onboarding@resend.dev
  NODE_ENV?: string; // Optional, defaults to 'development'
}

const requiredEnvVars = [
  'DATABASE_URL',
  'APP_URL',
  'EMAIL_PROVIDER_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

const optionalEnvVars = [
  'SESSION_SECRET',
  'FROM_EMAIL',
  'NODE_ENV',
] as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  }

  // Check optional variables and warn if missing in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !process.env.SESSION_SECRET) {
    warnings.push('SESSION_SECRET not set in production. Sessions will not persist across restarts.');
  }

  if (isProduction && !process.env.FROM_EMAIL) {
    warnings.push('FROM_EMAIL not set. Using default: onboarding@resend.dev');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Get environment configuration with validation
 */
export function getEnvConfig(): EnvConfig {
  const validation = validateEnv();
  
  if (!validation.valid) {
    const errorMsg = `Missing required environment variables: ${validation.missing.join(', ')}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      console.warn(`⚠️ ${warning}`);
    });
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    APP_URL: process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000',
    EMAIL_PROVIDER_KEY: process.env.EMAIL_PROVIDER_KEY || process.env.RESEND_API_KEY!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    SESSION_SECRET: process.env.SESSION_SECRET,
    FROM_EMAIL: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

/**
 * Log environment status (without exposing secrets)
 */
export function logEnvStatus(): void {
  const validation = validateEnv();
  
  console.log('📋 Environment Variables Status:');
  console.log(`   Required: ${validation.valid ? '✅ All set' : `❌ Missing: ${validation.missing.join(', ')}`}`);
  
  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      console.log(`   ⚠️ ${warning}`);
    });
  }

  // Log non-sensitive config
  const config = getEnvConfig();
  console.log(`   APP_URL: ${config.APP_URL}`);
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   FROM_EMAIL: ${config.FROM_EMAIL}`);
  console.log(`   DATABASE_URL: ${config.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_PROVIDER_KEY: ${config.EMAIL_PROVIDER_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   STRIPE_SECRET_KEY: ${config.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   STRIPE_WEBHOOK_SECRET: ${config.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}`);
}


