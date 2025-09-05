'use client';

import { useState, useRef } from 'react';
import { Funnel, FunnelBlock, HeroData, CTAData, TestimonialsData, CheckoutData, blockPalette, createNewBlock } from '@/lib/funnelSchema';
import Hero from '@/components/blocks/Hero';
import CTA from '@/components/blocks/CTA';
import Testimonials from '@/components/blocks/Testimonials';
import Checkout from '@/components/blocks/Checkout';

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

  const exportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${funnel.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    ${funnel.blocks.sort((a, b) => a.order - b.order).map(block => {
      // Generate static HTML for each block type
      switch (block.type) {
        case 'hero':
          const heroData = block.data as HeroData;
          return `<section class="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 px-4">
            <div class="relative max-w-4xl mx-auto text-center">
              <h1 class="text-4xl md:text-6xl font-bold mb-6">${heroData.headline}</h1>
              <p class="text-xl md:text-2xl mb-8 text-gray-200">${heroData.subheadline}</p>
              <a href="${heroData.ctaLink}" class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block">${heroData.ctaText}</a>
            </div>
          </section>`;
        case 'cta':
          const ctaData = block.data as CTAData;
          return `<section class="py-16 px-4 bg-gray-50">
            <div class="max-w-4xl mx-auto text-center">
              <h2 class="text-3xl md:text-4xl font-bold mb-6 text-gray-900">${ctaData.title}</h2>
              <p class="text-lg md:text-xl mb-8 text-gray-600">${ctaData.description}</p>
              <a href="${ctaData.buttonLink}" class="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">${ctaData.buttonText}</a>
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
        {/* Left Panel - Block Palette */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Block Palette</h2>
          <p className="text-sm text-gray-600 mb-6">Drag blocks to the canvas to build your funnel</p>
          
          <div className="space-y-3">
            {blockPalette.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors active:cursor-grabbing"
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
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
