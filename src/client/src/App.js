import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
// import HistoricalDashboard from './pages/HistoricalDashboard';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Relationships from './pages/Relationships';
import CadenceMatrix from './components/CadenceMatrix';
import ATSIntelligence from './components/ATSIntelligence';
import AccountCommandCenter from './components/AccountCommandCenter';
import DailyAccountabilityPage from './pages/DailyAccountabilityPage';
import LinkedInNetworkIntelligence from './components/LinkedInNetworkIntelligence';
import LinkedInIntroSuggestions from './components/LinkedInIntroSuggestions';
import Intelligence from './pages/Intelligence';
import Salesforce from './pages/Salesforce';
import Landing from './pages/Landing';

// Dashboard Layout Component for protected routes
const DashboardLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />
          
          {/* Protected dashboard routes under /fa/mattedwards */}
          <Route path="/fa/mattedwards" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/daily" element={
            <DashboardLayout>
              <DailyAccountabilityPage />
            </DashboardLayout>
          } />
          {/* <Route path="/fa/mattedwards/historical" element={
            <DashboardLayout>
              <HistoricalDashboard />
            </DashboardLayout>
          } /> */}
          <Route path="/fa/mattedwards/accounts" element={
            <DashboardLayout>
              <Accounts />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/accounts/:id" element={
            <DashboardLayout>
              <AccountDetail />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/accounts/:accountId/command" element={
            <DashboardLayout>
              <AccountCommandCenter />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/network" element={
            <DashboardLayout>
              <LinkedInNetworkIntelligence />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/intros" element={
            <DashboardLayout>
              <LinkedInIntroSuggestions />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/relationships" element={
            <DashboardLayout>
              <Relationships />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/cadence" element={
            <DashboardLayout>
              <CadenceMatrix />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/ats" element={
            <DashboardLayout>
              <ATSIntelligence />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/intelligence" element={
            <DashboardLayout>
              <Intelligence />
            </DashboardLayout>
          } />
          <Route path="/fa/mattedwards/salesforce" element={
            <DashboardLayout>
              <Salesforce />
            </DashboardLayout>
          } />
          
          {/* Legacy routes - redirect to new structure */}
          <Route path="/dashboard" element={<Landing />} />
          <Route path="/accounts" element={<Landing />} />
          <Route path="/relationships" element={<Landing />} />
          <Route path="/intelligence" element={<Landing />} />
          <Route path="/salesforce" element={<Landing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;