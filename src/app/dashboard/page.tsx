'use client';

import { useState, useEffect } from 'react';
import DashboardAccess from './access';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  createdAt: Date;
}

interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  timestamp: Date;
  status: 'active' | 'completed' | 'error';
}

interface MeshEvent {
  topic: string;
  payload: any;
  time: string;
  type?: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutToast, setCheckoutToast] = useState<{ amount: number; currency: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [agentPulses, setAgentPulses] = useState<Record<string, boolean>>({});

  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([
    {
      id: 'act_1',
      agent: 'Copywriter Agent',
      action: 'Generated new hero headline variant',
      timestamp: new Date(Date.now() - 1000 * 30),
      status: 'completed'
    },
    {
      id: 'act_2',
      agent: 'UI Optimizer Agent',
      action: 'A/B testing CTA button colors',
      timestamp: new Date(Date.now() - 1000 * 45),
      status: 'active'
    },
    {
      id: 'act_3',
      agent: 'Analytics Agent',
      action: 'Analyzing conversion funnel performance',
      timestamp: new Date(Date.now() - 1000 * 60),
      status: 'active'
    },
    {
      id: 'act_4',
      agent: 'Video Script Agent',
      action: 'Generating launch video storyboard',
      timestamp: new Date(Date.now() - 1000 * 90),
      status: 'completed'
    }
  ]);

  const [activeFunnels, setActiveFunnels] = useState(3);
  const [conversionRate, setConversionRate] = useState(12.5);
  const [meshEvents, setMeshEvents] = useState<MeshEvent[]>([]);
  const [meshConnected, setMeshConnected] = useState(false);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions.map((t: { id: string; amount: number; currency: string; createdAt: string }) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        })));
        setTotalRevenue(data.totalRevenue / 100); // Convert from cents to dollars
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/dashboard/auth');
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Connect to mesh event stream
  useEffect(() => {
    if (!isAuthenticated) return;
    const eventSource = new EventSource('/api/mesh/stream');
    
    eventSource.onopen = () => {
      setMeshConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          setMeshConnected(true);
        } else if (data.type === 'heartbeat') {
          // Handle heartbeat silently
        } else {
          // Regular mesh event
          setMeshEvents(prev => [data, ...prev.slice(0, 199)]); // Cap at 200 events
          
          // Auto-scroll to latest event
          setTimeout(() => {
            const logElement = document.getElementById('agent-log');
            if (logElement) {
              logElement.scrollTop = 0;
            }
          }, 100);
          
          // Handle checkout success events
          if (data.topic === 'pitchpilot/checkout/success' && data.payload) {
            const { amount, currency } = data.payload;
            setCheckoutToast({ amount: amount / 100, currency }); // Convert from cents to dollars
            
            // Auto-hide toast after 3 seconds
            setTimeout(() => {
              setCheckoutToast(null);
            }, 3000);
            
            // Refresh transactions to update revenue
            fetchTransactions();
          }
          
          // Handle agent events for pulse animations
          const agentTopics = {
            'pitchpilot/copywriter/done': 'copywriter',
            'pitchpilot/ui/done': 'ui',
            'pitchpilot/analytics/ab-suggestion': 'analytics',
            'pitchpilot/video/script': 'video'
          };
          
          const agentType = agentTopics[data.topic as keyof typeof agentTopics];
          if (agentType) {
            setAgentPulses(prev => ({ ...prev, [agentType]: true }));
            setTimeout(() => {
              setAgentPulses(prev => ({ ...prev, [agentType]: false }));
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error parsing mesh event:', error);
      }
    };
    
    eventSource.onerror = () => {
      setMeshConnected(false);
    };
    
    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTransactions();

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Randomly add new agent activity
      if (Math.random() > 0.7) {
        const agents = ['Copywriter Agent', 'UI Optimizer Agent', 'Analytics Agent', 'Video Script Agent'];
        const actions = [
          'Optimizing conversion copy',
          'Testing new layout variations',
          'Analyzing user behavior patterns',
          'Generating video thumbnails',
          'Updating funnel performance metrics'
        ];
        
        const newActivity: AgentActivity = {
          id: `act_${Date.now()}`,
          agent: agents[Math.floor(Math.random() * agents.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          timestamp: new Date(),
          status: 'active'
        };
        
        setAgentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const sendTestEvent = async () => {
    try {
      const response = await fetch('/api/mesh/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'pitchpilot/test',
          payload: { hello: 'world' }
        }),
      });

      if (!response.ok) {
        console.error('Failed to send test event');
      }
    } catch (error) {
      console.error('Error sending test event:', error);
    }
  };

  const runDemoScript = async () => {
    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: 'AI Coffee Subscription' }),
      });

      if (!response.ok) {
        console.error('Failed to run demo script');
      }
    } catch (error) {
      console.error('Error running demo script:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Show access form if not authenticated
  if (isAuthenticated === false) {
    return <DashboardAccess onAccessGranted={() => setIsAuthenticated(true)} />;
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Checkout Success Toast */}
      {checkoutToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Payment Received!</p>
              <p className="text-sm">{formatCurrency(checkoutToast.amount, checkoutToast.currency)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Judge Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time view of PitchPilot&apos;s AI agents and revenue generation</p>
          </div>
          <button
            onClick={runDemoScript}
            className="bg-purple-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Run Demo Script
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue, 'USD')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Funnels</p>
                <p className="text-2xl font-bold text-gray-900">{activeFunnels}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Agent Log Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Real-time Agent Log</h2>
                  <p className="text-sm text-gray-600">
                    Live mesh events {meshConnected ? 
                      <span className="text-green-600">● Connected</span> : 
                      <span className="text-red-600">● Disconnected</span>
                    }
                  </p>
                </div>
                <button
                  onClick={sendTestEvent}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Send Test Event
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto" id="agent-log">
                {meshEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No events yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Run Demo Script&quot; to see agent activity</p>
                  </div>
                ) : (
                  meshEvents.map((event, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-600">{event.topic}</span>
                        <span className="text-xs text-gray-500">{new Date(event.time).toLocaleTimeString()}</span>
                      </div>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto bg-white p-2 rounded border">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Revenue Counter & Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Revenue & Transactions</h2>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalRevenue, 'USD')}</p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Premium</p>
                          <p className="text-xs text-gray-600">{formatTime(transaction.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 text-sm">
                            {formatCurrency(transaction.amount / 100, transaction.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Agent Cards */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">AI Agents</h2>
                <p className="text-sm text-gray-600">Live activity status</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'copywriter', name: 'Copywriter', icon: '✍️', color: 'blue' },
                    { key: 'ui', name: 'UI Optimizer', icon: '🎨', color: 'purple' },
                    { key: 'analytics', name: 'Analytics', icon: '📊', color: 'green' },
                    { key: 'video', name: 'Video Script', icon: '🎬', color: 'orange' }
                  ].map((agent) => (
                    <div
                      key={agent.key}
                      className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                        agentPulses[agent.key]
                          ? `border-${agent.color}-500 bg-${agent.color}-50 animate-pulse`
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{agent.icon}</div>
                        <p className="font-medium text-gray-900 text-sm">{agent.name}</p>
                        <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                          agentPulses[agent.key] ? `bg-${agent.color}-500` : 'bg-gray-300'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/dev/simulate-sale', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  if (!response.ok) {
                    console.error('Failed to simulate sale');
                  }
                } catch (error) {
                  console.error('Error simulating sale:', error);
                }
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Simulate Sale ($1.00)
            </button>
            <button 
              onClick={() => fetchTransactions()}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Refresh Transactions
            </button>
            <button 
              onClick={() => setActiveFunnels(prev => prev + 1)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Funnel
            </button>
            <button 
              onClick={() => setConversionRate(prev => Math.min(100, prev + Math.random() * 2))}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Boost Conversion Rate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
