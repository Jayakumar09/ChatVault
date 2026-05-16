import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import RightPanel from './components/layout/RightPanel';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Conversation from './pages/Conversation';
import Media from './pages/Media';
import Timeline from './pages/Timeline';
import Starred from './pages/Starred';
import Settings from './pages/Settings';
import { AppProvider } from './context/AppContext';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <AppProvider>
      <div className="flex h-screen bg-background-primary overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
          />

          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/contacts" element={<Contacts onSelectContact={setSelectedContact} />} />
                  <Route path="/contacts/:id" element={<Conversation />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/media/:type" element={<Media />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/starred" element={<Starred />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </AnimatePresence>
            </main>

            {rightPanelOpen && selectedContact && (
              <RightPanel
                contact={selectedContact}
                onClose={() => setSelectedContact(null)}
              />
            )}
          </div>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;