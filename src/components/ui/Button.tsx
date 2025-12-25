import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'quiet';
  size?: 'S' | 'M' | 'L' | 'XS';
  isPending?: boolean;
  isDisabled?: boolean;
  isEmphasized?: boolean;
  className?: string;
  styles?: React.CSSProperties;
  UNSAFE_className?: string;
  onPress?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'M',
  isPending = false,
  isDisabled = false,
  isEmphasized = false,
  className = '',
  styles,
  UNSAFE_className,
  onPress,
  onClick,
  ...props
}) => {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size.toLowerCase()}`,
    isPending && 'ui-button--pending',
    isDisabled && 'ui-button--disabled',
    isEmphasized && 'ui-button--emphasized',
    className,
    UNSAFE_className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isPending) {
      e.preventDefault();
      return;
    }
    onPress?.();
    onClick?.(e);
  };

  return (
    <button
      className={classes}
      style={styles}
      disabled={isDisabled || isPending}
      onClick={handleClick}
      {...props}
    >
      {isPending ? 'Loading...' : children}
    </button>
  );
};







