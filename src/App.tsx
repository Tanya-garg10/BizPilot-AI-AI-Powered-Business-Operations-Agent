import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, DashboardTab } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { CustomerChat } from './components/CustomerChat';
import { OverviewTab } from './components/OverviewTab';
import { ConversationsTab } from './components/ConversationsTab';
import { LeadsTab } from './components/LeadsTab';
import { AppointmentsTab } from './components/AppointmentsTab';
import { AIActivityTab } from './components/AIActivityTab';
import { PaymentsTab } from './components/PaymentsTab';
import { SettingsTab } from './components/SettingsTab';
import { Toast } from './components/Toast';
import { 
  DashboardStats, 
  Lead, 
  Customer, 
  Appointment, 
  AgentRun, 
  BusinessSettings, 
  LeadStage 
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'chat'>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const [stats, setStats] = useState<DashboardStats>({
    total_conversations: 0,
    qualified_leads: 0,
    appointments: 0,
    conversions: 0,
    revenue: 0,
    ai_actions: 0,
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>({
    business_name: "SkillBridge Academy",
    description: "Premier tech skills training academy",
    contact_phone: "+91 98765 43210",
    contact_email: "support@skillbridge.academy",
    services: [],
    faqs: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, leadsRes, customersRes, aptsRes, runsRes, settingsRes] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.ok ? r.json() : null),
        fetch('/api/leads').then(r => r.ok ? r.json() : []),
        fetch('/api/customers').then(r => r.ok ? r.json() : []),
        fetch('/api/appointments').then(r => r.ok ? r.json() : []),
        fetch('/api/agent-runs').then(r => r.ok ? r.json() : []),
        fetch('/api/settings').then(r => r.ok ? r.json() : null),
      ]);

      if (statsRes) setStats(statsRes);
      if (leadsRes) setLeads(leadsRes);
      if (customersRes) setCustomers(customersRes);
      if (aptsRes) setAppointments(aptsRes);
      if (runsRes) setAgentRuns(runsRes);
      if (settingsRes) setSettings(settingsRes);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        showToast('Demo activity seeded into Firestore successfully!', 'success');
        await fetchAllData();
      } else {
        throw new Error('Seed failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to seed demo data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpdateLeadStage = async (leadId: string, newStage: LeadStage) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_stage: newStage })
      });

      if (res.ok) {
        showToast(`Lead stage updated to ${newStage}`, 'success');
        await fetchAllData();
      } else {
        throw new Error('Failed to update stage');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating stage', 'error');
    }
  };

  const handleBookNewAppointment = async (aptData: Partial<Appointment>) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptData)
      });

      if (res.ok) {
        showToast('Appointment scheduled in Firestore!', 'success');
        await fetchAllData();
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating appointment', 'error');
    }
  };

  const handleSaveSettings = async (newSettings: BusinessSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      if (res.ok) {
        setSettings(newSettings);
        showToast('Business settings saved to Firestore!', 'success');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'dashboard') fetchAllData();
        }}
        businessName={settings.business_name}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
      />

      {currentView === 'landing' ? (
        <LandingPage
          onStartChat={() => setCurrentView('chat')}
          onOpenDashboard={() => {
            setCurrentView('dashboard');
            fetchAllData();
          }}
        />
      ) : currentView === 'chat' ? (
        <main className="flex-1 p-4 sm:p-6 bg-slate-950">
          <CustomerChat
            onAppointmentBooked={fetchAllData}
            showToast={showToast}
          />
        </main>
      ) : (
        /* Dashboard View */
        <div className="flex-1 flex">
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab === 'chat') {
                setCurrentView('chat');
              } else {
                fetchAllData();
              }
            }}
            businessName={settings.business_name}
          />

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-950 max-w-7xl">
            {activeTab === 'overview' && (
              <OverviewTab
                stats={stats}
                onRefresh={fetchAllData}
                isLoading={isLoading}
                showToast={showToast}
              />
            )}

            {activeTab === 'conversations' && (
              <ConversationsTab
                customers={customers}
                showToast={showToast}
              />
            )}

            {activeTab === 'leads' && (
              <LeadsTab
                leads={leads}
                onUpdateStage={handleUpdateLeadStage}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsTab
                appointments={appointments}
                onBookNewAppointment={handleBookNewAppointment}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'ai_activity' && (
              <AIActivityTab
                runs={agentRuns}
                onRefresh={fetchAllData}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsTab
                showToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onSaveSettings={handleSaveSettings}
                isLoading={isLoading}
              />
            )}
          </main>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
