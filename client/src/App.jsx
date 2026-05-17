import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Preferences from './pages/Preferences';
import Backups from './pages/Backups';
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

function AppLayout() {
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
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/contacts" element={<Contacts onSelectContact={setSelectedContact} />} />
                  <Route path="/contacts/:id" element={<Conversation />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/media/:type" element={<Media />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/starred" element={<Starred />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/preferences" element={<Preferences />} />
                  <Route path="/backups" element={<Backups />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;