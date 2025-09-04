'use client';

import { useState } from 'react';
import { sampleFunnel, FunnelBlock, HeroData, CTAData, TestimonialsData, CheckoutData } from '@/lib/funnelSchema';
import Hero from '@/components/blocks/Hero';
import CTA from '@/components/blocks/CTA';
import Testimonials from '@/components/blocks/Testimonials';
import Checkout from '@/components/blocks/Checkout';

export default function DemoPage() {
  const [funnel, setFunnel] = useState(sampleFunnel);
  const [isEditing, setIsEditing] = useState(true);

  const updateBlock = (blockId: string, newData: any) => {
    setFunnel(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId ? { ...block, data: newData } : block
      )
    }));
  };

  const renderBlock = (block: FunnelBlock) => {
    const commonProps = {
      key: block.id,
      isEditable: isEditing,
      onUpdate: (data: any) => updateBlock(block.id, data)
    };

    switch (block.type) {
      case 'hero':
        return <Hero data={block.data as HeroData} {...commonProps} />;
      case 'cta':
        return <CTA data={block.data as CTAData} {...commonProps} />;
      case 'testimonials':
        return <Testimonials data={block.data as TestimonialsData} {...commonProps} />;
      case 'checkout':
        return <Checkout data={block.data as CheckoutData} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Editor Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Funnel Editor</h1>
              <p className="text-sm text-gray-600">{funnel.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isEditing 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isEditing ? 'Preview Mode' : 'Edit Mode'}
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                Publish Funnel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Preview */}
      <div className="flex">
        {/* Sidebar - Block Library */}
        {isEditing && (
          <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Block Library</h3>
            <div className="space-y-2">
              <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <h4 className="font-medium text-gray-900">Hero Section</h4>
                <p className="text-sm text-gray-600">Eye-catching header</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <h4 className="font-medium text-gray-900">Call to Action</h4>
                <p className="text-sm text-gray-600">Drive conversions</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <h4 className="font-medium text-gray-900">Testimonials</h4>
                <p className="text-sm text-gray-600">Social proof</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <h4 className="font-medium text-gray-900">Checkout</h4>
                <p className="text-sm text-gray-600">Payment form</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${isEditing ? 'bg-gray-50' : 'bg-white'}`}>
          {isEditing && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>Edit Mode:</strong> Click on any text to edit. Changes are saved automatically.
              </p>
            </div>
          )}
          
          <div className="funnel-preview">
            {funnel.blocks
              .sort((a, b) => a.order - b.order)
              .map(renderBlock)}
          </div>
        </div>
      </div>

      {/* Agent Activity Panel (for demo) */}
      {isEditing && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-2">AI Agents Activity</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Copywriter Agent: Optimizing hero headline...
            </div>
            <div className="flex items-center text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              UI Optimizer: Analyzing conversion rates...
            </div>
            <div className="flex items-center text-purple-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Analytics Agent: Tracking user behavior...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
