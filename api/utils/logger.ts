/**
 * Structured logging utility for production monitoring
 * Provides consistent log format with timestamps, log levels, and context
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Format log message with timestamp and context
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Sanitize context to remove sensitive data
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;

  const sanitized: LogContext = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];

  for (const [key, value] of Object.entries(context)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => keyLower.includes(sensitive));

    if (isSensitive && typeof value === 'string') {
      // Mask sensitive values
      sanitized[key] = value.length > 4 ? `${value.substring(0, 2)}***${value.substring(value.length - 2)}` : '***';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const logger = {
  /**
   * Info log - general information
   */
  info: (message: string, context?: LogContext): void => {
    const sanitized = sanitizeContext(context);
    console.log(formatLog('info', message, sanitized));
  },

  /**
   * Warn log - warnings that don't stop execution
   */
  warn: (message: string, context?: LogContext): void => {
    const sanitized = sanitizeContext(context);
    console.warn(formatLog('warn', message, sanitized));
  },

  /**
   * Error log - errors that need attention
   */
  error: (message: string, error?: Error | unknown, context?: LogContext): void => {
    const sanitized = sanitizeContext(context);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(formatLog('error', message, sanitized));
    if (errorMessage) {
      console.error(`   Error: ${errorMessage}`);
    }
    if (errorStack && !isProduction) {
      console.error(`   Stack: ${errorStack}`);
    }
  },

  /**
   * Debug log - detailed debugging information (only in development)
   */
  debug: (message: string, context?: LogContext): void => {
    if (!isProduction) {
      const sanitized = sanitizeContext(context);
      console.debug(formatLog('debug', message, sanitized));
    }
  },

  /**
   * Log webhook event
   */
  webhook: (eventType: string, eventId: string, status: 'received' | 'processing' | 'success' | 'failed', context?: LogContext): void => {
    const sanitized = sanitizeContext(context);
    const message = `Webhook ${status}: ${eventType} (${eventId})`;
    
    if (status === 'failed') {
      logger.error(message, undefined, sanitized);
    } else if (status === 'success') {
      logger.info(message, sanitized);
    } else {
      logger.info(message, sanitized);
    }
  },

  /**
   * Log database operation
   */
  db: (operation: string, table: string, status: 'success' | 'error', context?: LogContext): void => {
    const sanitized = sanitizeContext(context);
    const message = `DB ${operation} on ${table}: ${status}`;
    
    if (status === 'error') {
      logger.error(message, undefined, sanitized);
    } else {
      logger.info(message, sanitized);
    }
  },

  /**
   * Log authentication event
   */
  auth: (event: 'login' | 'logout' | 'session_created' | 'session_expired' | 'password_set', userId: string, context?: LogContext): void => {
    const sanitized = sanitizeContext({ ...context, userId: userId.substring(0, 10) + '...' });
    logger.info(`Auth ${event}: ${userId.substring(0, 10)}...`, sanitized);
  },
};


