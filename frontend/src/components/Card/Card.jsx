import React from 'react';
import './Card.css';
const Card = ({ children, style={} }) => <div className="card" style={style}>{children}</div>;
export default Card;
