import React from 'react';
import './QRCode.css';

const QRCode = ({ data, image, size = 150, label }) => {
  if (!data && !image) return null;
  const src = image || (data && String(data).startsWith('data:image/') ? data : `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=10`);
  return (
    <div className="qrcode-wrapper">
      <img src={src} alt="UPI QR Code" width={size} height={size} className="qrcode-img"
        onError={e => { e.target.style.display = 'none'; }} />
      {label && <div className="qrcode-label">{label}</div>}
    </div>
  );
};

export default QRCode;
