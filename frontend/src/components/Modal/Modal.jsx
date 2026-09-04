import React from 'react';
import './Modal.css';

const Modal = ({ title, onClose, children, wide, xlarge }) => (
  <div className="modal-overlay">
    <div className={`modal-box${wide?' modal-box--wide':''}${xlarge?' modal-box--xlarge':''}`}>
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

export default Modal;
