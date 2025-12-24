import React from 'react';

/**
 * Convert style object to inline styles
 * Handles Spectrum-style macro syntax with bracket-wrapped values
 */
function styleToInline(styles: Record<string, string | number | undefined | null>): React.CSSProperties {
  const result: React.CSSProperties = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;
    
    // Handle CSS property names (convert camelCase to kebab-case)
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Handle special cases
    if (key === 'marginX') {
      result.marginLeft = parseValue(value);
      result.marginRight = parseValue(value);
      continue;
    }
    if (key === 'paddingX') {
      result.paddingLeft = parseValue(value);
      result.paddingRight = parseValue(value);
      continue;
    }
    if (key === 'marginY') {
      result.marginTop = parseValue(value);
      result.marginBottom = parseValue(value);
      continue;
    }
    if (key === 'paddingY') {
      result.paddingTop = parseValue(value);
      result.paddingBottom = parseValue(value);
      continue;
    }
    
    // Handle values wrapped in brackets (arbitrary values)
    const parsedValue = parseValue(value);
    if (parsedValue !== undefined) {
      (result as Record<string, string | number>)[cssKey] = parsedValue;
    }
  }
  
  return result;
}

function parseValue(value: string | number | undefined | null): string | number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1);
  }
  if (typeof value === 'number') {
    return value;
  }
  return value;
}

/**
 * Style function that mimics the Spectrum style macro API
 * Returns inline styles as a CSSProperties object
 */
export function style(styles: Record<string, string | number | undefined | null>): React.CSSProperties {
  return styleToInline(styles);
}

// For className usage (returns empty string, use inline styles instead)
export function styleClassName(): string {
  return '';
}

