import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SearchModal from '../components/SearchModal';
import Header from '../components/Header';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K shortcut for search
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="main-layout">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} onSearch={() => setSearchOpen(true)} />
      <div className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)} onSearch={() => setSearchOpen(true)} />
        <ChatWindow />
      </div>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
