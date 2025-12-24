import React from 'react';
import { Disclosure, DisclosureHeader, DisclosureTitle, DisclosurePanel } from './Disclosure';
import './Accordion.css';

export interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  styles?: React.CSSProperties;
}

export interface AccordionItemProps {
  children: React.ReactNode;
  title: string;
  key?: string | number;
}

const AccordionComponent: React.FC<AccordionProps> = ({
  children,
  className = '',
  styles,
}) => {
  return (
    <div className={`ui-accordion ${className}`} style={styles}>
      {children}
    </div>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  title,
}) => {
  return (
    <Disclosure>
      <DisclosureHeader>
        <DisclosureTitle>{title}</DisclosureTitle>
      </DisclosureHeader>
      <DisclosurePanel>
        {children}
      </DisclosurePanel>
    </Disclosure>
  );
};

// Create Accordion with Item property
export const Accordion = Object.assign(AccordionComponent, {
  Item: AccordionItem,
});

