// src/components/SelectionWarning.js

import React from 'react';

export default function SelectionWarning({ onConfirm, onCancel }) {
  return (
    <div className="warning-modal" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: 'white',
        padding: 24,
        borderRadius: 8,
        minWidth: 300,
        textAlign: 'center'
      }}>
        <h3>Are you sure?</h3>
        <p>You won't be able to change your selections after saving!</p>
        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button onClick={onConfirm} style={{ marginRight: 10 }}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
