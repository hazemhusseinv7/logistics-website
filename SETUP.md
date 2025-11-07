# Setup Instructions

## Initial Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build native dependencies:**
   ```bash
   pnpm rebuild better-sqlite3
   ```
   
   Note: If this fails, you may need to install build tools:
   - Windows: Install Visual Studio Build Tools or use `npm install -g windows-build-tools`
   - macOS: Install Xcode Command Line Tools
   - Linux: Install `build-essential` or equivalent

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `JWT_SECRET`: Any secure random string (required)
   - `RESEND_API_KEY`: Your Resend API key (optional, for email)
   - `EMAIL_FROM`: Email sender address (optional)

4. **Initialize database:**
   ```bash
   pnpm db:push
   ```
   
   The database file `logistics.db` will be created automatically.

5. **Start development server:**
   ```bash
   pnpm dev
   ```

6. **Open in browser:**
   Navigate to http://localhost:3000

## Creating Test Accounts

### Create a Client Account:
1. Go to http://localhost:3000/signup
2. Select "Client" role
3. Fill in name, email, and password
4. Sign up

### Create an Agent Account:
1. Go to http://localhost:3000/signup
2. Select "Agent" role
3. Fill in name, email, and password
4. Sign up

## Testing the Flow

1. **As a Client:**
   - Login with client credentials
   - Go to Transport tab
   - Click "Create Shipment"
   - Fill in shipment details
   - Submit the form

2. **As an Agent:**
   - Login with agent credentials
   - View available shipments
   - Click "View Details" on a shipment
   - Click "Submit Offer"
   - Enter price and optional notes
   - Submit offer

3. **Accept Offer (as Client):**
   - Go back to client dashboard
   - Click "View Details" on your shipment
   - View offers from agents
   - Click "Accept" on an offer

4. **Track Status:**
   - Both clients and agents can track shipment status
   - Status updates: pending → offers_received → offer_accepted → in_progress → completed

## Email Notifications

To enable email notifications:
1. Sign up for Resend at https://resend.com
2. Get your API key
3. Add `RESEND_API_KEY` to `.env`
4. Add `EMAIL_FROM` with your verified sender email

Without Resend, notifications will still work in-app, but emails won't be sent.

## Troubleshooting

### Database Issues
- If `pnpm db:push` fails, try deleting `logistics.db` and running again
- The database uses Turso/libSQL which requires no native bindings - it should work out of the box!
- If you want to use Turso cloud instead of local file, sign up at https://turso.tech and add credentials to `.env`

### Build Issues
- Make sure Node.js version is 18+
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`

### Port Already in Use
- Change port in `package.json` or use: `pnpm dev -- -p 3001`

