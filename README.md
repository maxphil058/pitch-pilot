# 🚀 PitchPilot

**AI-Powered Sales Funnel Generator with Instant Deployment**

PitchPilot is a revolutionary platform that uses multi-agent AI to generate, customize, and deploy high-converting sales funnels in seconds. Built for entrepreneurs, marketers, and businesses who need professional funnels without the complexity.

## ✨ Features

### 🤖 AI-Powered Generation

- **Multi-Agent Architecture**: Specialized AI agents for copywriting, design optimization, and analytics
- **Intelligent Orchestration**: Coordinated AI workflow for cohesive funnel creation
- **Real-time Optimization**: Continuous improvement based on performance data

### 🎨 Live Preview & Editing

- **Interactive Editor**: Real-time funnel customization with instant preview
- **Component-Based Design**: Modular blocks (Hero, Features, Testimonials, Pricing, Checkout)
- **Theme Consistency**: Automatic color scheme and typography management

### 🌐 Instant Deployment

- **One-Click Publishing**: Deploy to Netlify with a single button click
- **Auto-Generated URLs**: Instant live URLs for sharing and testing
- **Export Options**: Download HTML files for custom hosting

### 💳 Integrated Payments

- **Stripe Integration**: Secure checkout with multiple payment options
- **Dynamic Pricing**: Flexible pricing models and currency support
- **Customer Management**: Pre-fill customer details and billing collection

### 🎥 Video Generation (Beta)

- **AI Video Creation**: Automated video content generation with FFmpeg
- **Custom Assets**: Dynamic video assets and thumbnails
- **Multiple Formats**: Support for various video formats and resolutions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM, SQLite
- **AI**: OpenAI GPT-4, Multi-agent orchestration
- **Payments**: Stripe API
- **Deployment**: Vercel, Netlify API integration
- **Messaging**: Solace event mesh
- **Video**: FFmpeg, fluent-ffmpeg

## 🚀 Live Demo

**Production App**: [https://pitch-pilot-two.vercel.app](https://pitch-pilot-two.vercel.app)

### Quick Start

1. Visit the [demo page](https://pitch-pilot-two.vercel.app/demo)
2. Enter your business details
3. Watch AI generate your funnel in real-time
4. Customize with the live editor
5. Click "Publish Live" for instant deployment

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/pitchpilot.git
   cd pitchpilot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   ```

4. **Configure Environment Variables**

   ```env
   # Stripe (Required for checkout)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PRICE_ID=price_your_price_id
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # OpenAI (Required for AI generation)
   OPENAI_API_KEY=sk-proj-your_openai_api_key
   OPENAI_MODEL=gpt-4o-mini

   # Netlify (Required for auto-deployment)
   NETLIFY_TOKEN=nfp_your_netlify_token

   # Database
   DATABASE_URL="file:./prisma/dev.db"

   # Optional: Solace Event Mesh
   SOLACE_HOST=your_solace_host
   SOLACE_MSG_VPN=your_message_vpn
   SOLACE_USERNAME=your_username
   SOLACE_PASSWORD=your_password

   # App Configuration
   DEMO_MODE=true
   DASHBOARD_SECRET=your_dashboard_secret
   ```

5. **Database Setup**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Start Development Server**

   ```bash
   npm run dev
   ```

7. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Multi-Agent AI System

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Orchestrator  │───▶│   Copywriter     │───▶│  UI Optimizer   │
│                 │    │   Agent          │    │   Agent         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Analytics      │    │   Video          │    │   Event Bus     │
│  Agent          │    │   Agent          │    │   (Solace)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── demo/          # Main demo interface
│   └── dashboard/     # Analytics dashboard
├── components/
│   └── blocks/        # Funnel components
├── lib/
│   ├── agents/        # AI agent implementations
│   └── video/         # Video generation
└── prisma/            # Database schema
```

## 🔧 API Endpoints

### Core APIs

- `POST /api/orchestrate` - Generate funnel with AI
- `POST /api/deploy` - Deploy funnel to Netlify
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/stripe-webhook` - Handle payment events

### Agent APIs

- `POST /api/agents/copywriter` - Generate copy content
- `POST /api/agents/ui-optimizer` - Optimize design
- `POST /api/agents/analytics/log` - Track events
- `POST /api/agents/video` - Generate video content

### Utility APIs

- `GET /api/flags` - Feature flags
- `POST /api/mesh/publish` - Event publishing
- `GET /api/transactions` - Payment history

## 🎯 Usage Examples

### Basic Funnel Generation

```javascript
const response = await fetch('/api/orchestrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    businessName: 'TechStartup Inc',
    industry: 'SaaS',
    targetAudience: 'Small businesses',
    productDescription: 'Project management tool',
  }),
});

const funnel = await response.json();
```

### Deploy to Netlify

```javascript
const deployResponse = await fetch('/api/deploy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: funnelHTML,
    siteName: 'my-awesome-funnel',
  }),
});

const { url } = await deployResponse.json();
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

### Environment Variables for Production

- Update `NEXT_PUBLIC_SITE_URL` to your production domain
- Ensure all API keys are configured
- Set `DEMO_MODE=false` for production security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Stripe for payment processing
- Netlify for hosting infrastructure
- Vercel for deployment platform
- Solace for event mesh technology

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pitchpilot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pitchpilot/discussions)
- **Email**: support@pitchpilot.com

---

**Built with ❤️ for the future of sales funnel creation**
