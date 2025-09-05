export interface FunnelBlock {
  id: string;
  type: 'hero' | 'cta' | 'testimonials' | 'checkout';
  order: number;
  data: HeroData | CTAData | TestimonialsData | CheckoutData;
}

export interface HeroData {
  headline: string;
  subheadline: string;
  backgroundImage?: string;
  ctaText: string;
  ctaLink: string;
}

export interface CTAData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  style: 'primary' | 'secondary' | 'outline';
}

export interface TestimonialsData {
  title: string;
  testimonials: Testimonial[];
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface CheckoutData {
  productName: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  stripePriceId?: string;
}

export interface Funnel {
  id: string;
  name: string;
  description: string;
  blocks: FunnelBlock[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

// Sample funnel data for demo
export const sampleFunnel: Funnel = {
  id: 'demo-funnel-1',
  name: 'AI Coffee Subscription',
  description: 'Convert visitors into coffee subscribers',
  isPublished: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  blocks: [
    {
      id: 'hero-1',
      type: 'hero',
      order: 1,
      data: {
        headline: 'AI-Powered Coffee That Adapts to Your Taste',
        subheadline: 'Get personalized coffee blends delivered monthly, powered by machine learning algorithms that learn your preferences.',
        ctaText: 'Start Your Coffee Journey',
        ctaLink: '#checkout'
      } as HeroData
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      order: 2,
      data: {
        title: 'What Our Coffee Lovers Say',
        testimonials: [
          {
            name: 'Sarah Chen',
            role: 'Product Manager',
            company: 'TechCorp',
            content: 'The AI actually learned I prefer lighter roasts in the morning and darker ones for afternoon. Mind blown!',
            rating: 5
          },
          {
            name: 'Marcus Johnson',
            role: 'Designer',
            company: 'Creative Studio',
            content: 'Best coffee subscription I\'ve ever tried. The personalization is incredible.',
            rating: 5
          },
          {
            name: 'Emily Rodriguez',
            role: 'Startup Founder',
            company: 'InnovateCo',
            content: 'Saves me time and always delivers exactly what I want. Perfect for busy entrepreneurs.',
            rating: 5
          }
        ]
      } as TestimonialsData
    },
    {
      id: 'cta-1',
      type: 'cta',
      order: 3,
      data: {
        title: 'Ready to Transform Your Coffee Experience?',
        description: 'Join thousands of coffee enthusiasts who trust AI to deliver their perfect cup.',
        buttonText: 'Get Started Now',
        buttonLink: '#checkout',
        style: 'primary'
      } as CTAData
    },
    {
      id: 'checkout-1',
      type: 'checkout',
      order: 4,
      data: {
        productName: 'AI Coffee Subscription - Monthly',
        price: 29.99,
        currency: 'USD',
        description: 'Monthly delivery of personalized coffee blends',
        features: [
          'AI-powered taste profiling',
          'Monthly delivery of 2 bags',
          'Free shipping',
          'Cancel anytime',
          'Satisfaction guarantee'
        ]
      } as CheckoutData
    }
  ]
};

export const blockTemplates = {
  hero: {
    headline: 'Your Amazing Product Headline',
    subheadline: 'A compelling subheadline that explains your value proposition.',
    ctaText: 'Get Started',
    ctaLink: '#checkout'
  } as HeroData,
  
  cta: {
    title: 'Ready to Get Started?',
    description: 'Join thousands of satisfied customers.',
    buttonText: 'Sign Up Now',
    buttonLink: '#checkout',
    style: 'primary' as const
  } as CTAData,
  
  testimonials: {
    title: 'What Our Customers Say',
    testimonials: [
      {
        name: 'John Doe',
        role: 'CEO',
        company: 'Example Corp',
        content: 'This product changed everything for our business.',
        rating: 5
      }
    ]
  } as TestimonialsData,
  
  checkout: {
    productName: 'Premium Plan',
    price: 99,
    currency: 'USD',
    description: 'Everything you need to succeed',
    features: [
      'Feature 1',
      'Feature 2', 
      'Feature 3'
    ]
  } as CheckoutData
};

// Block palette definitions for drag-and-drop editor
export interface BlockPaletteItem {
  type: FunnelBlock['type'];
  name: string;
  description: string;
  icon: string;
  template: HeroData | CTAData | TestimonialsData | CheckoutData;
}

export const blockPalette: BlockPaletteItem[] = [
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Eye-catching header with headline and CTA',
    icon: '🎯',
    template: blockTemplates.hero
  },
  {
    type: 'cta',
    name: 'Call to Action',
    description: 'Drive conversions with compelling CTAs',
    icon: '📢',
    template: blockTemplates.cta
  },
  {
    type: 'testimonials',
    name: 'Testimonials',
    description: 'Build trust with customer reviews',
    icon: '⭐',
    template: blockTemplates.testimonials
  },
  {
    type: 'checkout',
    name: 'Checkout',
    description: 'Payment form and pricing',
    icon: '💳',
    template: blockTemplates.checkout
  }
];

// Utility function to create a new block
export function createNewBlock(type: FunnelBlock['type']): FunnelBlock {
  const template = blockPalette.find(item => item.type === type)?.template;
  if (!template) {
    throw new Error(`Unknown block type: ${type}`);
  }
  
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    order: 0, // Will be set when added to funnel
    data: template
  };
}
