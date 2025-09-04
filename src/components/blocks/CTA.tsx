import { CTAData } from '@/lib/funnelSchema';

interface CTAProps {
  data: CTAData;
  isEditable?: boolean;
  onUpdate?: (data: CTAData) => void;
}

export default function CTA({ data, isEditable = false, onUpdate }: CTAProps) {
  const handleUpdate = (field: keyof CTAData, value: string) => {
    if (onUpdate) {
      onUpdate({ ...data, [field]: value });
    }
  };

  const getButtonStyles = (style: string) => {
    const baseStyles = "px-8 py-4 rounded-lg font-semibold text-lg transition-colors";
    switch (style) {
      case 'primary':
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
      case 'secondary':
        return `${baseStyles} bg-gray-600 text-white hover:bg-gray-700`;
      case 'outline':
        return `${baseStyles} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white`;
      default:
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
    }
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        {isEditable ? (
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleUpdate('title', e.target.value)}
            className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none w-full text-center"
            placeholder="Enter CTA title..."
          />
        ) : (
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {data.title}
          </h2>
        )}
        
        {isEditable ? (
          <textarea
            value={data.description}
            onChange={(e) => handleUpdate('description', e.target.value)}
            className="text-lg md:text-xl mb-8 text-gray-600 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none w-full text-center resize-none"
            placeholder="Enter description..."
            rows={2}
          />
        ) : (
          <p className="text-lg md:text-xl mb-8 text-gray-600">
            {data.description}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isEditable ? (
            <>
              <input
                type="text"
                value={data.buttonText}
                onChange={(e) => handleUpdate('buttonText', e.target.value)}
                className={`${getButtonStyles(data.style)} border-2 border-transparent focus:border-blue-300 outline-none`}
                placeholder="Button text..."
              />
              <input
                type="text"
                value={data.buttonLink}
                onChange={(e) => handleUpdate('buttonLink', e.target.value)}
                className="bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded focus:border-blue-500 outline-none"
                placeholder="Button link..."
              />
              <select
                value={data.style}
                onChange={(e) => handleUpdate('style', e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded focus:border-blue-500 outline-none"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </>
          ) : (
            <a
              href={data.buttonLink}
              className={getButtonStyles(data.style)}
            >
              {data.buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
