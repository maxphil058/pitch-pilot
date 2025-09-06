'use client';

import { useState } from 'react';
import { CheckoutData, Funnel } from '@/lib/funnelSchema';

interface CheckoutProps {
  data: CheckoutData;
  isEditable?: boolean;
  onUpdate?: (data: CheckoutData) => void;
  funnel?: Funnel;
  onFunnelUpdate?: (funnel: Funnel) => void;
  themeStyle?: {
    background?: string;
    ctaBackground?: string;
    ctaColor?: string;
  };
}

export default function Checkout({ data, isEditable = false, onUpdate, funnel, onFunnelUpdate, themeStyle }: CheckoutProps) {
  // Use funnel.checkout as single source of truth for price/currency/interval
  const displayPrice = funnel?.checkout?.price ?? data.price;
  const displayCurrency = funnel?.checkout?.currency ?? data.currency;
  const displayInterval = funnel?.checkout?.interval ?? data.interval;
  
  // Buyer details state (transient, not persisted)
  const [customerEmail, setCustomerEmail] = useState(funnel?.checkout?._temp?.email || '');
  const [customerName, setCustomerName] = useState(funnel?.checkout?._temp?.name || '');
  
  // Format price with Intl.NumberFormat
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };
  
  // Update funnel temp fields when inputs change
  const updateTempField = (field: 'email' | 'name', value: string) => {
    if (field === 'email') setCustomerEmail(value);
    if (field === 'name') setCustomerName(value);
    
    if (onFunnelUpdate && funnel) {
      onFunnelUpdate({
        ...funnel,
        checkout: {
          ...funnel.checkout,
          price: displayPrice,
          currency: displayCurrency,
          interval: displayInterval,
          _temp: {
            ...funnel.checkout?._temp,
            [field]: value
          }
        }
      });
    }
  };
  const handleUpdate = (field: keyof CheckoutData, value: string | number | string[]) => {
    if (onUpdate) {
      onUpdate({ ...data, [field]: value });
    }
  };

  const handleFeatureUpdate = (index: number, value: string) => {
    if (onUpdate) {
      const updatedFeatures = [...data.features];
      updatedFeatures[index] = value;
      onUpdate({ ...data, features: updatedFeatures });
    }
  };

  const addFeature = () => {
    if (onUpdate) {
      onUpdate({ ...data, features: [...data.features, 'New feature'] });
    }
  };

  const removeFeature = (index: number) => {
    if (onUpdate) {
      const updatedFeatures = data.features.filter((_, i) => i !== index);
      onUpdate({ ...data, features: updatedFeatures });
    }
  };

  const handleCheckout = async () => {
    try {
      // If paymentLink is present, redirect directly
      if (data.paymentLink && data.paymentLink.trim() !== '') {
        window.location.href = data.paymentLink;
        return;
      }
      
      // Otherwise, POST to /api/checkout with current funnel price data and customer details
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: displayPrice,
          currency: displayCurrency,
          interval: displayInterval,
          productName: data.productName,
          customerEmail: customerEmail.trim() || undefined,
          customerName: customerName.trim() || undefined
        })
      });

      const result = await response.json();

      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        console.error('Checkout failed:', result.error);
        alert('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  return (
    <section id="checkout" className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            {isEditable ? (
              <input
                type="text"
                value={data.productName}
                onChange={(e) => handleUpdate('productName', e.target.value)}
                className="text-2xl md:text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 outline-none text-center w-full mb-4"
                style={{ borderColor: isEditable ? '#d1d5db' : 'transparent' }}
                placeholder="Product name..."
              />
            ) : (
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {data.productName}
              </h3>
            )}
            
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl font-bold" style={{ color: isEditable ? '#2563eb' : 'var(--pp-cta-bg)' }}>
                {formatPrice(displayPrice, displayCurrency)}
              </span>
              <span className="text-gray-600 ml-2">/ {displayInterval}</span>
            </div>
            
            {isEditable ? (
              <textarea
                value={data.description}
                onChange={(e) => handleUpdate('description', e.target.value)}
                className="text-gray-600 bg-transparent border-b border-gray-200 outline-none w-full text-center resize-none"
                style={{ borderColor: isEditable ? '#d1d5db' : 'transparent' }}
                placeholder="Product description..."
                rows={2}
              />
            ) : (
              <p className="text-gray-600">{data.description}</p>
            )}
          </div>
          
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s included:</h4>
            <ul className="space-y-3">
              {data.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {isEditable ? (
                    <div className="flex items-center flex-1">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureUpdate(index, e.target.value)}
                        className="text-gray-700 bg-transparent border-b border-gray-200 outline-none flex-1"
                        style={{ borderColor: isEditable ? '#d1d5db' : 'transparent' }}
                        placeholder="Feature..."
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-700">{feature}</span>
                  )}
                </li>
              ))}
            </ul>
            
            {isEditable && (
              <button
                onClick={addFeature}
                className="mt-4 text-sm font-medium"
                style={{ color: 'var(--pp-cta-bg)' }}
              >
                + Add Feature
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {!isEditable && (
              <div className="space-y-4">
                {/* Buyer Details Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => updateTempField('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                      style={{
                        '--tw-ring-color': 'var(--pp-cta-bg)',
                        borderColor: customerEmail ? 'var(--pp-cta-bg)' : undefined
                      } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => updateTempField('name', e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                      style={{
                        '--tw-ring-color': 'var(--pp-cta-bg)',
                        borderColor: customerName ? 'var(--pp-cta-bg)' : undefined
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
                
                {/* Buy Now Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-opacity hover:opacity-90 shadow-lg pp-cta"
                  style={{ 
                    background: 'var(--pp-cta-bg)', 
                    color: 'var(--pp-cta-text)' 
                  }}
                >
                  Get {data.productName} – {formatPrice(displayPrice, displayCurrency)}
                </button>
              </div>
            )}
            
            {isEditable && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={data.stripePriceId || ''}
                  onChange={(e) => handleUpdate('stripePriceId', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none"
                  style={{ borderColor: '#d1d5db' }}
                  placeholder="Stripe Price ID (optional)"
                />
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                  style={{ backgroundColor: 'var(--pp-cta-bg)', color: 'var(--pp-cta-text)' }}
                >
                  Preview Checkout
                </button>
              </div>
            )}
            
            <p className="text-center text-sm text-gray-500">
              30-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
