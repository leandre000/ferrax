# CarHubConnect Backend

Backend API for car sales management: authentication with OTP, cars, bookings, orders, Stripe payments, WebSocket messaging, and audit logging.

## Setup

1. Install Node.js 18+ - I work on Node 22, consider resolving concerned issues
2. Copy `.env`:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/carhubconnect_db
JWT_SECRET=change_me
CLIENT_URLS=http://localhost:3000,https://yourdomain.com

# Twilio (for phone OTP)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_PHONE_NUMBER=+1234567890

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=CarHubConnect <noreply@carhubconnect.com>
```

3. Install deps and run:

```bash
npm install
npm run dev
```

## Auth

- POST `/api/auth/register` { fullname, email, phone, password } → sends OTP via Twilio
- POST `/api/auth/login` { phone, password } → sets cookie
- POST `/api/auth/verify-otp` { phone, otpCode } → sets cookie after OTP verification
- POST `/api/auth/logout` (auth required)
- GET `/api/auth/me` (auth required)

## Users
- GET `/api/users` `?q=&page=&limit=` (admin only)
- GET `/api/users/all` (admin only)
- GET `/api/users/:id` (auth required)
- GET `/api/users/phone/:phone` (auth required)
- PUT `/api/users/:id/role` { role: user|admin } (admin only)
- DELETE `/api/users/:id` (admin only)

## Cars
- GET `/api/cars` `?q=&status=available|reserved|sold|listed&brand=&make=&page=&limit=`
- GET `/api/cars/:id`
- GET `/api/cars/me/mine` (auth required)
- POST `/api/cars` (auth required)
  - Body: core car fields; supports `images: [url]`, `primaryImage`
- PUT `/api/cars/:id` (owner/admin)
- DELETE `/api/cars/:id` (owner/admin)
- POST `/api/cars/:id/images` { images: [url] } (owner/admin)
- DELETE `/api/cars/:id/images` { imageUrl } (owner/admin)
- POST `/api/cars/:id/primary-image` { imageUrl } (owner/admin)
- POST `/api/cars/:id/images/reorder` { images: [url] } (owner/admin)

## Bookings
- POST `/api/bookings` { carId, notes? } → reserves car 30m (auth required)
- POST `/api/bookings/:id/confirm` (auth required)
- POST `/api/bookings/:id/cancel` (auth required)
- GET `/api/bookings/me` (auth required)
- GET `/api/bookings` (admin only)
- GET `/api/bookings/:id` (owner/admin)

## Orders
- POST `/api/orders` { carId, amount, notes? } (auth required)
- POST `/api/orders/:id/cancel` (auth required)
- GET `/api/orders/me` (auth required)
- GET `/api/orders` (admin only)
- GET `/api/orders/:id` (buyer/admin)

## Wishlist (auth required)
- POST `/api/wishlist/add` { carId } - Add a car to wishlist
- POST `/api/wishlist/remove` { carId } - Remove a car from wishlist
- GET `/api/wishlist` - Get user's wishlist
- DELETE `/api/wishlist/clear` - Clear all items from wishlist
- DELETE `/api/wishlist` - Delete the entire wishlist

## Messaging (auth required)
- GET `/api/messages/conversations` - Get all conversations for the current user
- GET `/api/messages/:carId/:recipientId` - Get messages between current user and another user for a specific car
- POST `/api/messages` - Send a new message
  - Body: { recipientId, carId, content }
- POST `/api/messages/mark-read` - Mark messages as read
  - Body: { messageIds: [id1, id2, ...] }

## WebSocket Messaging
- Real-time messaging with Socket.IO
- Cookie-based authentication (same as REST API)
- Events: `privateMessage`, `typing`, `stopTyping`, `markAsRead`, `joinCarRoom`, `leaveCarRoom`
- Connection: `io('http://localhost:5000', { withCredentials: true })`

## API Documentation
- Swagger UI available at `/api/docs`
- Comprehensive API documentation with schemas and examples
- Interactive testing interface

## Audit Logging
- Request method, path, status, user, IP, UA stored in `AuditLog` collection
- Comprehensive logging with Pino logger
- Structured JSON logging for production

## Security Features
- JWT authentication with httpOnly cookies
- CORS configuration with allowed origins
- Input validation and sanitization
- Rate limiting protection
- Secure password hashing with bcryptjs
- OTP verification for registration

## Notes
- Cookies are httpOnly; set `CLIENT_URLS` for CORS (comma-separated)
- Car status cannot be edited once sold; reservations respected
- Images stored as Cloudinary URLs only
- WebSocket server supports both cookie and token authentication
- All API endpoints require authentication unless specified
- Admin-only endpoints clearly marked


