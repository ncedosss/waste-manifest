import React from 'react';
import { CheckboxChip } from './components.jsx';

export function WasteCheckboxGroup({ values, onChange }) {
  const handle = (e) => {
    const { name, checked } = e.target;
    onChange({ ...values, [name]: checked });
  };
  return (
    <div className="checkbox-group">
      <CheckboxChip label="Hazardous"     name="hazardous"    checked={values.hazardous}    onChange={handle} />
      <CheckboxChip label="Non-Hazardous" name="nonHazardous" checked={values.nonHazardous} onChange={handle} />
      <CheckboxChip label="Recyclable"    name="recyclable"   checked={values.recyclable}   onChange={handle} />
    </div>
  );
}

export function WasteFormCheckboxGroup({ values, onChange }) {
  const handle = (e) => {
    const { name, checked } = e.target;
    onChange({ ...values, [name]: checked });
  };
  return (
    <div className="checkbox-group">
      <CheckboxChip label="Solid"  name="solid"  checked={values.solid}  onChange={handle} />
      <CheckboxChip label="Sludge" name="sludge" checked={values.sludge} onChange={handle} />
      <CheckboxChip label="Liquid" name="liquid" checked={values.liquid} onChange={handle} />
    </div>
  );
}

export function ManagementActivityCheckGroup({ values, onChange }) {
  const handle = (e) => {
    const { name, checked } = e.target;
    onChange({ ...values, [name]: checked });
  };
  const options = [
    { name: 'donation',  label: 'Donation'  },
    { name: 'reuse',     label: 'Reuse'     },
    { name: 'sorting',   label: 'Sorting'   },
    { name: 'recycling', label: 'Recycling' },
    { name: 'treatment', label: 'Treatment' },
    { name: 'storage',   label: 'Storage'   },
    { name: 'landfill',  label: 'Landfill'  },
  ];
  return (
    <div className="checkbox-group">
      {options.map(({ name, label }) => (
        <CheckboxChip key={name} label={label} name={name} checked={values[name]} onChange={handle} />
      ))}
    </div>
  );
}

// Default export for backward compat
export default WasteCheckboxGroup;
