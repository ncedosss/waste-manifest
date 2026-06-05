import React from 'react';
import { injectSharedStyles } from './sharedStyles';

export default function WasteItemModal({ open, onClose, onSave, data, setData, isEditing }) {
  injectSharedStyles();
  if (!open) return null;

  const handleSave = () => {
    const isValid =
      data.description.trim() !== '' &&
      data.packaging.trim() !== '' &&
      data.volume.trim() !== '' &&
      data.weight.trim() !== '';
    if (!isValid) return;
    onSave(data);
    onClose();
  };

  const fields = [
    { key: 'description', label: 'Waste Description',  type: 'text',   placeholder: 'e.g. Used oil, chemical drums…' },
    { key: 'packaging',   label: 'Packaging',          type: 'text',   placeholder: 'e.g. Drums, IBC, bags…' },
    { key: 'volume',      label: 'Volume (L)',          type: 'number', placeholder: '0' },
    { key: 'weight',      label: 'Weight (kg)',         type: 'number', placeholder: '0' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">{isEditing ? 'Edit Waste Item' : 'Add Waste Item'}</span>
          <button className="modal-close" onClick={onClose}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} className="field-wrap">
              <label className="field-label">{label}</label>
              <input
                className="field-input"
                type={type}
                placeholder={placeholder}
                value={data[key]}
                onChange={e => setData({ ...data, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="button" onClick={handleSave}>
            {isEditing ? 'Update Item' : 'Add Item'}
          </button>
        </div>

      </div>
    </div>
  );
}
