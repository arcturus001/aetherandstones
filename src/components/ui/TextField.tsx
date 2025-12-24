import React from 'react';
import './TextField.css';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  isRequired?: boolean;
  styles?: React.CSSProperties;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  errorMessage,
  isRequired,
  className = '',
  styles,
  id,
  ...props
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const classes = [
    'ui-text-field',
    errorMessage && 'ui-text-field--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="ui-text-field-wrapper" style={styles}>
      {label && (
        <label htmlFor={fieldId} className="ui-text-field-label">
          {label}
          {isRequired && <span className="ui-text-field-required">*</span>}
        </label>
      )}
      <input
        id={fieldId}
        type="text"
        className={classes}
        aria-invalid={errorMessage ? 'true' : undefined}
        aria-describedby={errorMessage ? `${fieldId}-error` : undefined}
        {...props}
      />
      {errorMessage && (
        <div id={`${fieldId}-error`} className="ui-text-field-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
};




