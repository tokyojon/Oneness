# Oneness

A Next.js application for the WKP (Oneness Points) exchange and payment system.

## Features

- User authentication and registration
- WKP token purchase with Stripe integration
- WKP to fiat currency exchange requests
- Transaction history and wallet management
- Real-time balance tracking

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Deployment**: VPS with PM2

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see ENV_SETUP.md)
4. Run database migrations if needed
5. Start development server: `npm run dev`

## Environment Setup

See [ENV_SETUP.md](ENV_SETUP.md) for detailed environment configuration including Supabase and Stripe setup.

## Deployment

The application is configured for VPS deployment with PM2. Use the provided `deploy.sh` script for automated deployments.

### VPS Setup Requirements

- Node.js 18+
- PM2 process manager
- PostgreSQL database (via Supabase)
- SSL certificate (recommended)

## Stripe Integration

The application integrates with Stripe for:
- WKP token purchases (PaymentIntents)
- Webhook handling for payment confirmations
- Future: Payouts for WKP to fiat exchanges

Set up webhooks in your Stripe dashboard to point to `/api/payments/webhook`.
