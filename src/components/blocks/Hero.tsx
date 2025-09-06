'use client';

import { HeroData } from '@/lib/funnelSchema';

interface HeroProps {
  data: HeroData;
  isEditable?: boolean;
  onUpdate?: (data: HeroData) => void;
  themeStyle?: {
    background?: string;
    ctaBackground?: string;
    ctaColor?: string;
  };
}

export default function Hero({ data, isEditable = false, onUpdate, themeStyle }: HeroProps) {
  const handleUpdate = (field: keyof HeroData, value: string) => {
    if (onUpdate) {
      onUpdate({ ...data, [field]: value });
    }
  };

  return (
    <section 
      className={`relative text-white py-20 px-4 ${!isEditable ? 'pp-hero-bg' : 'bg-gradient-to-r from-blue-600 to-purple-700'}`}
      style={!isEditable && themeStyle?.background ? { background: themeStyle.background } : undefined}
    >
      {data.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${data.backgroundImage})` }}
        />
      )}
      <div className="relative max-w-4xl mx-auto text-center">
        {isEditable ? (
          <input
            type="text"
            value={data.headline}
            onChange={(e) => handleUpdate('headline', e.target.value)}
            className="text-4xl md:text-6xl font-bold mb-6 bg-transparent border-b-2 border-white/30 focus:border-white outline-none w-full text-center"
            placeholder="Enter headline..."
          />
        ) : (
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {data.headline}
          </h1>
        )}
        
        {isEditable ? (
          <textarea
            value={data.subheadline}
            onChange={(e) => handleUpdate('subheadline', e.target.value)}
            className="text-xl md:text-2xl mb-8 text-gray-200 bg-transparent border-b border-white/20 focus:border-white outline-none w-full text-center resize-none"
            placeholder="Enter subheadline..."
            rows={2}
          />
        ) : (
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            {data.subheadline}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isEditable ? (
            <input
              type="text"
              value={data.ctaText}
              onChange={(e) => handleUpdate('ctaText', e.target.value)}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors border-2 border-transparent focus:border-blue-300 outline-none"
              placeholder="CTA text..."
            />
          ) : (
            <a
              href={data.ctaLink}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-opacity hover:opacity-90 inline-block ${!isEditable ? 'pp-cta' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
            >
              {data.ctaText}
            </a>
          )}
          
          {isEditable && (
            <input
              type="text"
              value={data.ctaLink}
              onChange={(e) => handleUpdate('ctaLink', e.target.value)}
              className="bg-transparent border border-white/30 text-white px-4 py-2 rounded focus:border-white outline-none"
              placeholder="CTA link..."
            />
          )}
        </div>
      </div>
    </section>
  );
}
