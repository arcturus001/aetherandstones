import React from 'react';
import './SearchField.css';

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  'aria-label'?: string;
  placeholder?: string;
  className?: string;
  styles?: React.CSSProperties;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  'aria-label': ariaLabel,
  placeholder,
  className = '',
  styles,
  ...props
}) => {
  const classes = [
    'ui-search-field',
    className,
  ].filter(Boolean).join(' ');

  return (
    <input
      type="search"
      className={classes}
      style={styles}
      aria-label={ariaLabel}
      placeholder={placeholder}
      {...props}
    />
  );
};







