import React from 'react';
import './SegmentedControl.css';

export interface SegmentedControlProps {
  options: Array<{ value: string; label: string }>;
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  styles?: React.CSSProperties;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
  styles: customStyles,
}) => {
  return (
    <div
      className={`ui-segmented-control ${className}`}
      style={customStyles}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`ui-segmented-control-item ${isSelected ? 'ui-segmented-control-item--selected' : ''}`}
            onClick={() => onChange(option.value === 'all' ? null : option.value)}
            style={{
              borderRadius: index === 0 
                ? '8px 0 0 8px' 
                : index === options.length - 1 
                ? '0 8px 8px 0' 
                : '0',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

