import React from 'react';
import './Button.css';

const Button = ({ children, onClick, variant='primary', small, disabled, full, type='button', style: extra={} }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn btn--${variant}${small?' btn--small':''}${full?' btn--full':''}${disabled?' btn--disabled':''}`}
    style={extra}
  >
    {children}
  </button>
);

export default Button;
