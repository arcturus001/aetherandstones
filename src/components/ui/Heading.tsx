import React from 'react';
import './Heading.css';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  styles?: React.CSSProperties;
  UNSAFE_className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  className = '',
  styles,
  UNSAFE_className,
  ...props
}) => {
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const classes = [
    'ui-heading',
    `ui-heading--h${level}`,
    className,
    UNSAFE_className,
  ].filter(Boolean).join(' ');

  const headingProps = {
    className: classes,
    style: styles,
    ...props,
  };

  return React.createElement(Component, headingProps, children);
};

