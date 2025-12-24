import React from 'react';
import './ActionButton.css';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isQuiet?: boolean;
  isDisabled?: boolean;
  className?: string;
  styles?: React.CSSProperties;
  'aria-label'?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  isQuiet = false,
  isDisabled = false,
  className = '',
  styles,
  'aria-label': ariaLabel,
  onClick,
  ...props
}) => {
  const classes = [
    'ui-action-button',
    isQuiet && 'ui-action-button--quiet',
    isDisabled && 'ui-action-button--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      style={styles}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

