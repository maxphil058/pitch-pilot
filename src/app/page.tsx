import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">PitchPilot</span>
              <br />
              AI-Powered Conversion Funnels
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create high-converting sales funnels in under 5 minutes with distributed AI agents. 
              From idea to revenue, fully automated.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/demo"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Try Live Demo
              </Link>
              <Link
                href="/dashboard"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                View Dashboard
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">5-Minute Setup</h3>
                <p className="text-gray-600">Upload your idea, get a complete funnel with landing page, email drip, and checkout in minutes.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Agent Mesh</h3>
                <p className="text-gray-600">Distributed AI agents handle copywriting, design, video creation, and optimization automatically.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Revenue</h3>
                <p className="text-gray-600">Live Stripe integration means you start collecting payments immediately after deployment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore PitchPilot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/demo" className="group">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform group-hover:scale-105">
                <h3 className="text-2xl font-bold mb-4">Interactive Demo</h3>
                <p className="text-blue-100 mb-4">
                  Experience the funnel editor in action. Create, edit, and preview conversion funnels with our drag-and-drop interface.
                </p>
                <div className="flex items-center text-blue-100 group-hover:text-white">
                  <span className="mr-2">Try the Demo</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link href="/dashboard" className="group">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-8 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105">
                <h3 className="text-2xl font-bold mb-4">Judge Dashboard</h3>
                <p className="text-purple-100 mb-4">
                  See real-time metrics, AI agent activity, and live transaction data. Perfect for demonstrating our capabilities.
                </p>
                <div className="flex items-center text-purple-100 group-hover:text-white">
                  <span className="mr-2">View Dashboard</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
