import React from 'react';
import './Badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  variant?: 'neutral' | 'positive' | 'negative' | 'informative' | 'accent';
  className?: string;
  styles?: React.CSSProperties;
  UNSAFE_className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  styles,
  UNSAFE_className,
  ...props
}) => {
  const classes = [
    'ui-badge',
    `ui-badge--${variant === 'accent' ? 'neutral' : variant}`,
    className,
    UNSAFE_className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} style={styles} {...props}>
      {children}
    </span>
  );
};

