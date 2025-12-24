import React, { useState } from 'react';
import './Disclosure.css';

export interface DisclosureProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export interface DisclosureHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface DisclosureTitleProps {
  children: React.ReactNode;
  className?: string;
  styles?: React.CSSProperties;
}

export interface DisclosurePanelProps {
  children: React.ReactNode;
  className?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const childrenArray = React.Children.toArray(children);
  const header = childrenArray.find((child): child is React.ReactElement => 
    React.isValidElement(child) && child.type === DisclosureHeader
  );
  const panel = childrenArray.find((child): child is React.ReactElement => 
    React.isValidElement(child) && child.type === DisclosurePanel
  );

  return (
    <div className={`ui-disclosure ${className}`}>
      {header && React.cloneElement(header as React.ReactElement, {
        onClick: () => setIsOpen(!isOpen),
        'aria-expanded': isOpen,
      })}
      {isOpen && panel && (
        <div className="ui-disclosure-panel-wrapper">
          {panel}
        </div>
      )}
    </div>
  );
};

export const DisclosureHeader: React.FC<DisclosureHeaderProps & { onClick?: () => void; 'aria-expanded'?: boolean }> = ({
  children,
  className = '',
  onClick,
  'aria-expanded': ariaExpanded,
}) => {
  return (
    <button
      className={`ui-disclosure-header ${className}`}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      type="button"
    >
      {children}
    </button>
  );
};

export const DisclosureTitle: React.FC<DisclosureTitleProps> = ({
  children,
  className = '',
  styles,
}) => {
  return (
    <span className={`ui-disclosure-title ${className}`} style={styles}>
      {children}
    </span>
  );
};

export const DisclosurePanel: React.FC<DisclosurePanelProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`ui-disclosure-panel ${className}`}>
      {children}
    </div>
  );
};

