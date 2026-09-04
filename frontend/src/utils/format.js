export const fmt      = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const todayStr = ()  => new Date().toISOString().split('T')[0];
export const nowStr   = ()  => new Date().toLocaleString('en-IN');
export const genId    = ()  => `${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
