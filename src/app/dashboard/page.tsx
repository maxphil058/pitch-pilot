'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  productName: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  timestamp: Date;
  status: 'active' | 'completed' | 'error';
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'txn_1',
      amount: 1.00,
      currency: 'USD',
      productName: 'Demo Funnel Credit',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'completed'
    },
    {
      id: 'txn_2',
      amount: 29.99,
      currency: 'USD',
      productName: 'AI Coffee Subscription - Monthly',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'completed'
    }
  ]);

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

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeFunnels, setActiveFunnels] = useState(3);
  const [conversionRate, setConversionRate] = useState(12.5);

  useEffect(() => {
    const revenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalRevenue(revenue);

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
  }, [transactions]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Judge Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time view of PitchPilot's AI agents and revenue generation</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Real-time Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Live Transactions</h2>
              <p className="text-sm text-gray-600">Real revenue being generated</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.productName}</p>
                      <p className="text-sm text-gray-600">{formatTime(transaction.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solace Agent Mesh Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Solace Agent Mesh</h2>
              <p className="text-sm text-gray-600">Distributed AI agents working in real-time</p>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {agentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      activity.status === 'active' ? 'bg-blue-500 animate-pulse' : 
                      activity.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.agent}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-400">{formatTime(activity.timestamp)}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => {
                const newTransaction: Transaction = {
                  id: `txn_${Date.now()}`,
                  amount: 1.00,
                  currency: 'USD',
                  productName: 'Demo Purchase',
                  timestamp: new Date(),
                  status: 'completed'
                };
                setTransactions(prev => [newTransaction, ...prev]);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Simulate $1 Purchase
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
