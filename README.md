# Payment System with Installment Processing

A full-stack payment system built with Next.js and Node.js that supports both full payments and flexible installment plans with automated cron job processing.

## Features

- **Payment Options**: Pay in full or set up installments (3, 6, or 12 payments)
- **Down Payment Support**: Optional down payment for installment plans
- **Automated Processing**: Cron jobs automatically process pending installments
- **Real-time UI**: Modern, responsive interface built with Tailwind CSS
- **Database Tracking**: SQLite database for payment and installment tracking
- **External API Integration**: Ready for payment gateway integration

## Project Structure

```
cron-job-task/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Node.js backend
├── package.json      # Root package.json with workspace configuration
└── README.md
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- VS Code (recommended)
- WSL (for Windows users)

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies for both frontend and backend
npm run install:all
```

### 2. Environment Setup

Create environment files:

```bash
# Copy the example environment file
cp apps/api/env.example apps/api/.env

# Edit the .env file with your configuration
# apps/api/.env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
PAYMENT_API_URL=your_payment_api_url_here
PAYMENT_API_KEY=your_payment_api_key_here
DATABASE_PATH=./database.sqlite
```

### 3. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

### Payment Processing
- `POST /api/payments/process` - Process a new payment
- `GET /api/payments/:paymentId` - Get payment details
- `GET /api/payments/:paymentId/installments` - Get installment details

### Health Checks
- `GET /health` - API health check
- `GET /api/payments/health` - Payment service health check

## Payment Flow

### Full Payment
1. User selects "Pay in Full"
2. Payment is processed immediately
3. No cron job required

### Installment Payment
1. User selects "Pay in Installments"
2. User chooses installment count (3, 6, or 12)
3. User optionally sets a down payment
4. First installment is processed immediately
5. Remaining installments are scheduled via cron jobs

## Cron Jobs

The system includes automated cron jobs:

- **Daily at 9 AM UTC**: Process pending installments
- **Weekly on Sunday at 2 AM UTC**: Clean up failed payments

## Database Schema

### Payments Table
- `id` - Unique payment identifier
- `customer_name` - Customer's full name
- `customer_email` - Customer's email address
- `customer_phone` - Customer's phone number (optional)
- `total_amount` - Total payment amount
- `payment_type` - 'full' or 'installment'
- `down_payment` - Down payment amount (for installments)
- `installment_count` - Number of installments
- `status` - Payment status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Installments Table
- `id` - Unique installment identifier
- `payment_id` - Reference to parent payment
- `installment_number` - Installment sequence number
- `amount` - Installment amount
- `due_date` - Due date for this installment
- `status` - Installment status
- `transaction_id` - External transaction ID
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## External Payment API Integration

The system is designed to integrate with external payment APIs. Update the `externalPaymentService.ts` file to connect with your payment provider:

```typescript
// Replace the mock implementation with real API calls
const response = await fetch(`${this.apiUrl}/payments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`,
  },
  body: JSON.stringify(paymentData)
});
```

## Development

### Frontend (Next.js)
- Located in `apps/web/`
- Built with TypeScript, Tailwind CSS, and React Hook Form
- Form validation using Zod

### Backend (Node.js)
- Located in `apps/api/`
- Built with Express, TypeScript, and SQLite
- Cron job processing with node-cron

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev -w apps/web  # Start only frontend
npm run dev -w apps/api  # Start only backend

# Production
npm run build            # Build both applications
npm run start            # Start production servers

# Database
# SQLite database is automatically created at apps/api/database.sqlite
```

## Testing the System

1. **Full Payment Test**:
   - Select "Pay in Full"
   - Enter amount and customer details
   - Submit payment

2. **Installment Payment Test**:
   - Select "Pay in Installments"
   - Choose 3, 6, or 12 installments
   - Optionally set a down payment
   - Submit payment
   - First installment processes immediately
   - Remaining installments will be processed by cron jobs

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure your payment API credentials
3. Set up proper database backups
4. Configure cron jobs on your server
5. Set up monitoring and logging

## Security Considerations

- Store sensitive API keys in environment variables
- Implement proper authentication for production
- Use HTTPS in production
- Validate all input data
- Implement rate limiting
- Set up proper error logging

## Support

For issues or questions, please check the code comments and ensure all dependencies are properly installed.
