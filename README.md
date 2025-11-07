# LogiFlow - Logistics Management Platform

A modern logistics management platform built with Next.js 14+, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Landing Page**: Modern design describing logistics services
- **Authentication**: Signup with permanent role assignment (Client/Agent)
- **Client Dashboard**: 
  - Four service tabs: Transport, Customs Clearance, Storage, Shipping
  - Create shipments with detailed information
  - View and accept offers from agents
  - Track shipment status
- **Agent Dashboard**:
  - Browse available shipments
  - Submit offers on shipments
  - Track offer status
- **Shipment Workflow**: 
  - Status flow: pending → offers_received → offer_accepted → in_progress → completed
  - Real-time notifications via Server-Sent Events
  - Email notifications for new offers and approvals

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Database**: Turso (libSQL) - SQLite-compatible, no native bindings required
- **Email**: Resend
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm installed globally (`npm install -g pnpm`)

### Installation

1. Clone the repository:
```bash
cd logistics-website
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `JWT_SECRET`: A secure random string for JWT token signing
- `TURSO_DB_URL`: (Optional) For Turso cloud, leave empty for local file
- `TURSO_DB_AUTH_TOKEN`: (Optional) For Turso cloud only
- `RESEND_API_KEY`: (Optional) Your Resend API key for email notifications
- `EMAIL_FROM`: (Optional) Email address for sending notifications

4. Initialize the database:
```bash
pnpm db:push
```

6. Start the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
logistics-website/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── shipments/    # Shipment endpoints
│   │   ├── offers/       # Offer endpoints
│   │   └── notifications/ # Notification endpoints
│   ├── dashboard/
│   │   ├── client/       # Client dashboard
│   │   └── agent/        # Agent dashboard
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── page.tsx          # Landing page
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── db/               # Database schema and connection
│   ├── auth.ts           # Authentication utilities
│   ├── store.ts          # Zustand store
│   ├── middleware.ts     # Auth middleware
│   └── email.ts          # Email notification utilities
└── drizzle/              # Database migrations
```

## Database Schema

- **Users**: User accounts with role (client/agent)
- **Shipments**: Shipment details with status tracking
- **Offers**: Agent offers on shipments
- **Notifications**: User notifications for offers and status updates

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Shipments
- `GET /api/shipments` - Get shipments (filtered by role)
- `POST /api/shipments` - Create shipment (clients only)
- `GET /api/shipments/[id]` - Get shipment details
- `PATCH /api/shipments/[id]/status` - Update shipment status

### Offers
- `POST /api/offers` - Create offer (agents only)
- `POST /api/offers/[id]/accept` - Accept offer (clients only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/sse` - Server-Sent Events stream

## Usage

### As a Client

1. Sign up with role "Client"
2. Navigate to the Client Dashboard
3. Go to the Transport tab (currently implemented)
4. Click "Create Shipment" and fill in the details
5. View offers from agents and accept one
6. Track shipment status

### As an Agent

1. Sign up with role "Agent"
2. Navigate to the Agent Dashboard
3. Browse available shipments
4. View shipment details and submit offers
5. Track offer status

## Development

### Database Commands

```bash
# Push schema changes to database
pnpm db:push

# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate
```

### Environment Variables

- `JWT_SECRET`: Required for JWT token signing
- `RESEND_API_KEY`: Optional, for email notifications
- `EMAIL_FROM`: Optional, sender email address

## Database

The project uses **Turso (libSQL)** which is SQLite-compatible but requires no native bindings:

- **Local Development**: Uses a local SQLite file (`logistics.db`) - no setup required!
- **Production**: Can use Turso cloud (free tier available at https://turso.tech)
  - Sign up at Turso
  - Create a database
  - Get your database URL and auth token
  - Add to `.env`:
    ```
    TURSO_DB_URL=libsql://your-db-url.turso.io
    TURSO_DB_AUTH_TOKEN=your-auth-token
    ```

## Notes

- The database file (`logistics.db`) will be created automatically on first run
- No native compilation required - works on Windows, Mac, Linux out of the box
- Email notifications require Resend API key (optional)
- Real-time notifications use Server-Sent Events (SSE)
- Role assignment is permanent after signup

## License

MIT
