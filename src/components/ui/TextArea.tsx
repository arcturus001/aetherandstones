import React from 'react';
import './TextArea.css';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  errorMessage?: string;
  isRequired?: boolean;
  styles?: React.CSSProperties;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  errorMessage,
  isRequired,
  className = '',
  styles,
  id,
  ...props
}) => {
  const fieldId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const classes = [
    'ui-textarea',
    errorMessage && 'ui-textarea--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="ui-textarea-wrapper" style={styles}>
      {label && (
        <label htmlFor={fieldId} className="ui-textarea-label">
          {label}
          {isRequired && <span className="ui-textarea-required">*</span>}
        </label>
      )}
      <textarea
        id={fieldId}
        className={classes}
        aria-invalid={errorMessage ? 'true' : undefined}
        aria-describedby={errorMessage ? `${fieldId}-error` : undefined}
        {...props}
      />
      {errorMessage && (
        <div id={`${fieldId}-error`} className="ui-textarea-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
};







