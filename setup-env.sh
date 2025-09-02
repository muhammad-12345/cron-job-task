#!/bin/bash

echo "🔧 Setting up environment for GreenPay integration..."

# Copy environment example to .env
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/env.example apps/api/.env
    echo "✅ Created apps/api/.env from env.example"
else
    echo "⚠️  apps/api/.env already exists, skipping..."
fi

# Install node-fetch for testing
echo "📦 Installing node-fetch for testing..."
npm install node-fetch

echo "🎉 Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review apps/api/.env file and update if needed"
echo "2. Start the backend: npm run dev -w apps/api"
echo "3. Test the integration: node test-greenpay.js"
echo ""
echo "🔑 GreenPay Credentials:"
echo "   CLIENT_ID: 118206"
echo "   API_PASSWORD: ap8av5ku8gx"
echo "   API_URL: https://api.greenpay.com"
