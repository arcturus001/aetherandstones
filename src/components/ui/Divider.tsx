import React from 'react';
import './Divider.css';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: 'S' | 'M' | 'L';
  className?: string;
  styles?: React.CSSProperties;
  UNSAFE_className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  size = 'M',
  className = '',
  styles,
  UNSAFE_className,
  ...props
}) => {
  const classes = [
    'ui-divider',
    `ui-divider--${orientation}`,
    `ui-divider--${size.toLowerCase()}`,
    className,
    UNSAFE_className,
  ].filter(Boolean).join(' ');

  return (
    <hr className={classes} style={styles} {...props} />
  );
};







