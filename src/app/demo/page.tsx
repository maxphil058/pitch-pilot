'use client';

import { useState, useRef, useEffect } from 'react';
import { Funnel, FunnelBlock, HeroData, CTAData, TestimonialsData, CheckoutData, blockPalette, createNewBlock } from '@/lib/funnelSchema';
import Hero from '@/components/blocks/Hero';
import CTA from '@/components/blocks/CTA';
import Testimonials from '@/components/blocks/Testimonials';
import Checkout from '@/components/blocks/Checkout';

interface AgentResult {
  copy?: { headline: string; body: string };
  tweak?: { ctaColor: string; ctaText?: string };
  script?: string;
}

export default function DemoPage() {
  const [funnel, setFunnel] = useState<Funnel>({
    id: 'demo-funnel',
    name: 'My Funnel',
    description: 'Drag blocks from the palette to build your funnel',
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false
  });

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const dragCounter = useRef(0);

  // Agent state
  const [idea, setIdea] = useState('');
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video state
  const [videoExists, setVideoExists] = useState(false);
  const [checkingVideo, setCheckingVideo] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [tapToPlay, setTapToPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const addBlock = (blockType: FunnelBlock['type']) => {
    const newBlock = createNewBlock(blockType);
    newBlock.order = funnel.blocks.length;
    
    setFunnel(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      updatedAt: new Date()
    }));
  };

  const removeBlock = (blockId: string) => {
    setFunnel(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId).map((block, index) => ({
        ...block,
        order: index
      })),
      updatedAt: new Date()
    }));
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const blocks = [...funnel.blocks];
    const [movedBlock] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, movedBlock);
    
    setFunnel(prev => ({
      ...prev,
      blocks: blocks.map((block, index) => ({ ...block, order: index })),
      updatedAt: new Date()
    }));
  };

  const updateBlock = (blockId: string, newData: any) => {
    setFunnel(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId ? { ...block, data: newData } : block
      ),
      updatedAt: new Date()
    }));
  };

  const renderBlock = (block: FunnelBlock, isPreview: boolean = false) => {
    const commonProps = {
      isEditable: !isPreview,
      onUpdate: (data: any) => updateBlock(block.id, data)
    };

    switch (block.type) {
      case 'hero':
        return <Hero key={block.id} data={block.data as HeroData} {...commonProps} />;
      case 'cta':
        return <CTA key={block.id} data={block.data as CTAData} {...commonProps} />;
      case 'testimonials':
        return <Testimonials key={block.id} data={block.data as TestimonialsData} {...commonProps} />;
      case 'checkout':
        return <Checkout key={block.id} data={block.data as CheckoutData} {...commonProps} />;
      default:
        return null;
    }
  };

  // HTML escaping utility
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const exportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(funnel.name)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    ${funnel.blocks.sort((a, b) => a.order - b.order).map(block => {
      // Generate static HTML for each block type
      switch (block.type) {
        case 'hero':
          const heroData = block.data as HeroData;
          const heroHref = heroData.ctaLink || '#';
          return `<section class="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 px-4">
            <div class="relative max-w-4xl mx-auto text-center">
              <h1 class="text-4xl md:text-6xl font-bold mb-6">${escapeHtml(heroData.headline)}</h1>
              <p class="text-xl md:text-2xl mb-8 text-gray-200">${escapeHtml(heroData.subheadline)}</p>
              <a href="${escapeHtml(heroHref)}" class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block">${escapeHtml(heroData.ctaText)}</a>
            </div>
          </section>`;
          
        case 'cta':
          const ctaData = block.data as CTAData;
          const ctaHref = ctaData.buttonLink || '#';
          return `<section class="py-16 px-4 bg-gray-50">
            <div class="max-w-4xl mx-auto text-center">
              <h2 class="text-3xl md:text-4xl font-bold mb-6 text-gray-900">${escapeHtml(ctaData.title)}</h2>
              <p class="text-lg md:text-xl mb-8 text-gray-600">${escapeHtml(ctaData.description)}</p>
              <a href="${escapeHtml(ctaHref)}" class="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">${escapeHtml(ctaData.buttonText)}</a>
            </div>
          </section>`;
          
        case 'testimonials':
          const testimonialsData = block.data as TestimonialsData;
          return `<section class="py-16 px-4 bg-white">
            <div class="max-w-6xl mx-auto">
              <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900">${escapeHtml(testimonialsData.title)}</h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${testimonialsData.testimonials.map(testimonial => `
                  <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <div class="flex items-center mb-4">
                      ${Array.from({ length: 5 }, (_, i) => `
                        <svg class="w-5 h-5 ${i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      `).join('')}
                    </div>
                    <p class="text-gray-700 mb-4">"${escapeHtml(testimonial.content)}"</p>
                    <div class="flex items-center">
                      ${testimonial.avatar ? `<img src="${escapeHtml(testimonial.avatar)}" alt="${escapeHtml(testimonial.name)}" class="w-12 h-12 rounded-full mr-4">` : ''}
                      <div>
                        <p class="font-semibold text-gray-900">${escapeHtml(testimonial.name)}</p>
                        <p class="text-sm text-gray-600">${escapeHtml(testimonial.role)}</p>
                        <p class="text-sm text-gray-600">${escapeHtml(testimonial.company)}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>`;
          
        case 'checkout':
          const checkoutData = block.data as CheckoutData;
          const hasPaymentLink = checkoutData.paymentLink && checkoutData.paymentLink.trim() !== '';
          const buttonClass = hasPaymentLink 
            ? 'bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg'
            : 'bg-gray-400 text-gray-600 py-4 px-6 rounded-lg font-semibold text-lg cursor-not-allowed shadow-lg';
          const buttonText = hasPaymentLink ? 'Get Started Now' : 'Payment Not Available';
          
          return `<section id="checkout" class="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
            <div class="max-w-2xl mx-auto">
              <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div class="text-center mb-8">
                  <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">${escapeHtml(checkoutData.productName)}</h3>
                  <div class="flex items-center justify-center mb-4">
                    <span class="text-4xl font-bold text-blue-600">
                      ${checkoutData.currency === 'USD' ? '$' : escapeHtml(checkoutData.currency)}${checkoutData.price}
                    </span>
                    <span class="text-gray-600 ml-2">/month</span>
                  </div>
                  <p class="text-gray-600">${escapeHtml(checkoutData.description)}</p>
                </div>
                <div class="mb-8">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">What's included:</h4>
                  <ul class="space-y-3">
                    ${checkoutData.features.map(feature => `
                      <li class="flex items-center">
                        <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-gray-700">${escapeHtml(feature)}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
                <div class="space-y-4">
                  ${hasPaymentLink 
                    ? `<a href="${escapeHtml(checkoutData.paymentLink!)}" class="${buttonClass} w-full block text-center">${buttonText}</a>`
                    : `<button disabled class="${buttonClass} w-full">${buttonText}</button>`
                  }
                  <p class="text-center text-sm text-gray-500">
                    30-day money-back guarantee • Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </section>`;
          
        default:
          return '';
      }
    }).join('\n')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${funnel.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    setDraggedItem(blockType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem) {
      addBlock(draggedItem as FunnelBlock['type']);
      setDraggedItem(null);
    }
    dragCounter.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
  };

  // Agent functions
  const generateFunnel = async () => {
    if (!idea.trim()) {
      setError('Please enter a startup idea');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAgentResult(null);

    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate funnel');
      }

      const result = await response.json();
      setAgentResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateCheckoutSuccess = async () => {
    if (!agentResult?.copy) {
      setError('Generate a funnel first');
      return;
    }

    try {
      const response = await fetch('/api/agents/analytics/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'checkout_success',
          data: {
            idea,
            headline: agentResult.copy.headline,
            variant: 'A'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log analytics event');
      }

      const result = await response.json();
      if (result.suggestion) {
        alert(`A/B Test Suggestion: ${result.suggestion}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate checkout');
    }
  };

  // Check if demo video exists
  const checkVideoExists = async () => {
    try {
      const response = await fetch('/video/demo.mp4', { method: 'HEAD' });
      setVideoExists(response.ok);
    } catch (error) {
      setVideoExists(false);
    } finally {
      setCheckingVideo(false);
    }
  };

  // Play demo video
  const playDemoVideo = () => {
    if (videoRef && videoExists) {
      videoRef.load(); // Reload the video source
      videoRef.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  };

  // Generate video from script
  const generateVideo = async () => {
    if (!agentResult?.script) {
      setError('Generate a script first');
      return;
    }

    try {
      setGenerating(true);
      setIsGeneratingVideo(true);
      setVideoProgress('Starting video generation...');
      setError(null);
      setTapToPlay(false);

      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script: agentResult.script }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok || !data?.file) {
        throw new Error(data?.error || data?.message || 'Video generation failed');
      }

      // Show overlay fallback toast if needed
      if (data.overlayDisabled) {
        setVideoProgress('Overlay disabled (using safe fallback). Video rendered successfully.');
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded shadow-lg z-50';
        toast.innerHTML = 'Overlay disabled (using safe fallback). Video rendered successfully.';
        document.body.appendChild(toast);
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 5000);
      } else {
        setVideoProgress('Video generated successfully!');
      }

      setVideoSrc(data.file);
      setGeneratedVideoUrl(data.file);
      await new Promise((r) => setTimeout(r, 50)); // allow DOM to bind src

      const el = videoRef.current;
      if (el) {
        // autoplay-safe settings
        el.muted = true;
        (el as any).playsInline = true;
        el.load();
        el.play().catch(() => setTapToPlay(true));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video');
      setVideoProgress('');
    } finally {
      setGenerating(false);
      setIsGeneratingVideo(false);
    }
  };

  // Listen for video progress events via SSE
  useEffect(() => {
    if (!isGeneratingVideo) return;

    const eventSource = new EventSource('/api/mesh/stream');
    
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.topic === 'pitchpilot/video/progress' && data.payload) {
          const { stage, message } = data.payload;
          if (stage === 'error') {
            setError(message);
            setVideoProgress('');
            setIsGeneratingVideo(false);
          } else {
            setVideoProgress(message || `Stage: ${stage}`);
          }
        } else if (data.topic === 'pitchpilot/video/done' && data.payload) {
          const fileUrl = data.payload.file || data.payload.url;
          setGeneratedVideoUrl(fileUrl);
          setVideoProgress('Video completed!');
          setIsGeneratingVideo(false);
          
          // If videoSrc is empty, set it and attempt play
          if (!videoSrc && fileUrl) {
            setVideoSrc(fileUrl);
            setTimeout(() => {
              const el = videoRef.current;
              if (el) {
                el.muted = true;
                (el as any).playsInline = true;
                el.load();
                el.play().catch(() => setTapToPlay(true));
              }
            }, 50);
          }
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isGeneratingVideo, videoRef]);

  // Check video on mount
  useEffect(() => {
    checkVideoExists();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Drag & Drop Funnel Editor</h1>
              <p className="text-sm text-gray-600">{funnel.name} • {funnel.blocks.length} blocks</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportHTML}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Export HTML
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - AI Agent Generator */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Funnel Generator</h2>
          <p className="text-sm text-gray-600 mb-6">Generate a complete funnel with AI agents</p>
          
          {/* Startup Idea Input */}
          <div className="mb-6">
            <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
              Startup Idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., AI Coffee Subscription"
              className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateFunnel}
            disabled={isGenerating || !idea.trim()}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {isGenerating ? 'Generating...' : 'Generate Funnel'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Generated Results */}
          {agentResult && (
            <div className="space-y-4">
              {/* Copy Results */}
              {agentResult.copy && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-medium text-green-900 mb-2">Generated Copy</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-green-700 font-medium">Headline:</p>
                      <p className="text-sm text-green-800">{agentResult.copy.headline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-medium">Body:</p>
                      <p className="text-sm text-green-800">{agentResult.copy.body}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* UI Tweak */}
              {agentResult.tweak && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                  <h3 className="font-medium text-purple-900 mb-2">UI Optimization</h3>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: agentResult.tweak.ctaColor }}
                    ></div>
                    <span className="text-sm text-purple-800">
                      {agentResult.tweak.ctaColor}
                      {agentResult.tweak.ctaText && ` • "${agentResult.tweak.ctaText}"`}
                    </span>
                  </div>
                  {/* Sample CTA Button */}
                  <button
                    className="mt-2 px-4 py-2 rounded-md text-white text-sm font-medium"
                    style={{ backgroundColor: agentResult.tweak.ctaColor }}
                  >
                    {agentResult.tweak.ctaText || 'Get Started'}
                  </button>
                </div>
              )}

              {/* Video Script */}
              {agentResult.script && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-blue-900 mb-2">Video Script</h3>
                  <div className="h-64 overflow-y-auto bg-white border border-blue-200 rounded p-3 mb-3">
                    <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono leading-relaxed">
                      {agentResult.script}
                    </pre>
                  </div>
                  
                  {/* Video Generation and Playback */}
                  <div className="space-y-2">
                    {/* Generate Video Button */}
                    <button
                      onClick={generateVideo}
                      disabled={isGeneratingVideo || !agentResult?.script}
                      className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        !isGeneratingVideo && agentResult?.script
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isGeneratingVideo ? 'Generating Video...' : 'Generate Video'}
                    </button>

                    {/* Progress Indicator */}
                    {videoProgress && (
                      <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                        {videoProgress}
                      </div>
                    )}

                    {/* Play Demo Video Button (fallback) */}
                    {videoExists && (
                      <button
                        onClick={playDemoVideo}
                        className="w-full px-4 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Play Demo Video
                      </button>
                    )}
                    
                    {!videoExists && !checkingVideo && (
                      <p className="text-xs text-gray-600 text-center">
                        Drop a demo file at <code className="bg-gray-200 px-1 rounded">/public/video/demo.mp4</code> or use Generate Video.
                      </p>
                    )}
                    
                    {/* Video Element */}
                    <div className="space-y-2">
                      <video
                        ref={videoRef}
                        src={videoSrc || (videoExists ? "/video/demo.mp4" : "")}
                        controls
                        muted
                        // @ts-expect-error: playsInline is valid
                        playsInline
                        preload="auto"
                        className="w-full aspect-video rounded-xl shadow"
                        style={{ display: (videoSrc || videoExists || generatedVideoUrl) ? 'block' : 'none' }}
                      />
                      {tapToPlay && (
                        <button
                          onClick={() => {
                            setTapToPlay(false);
                            videoRef.current?.play().catch(() => setTapToPlay(true));
                          }}
                          className="px-3 py-2 rounded-lg border bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Tap to play video
                        </button>
                      )}
                      {videoSrc && (
                        <a 
                          href={videoSrc} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm underline text-blue-600 hover:text-blue-800"
                        >
                          Open generated MP4 in a new tab
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Simulate Checkout Button */}
              <button
                onClick={simulateCheckoutSuccess}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Simulate Checkout Success
              </button>
            </div>
          )}

          {/* Block Palette Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Block Palette</h3>
            <p className="text-sm text-gray-600 mb-4">Drag blocks to the canvas</p>
            
            <div className="space-y-3">
              {blockPalette.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  className="p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors active:cursor-grabbing"
                >
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{item.icon}</span>
                    <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Panel - Canvas */}
        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Canvas</h2>
            <p className="text-sm text-gray-600">Drop blocks here and reorder them</p>
          </div>

          <div
            className={`min-h-96 border-2 border-dashed rounded-lg p-4 transition-colors ${
              draggedItem 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 bg-white'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            {funnel.blocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500">Drop blocks here to start building your funnel</p>
              </div>
            ) : (
              <div className="space-y-4">
                {funnel.blocks
                  .sort((a, b) => a.order - b.order)
                  .map((block, index) => (
                    <div key={block.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {blockPalette.find(p => p.type === block.type)?.icon}
                          </span>
                          <span className="font-medium text-gray-900">
                            {blockPalette.find(p => p.type === block.type)?.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => index > 0 && moveBlock(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => index < funnel.blocks.length - 1 && moveBlock(index, index + 1)}
                            disabled={index === funnel.blocks.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeBlock(block.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        Block #{index + 1} • {block.type}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-600">See how your funnel looks</p>
          </div>
          
          <div className="preview-content">
            {funnel.blocks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>Add blocks to see preview</p>
              </div>
            ) : (
              <div className="transform scale-75 origin-top-left w-[133%]">
                {funnel.blocks
                  .sort((a, b) => a.order - b.order)
                  .map(block => renderBlock(block, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
