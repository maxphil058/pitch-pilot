import { CheckoutData } from '@/lib/funnelSchema';

interface CheckoutProps {
  data: CheckoutData;
  isEditable?: boolean;
  onUpdate?: (data: CheckoutData) => void;
}

export default function Checkout({ data, isEditable = false, onUpdate }: CheckoutProps) {
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
    if (data.stripePriceId) {
      // In a real app, this would call your Stripe checkout API
      console.log('Initiating checkout for:', data.productName);
      // For demo purposes, we'll just show an alert
      alert(`Checkout initiated for ${data.productName} - $${data.price}`);
    } else {
      alert('Stripe integration not configured yet');
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
                className="text-2xl md:text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none text-center w-full mb-4"
                placeholder="Product name..."
              />
            ) : (
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {data.productName}
              </h3>
            )}
            
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-blue-600">
                {data.currency === 'USD' ? '$' : data.currency}
                {isEditable ? (
                  <input
                    type="number"
                    value={data.price}
                    onChange={(e) => handleUpdate('price', parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none w-20 text-center"
                    step="0.01"
                  />
                ) : (
                  data.price
                )}
              </span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
            
            {isEditable ? (
              <textarea
                value={data.description}
                onChange={(e) => handleUpdate('description', e.target.value)}
                className="text-gray-600 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none w-full text-center resize-none"
                placeholder="Product description..."
                rows={2}
              />
            ) : (
              <p className="text-gray-600">{data.description}</p>
            )}
          </div>
          
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">What's included:</h4>
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
                        className="text-gray-700 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none flex-1"
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
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Feature
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {!isEditable && (
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Get Started Now
              </button>
            )}
            
            {isEditable && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={data.stripePriceId || ''}
                  onChange={(e) => handleUpdate('stripePriceId', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                  placeholder="Stripe Price ID (optional)"
                />
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
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
