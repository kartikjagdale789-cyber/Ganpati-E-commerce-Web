import React from 'react';
import Navbar from '../Navbar/Navbar';
import './Sidebar.css';

/* Sidebar here acts as the page layout wrapper (top nav + content area).
   The existing project uses a top navigation bar, not a sidebar. */
const Layout = ({ children, dueCount }) => (
  <div className="layout">
    <Navbar dueCount={dueCount} />
    <main className="layout__main">{children}</main>
  </div>
);

export default Layout;
