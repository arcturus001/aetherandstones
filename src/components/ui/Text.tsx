import React from 'react';
import './Text.css';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  as?: 'p' | 'span' | 'div' | 'label';
  variant?: 'body' | 'detail' | 'heading' | 'title';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  className?: string;
  styles?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  children,
  as = 'p',
  variant = 'body',
  size = 'md',
  weight = 'normal',
  color,
  className = '',
  styles,
  ...props
}) => {
  const Component = as;
  const classes = [
    'ui-text',
    `ui-text--${variant}`,
    `ui-text--${size}`,
    `ui-text--${weight}`,
    className,
  ].filter(Boolean).join(' ');

  const inlineStyle: React.CSSProperties = {
    ...styles,
    ...(color && { color }),
  };

  return (
    <Component className={classes} style={inlineStyle} {...props}>
      {children}
    </Component>
  );
};

