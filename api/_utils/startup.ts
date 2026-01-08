/**
 * Startup validation and initialization
 * Runs on server startup to validate configuration and log status
 */

import { validateEnv, logEnvStatus } from './env';
import { testConnection } from './db';
import { logger } from './logger';

/**
 * Initialize and validate production environment
 */
export async function startup(): Promise<void> {
  logger.info('Starting application...');

  // Validate environment variables
  const envValidation = validateEnv();
  if (!envValidation.valid) {
    logger.error('Missing required environment variables', undefined, {
      missing: envValidation.missing.join(', '),
    });
    throw new Error(`Missing required environment variables: ${envValidation.missing.join(', ')}`);
  }

  // Log environment status
  logEnvStatus();

  // Test database connection
  logger.info('Testing database connection...');
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.error('Database connection failed');
    throw new Error('Database connection failed');
  }
  logger.info('Database connection successful');

  // Log warnings
  if (envValidation.warnings.length > 0) {
    envValidation.warnings.forEach(warning => {
      logger.warn(warning);
    });
  }

  logger.info('Application startup complete');
}


