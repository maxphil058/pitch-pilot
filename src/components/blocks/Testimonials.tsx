'use client';

import { TestimonialsData, Testimonial } from '@/lib/funnelSchema';

interface TestimonialsProps {
  data: TestimonialsData;
  isEditable?: boolean;
  onUpdate?: (data: TestimonialsData) => void;
  themeStyle?: {
    background?: string;
    ctaBackground?: string;
    ctaColor?: string;
  };
}

export default function Testimonials({ data, isEditable = false, onUpdate, themeStyle }: TestimonialsProps) {
  const handleTitleUpdate = (value: string) => {
    if (onUpdate) {
      onUpdate({ ...data, title: value });
    }
  };

  const handleTestimonialUpdate = (index: number, field: keyof Testimonial, value: string | number) => {
    if (onUpdate) {
      const updatedTestimonials = [...data.testimonials];
      updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value };
      onUpdate({ ...data, testimonials: updatedTestimonials });
    }
  };

  const addTestimonial = () => {
    if (onUpdate) {
      const newTestimonial: Testimonial = {
        name: 'New Customer',
        role: 'Role',
        company: 'Company',
        content: 'Great testimonial content...',
        rating: 5
      };
      onUpdate({ ...data, testimonials: [...data.testimonials, newTestimonial] });
    }
  };

  const removeTestimonial = (index: number) => {
    if (onUpdate) {
      const updatedTestimonials = data.testimonials.filter((_, i) => i !== index);
      onUpdate({ ...data, testimonials: updatedTestimonials });
    }
  };

  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? (isEditable ? 'text-yellow-400' : 'pp-star-filled') : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        style={!isEditable && i < rating ? { color: 'var(--pp-cta-bg)' } : undefined}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {isEditable ? (
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleTitleUpdate(e.target.value)}
              className="text-3xl md:text-4xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none text-center"
              placeholder="Enter testimonials title..."
            />
          ) : (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {data.title}
            </h2>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm relative">
              {isEditable && (
                <button
                  onClick={() => removeTestimonial(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                >
                  ×
                </button>
              )}
              
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              {isEditable ? (
                <textarea
                  value={testimonial.content}
                  onChange={(e) => handleTestimonialUpdate(index, 'content', e.target.value)}
                  className="text-gray-700 mb-4 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none w-full resize-none"
                  rows={3}
                  placeholder="Testimonial content..."
                />
              ) : (
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
              )}
              
              <div className="flex items-center">
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <div>
                  {isEditable ? (
                    <>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => handleTestimonialUpdate(index, 'name', e.target.value)}
                        className="font-semibold text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none block mb-1"
                        placeholder="Name..."
                      />
                      <input
                        type="text"
                        value={testimonial.role}
                        onChange={(e) => handleTestimonialUpdate(index, 'role', e.target.value)}
                        className="text-sm text-gray-600 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none block mb-1"
                        placeholder="Role..."
                      />
                      <input
                        type="text"
                        value={testimonial.company}
                        onChange={(e) => handleTestimonialUpdate(index, 'company', e.target.value)}
                        className="text-sm text-gray-600 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none block"
                        placeholder="Company..."
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {isEditable && (
          <div className="text-center mt-8">
            <button
              onClick={addTestimonial}
              className={`px-6 py-2 rounded-lg transition-opacity hover:opacity-90 ${isEditable ? 'bg-blue-600 text-white hover:bg-blue-700' : 'pp-cta'}`}
            >
              Add Testimonial
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
