import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position:'fixed', top:16, right:16, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type==='error'?'#fee2e2':t.type==='info'?'#dbeafe':t.type==='warning'?'#fef9c3':'#dcfce7',
            color: t.type==='error'?'#b91c1c':t.type==='info'?'#1e40af':t.type==='warning'?'#92400e':'#15803d',
            padding:'12px 18px', borderRadius:10, fontWeight:700, fontSize:14,
            boxShadow:'0 4px 24px rgba(0,0,0,.18)', display:'flex', alignItems:'center', gap:10, maxWidth:340,
          }}>
            {t.type==='error'?'❌':t.type==='info'?'ℹ️':t.type==='warning'?'⚠️':'✅'} {t.msg}
            <button onClick={() => remove(t.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, marginLeft:'auto' }}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
