# WebSocket Server Guide

## Overview
The CarHubConnect WebSocket server provides real-time messaging capabilities for car sales platform. It supports private messaging, typing indicators, read receipts, and room-based conversations.

## Connection

### Client Connection

#### Cookie-based Authentication (Recommended)
```javascript
import { io } from 'socket.io-client';

// Connect with cookies (automatic if cookies are set)
const socket = io('http://localhost:5000', {
  withCredentials: true, // Important: enables cookie sending
  transports: ['websocket', 'polling']
});
```

#### Token-based Authentication (Alternative)
```javascript
// Connect with JWT token in auth
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token-here'
  },
  transports: ['websocket', 'polling']
});

// Alternative: Pass token in query
const socket = io('http://localhost:5000?token=your-jwt-token-here', {
  transports: ['websocket', 'polling']
});
```

### Connection Events

#### `connected`
Emitted when successfully connected and authenticated.
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // {
  //   success: true,
  //   message: 'Connected to WebSocket',
  //   user: {
  //     _id: 'user-id',
  //     fullname: 'John Doe',
  //     email: 'john@example.com'
  //   }
  // }
});
```

## Messaging Events

### Send Private Message
```javascript
socket.emit('privateMessage', {
  recipientId: 'recipient-user-id',
  carId: 'car-id',
  content: 'Hello, is this car still available?'
}, (response) => {
  if (response.success) {
    console.log('Message sent:', response.message);
  } else {
    console.error('Error:', response.error);
  }
});
```

### Receive New Message
```javascript
socket.on('newMessage', (data) => {
  console.log('New message received:', data);
  // {
  //   message: {
  //     _id: 'message-id',
  //     content: 'Hello, is this car still available?',
  //     sender: { _id: 'sender-id', fullname: 'John Doe' },
  //     recipient: { _id: 'recipient-id', fullname: 'Jane Smith' },
  //     car: 'car-id',
  //     read: false,
  //     createdAt: '2024-01-01T00:00:00.000Z'
  //   },
  //   sender: {
  //     _id: 'sender-id',
  //     fullname: 'John Doe',
  //     email: 'john@example.com'
  //   },
  //   carId: 'car-id'
  // }
});
```

## Typing Indicators

### Start Typing
```javascript
socket.emit('typing', {
  recipientId: 'recipient-user-id',
  carId: 'car-id'
});
```

### Stop Typing
```javascript
socket.emit('stopTyping', {
  recipientId: 'recipient-user-id',
  carId: 'car-id'
});
```

### Receive Typing Indicator
```javascript
socket.on('userTyping', (data) => {
  console.log('User typing:', data);
  // {
  //   userId: 'user-id',
  //   carId: 'car-id',
  //   isTyping: true,
  //   sender: {
  //     _id: 'user-id',
  //     fullname: 'John Doe'
  //   }
  // }
});
```

## Read Receipts

### Mark Messages as Read
```javascript
socket.emit('markAsRead', {
  messageIds: ['message-id-1', 'message-id-2'],
  recipientId: 'sender-user-id'
}, (response) => {
  if (response.success) {
    console.log('Messages marked as read:', response.readCount);
  }
});
```

### Receive Read Receipt
```javascript
socket.on('messagesRead', (data) => {
  console.log('Messages read:', data);
  // {
  //   messageIds: ['message-id-1', 'message-id-2'],
  //   readerId: 'user-id',
  //   readCount: 2
  // }
});
```

## Room Management

### Join Car Room
```javascript
socket.emit('joinCarRoom', { carId: 'car-id' });

socket.on('joinedRoom', (data) => {
  console.log('Joined room:', data);
  // {
  //   success: true,
  //   room: 'car-car-id',
  //   carId: 'car-id'
  // }
});
```

### Leave Car Room
```javascript
socket.emit('leaveCarRoom', { carId: 'car-id' });

socket.on('leftRoom', (data) => {
  console.log('Left room:', data);
  // {
  //   success: true,
  //   room: 'car-car-id',
  //   carId: 'car-id'
  // }
});
```

## Connection Health

### Ping/Pong
```javascript
// Send ping
socket.emit('ping');

// Receive pong
socket.on('pong', (data) => {
  console.log('Pong received:', data);
  // { timestamp: 1640995200000 }
});
```

## Error Handling

### Connection Errors
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // Possible errors:
  // - 'Authentication required'
  // - 'Invalid token'
  // - 'Token expired'
  // - 'User not found'
  // - 'Server configuration error'
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

## Server-Side Integration

### Using Socket Service in Controllers
```javascript
import { getSocketService } from '../services/socket.service.js';

export const sendMessage = async (req, res) => {
  // ... message creation logic ...
  
  // Get socket service
  const socketService = getSocketService();
  
  // Send notification to recipient
  socketService.sendNotificationToUser(recipientId, 'newMessage', {
    message: populatedMessage,
    sender: req.user,
    carId: carId
  });
  
  res.status(201).json(populatedMessage);
};
```

### Broadcasting to Car Rooms
```javascript
// Broadcast to all users in a car room
socketService.broadcastToCarRoom(carId, 'carUpdated', {
  car: updatedCar,
  action: 'updated'
});
```

## Environment Variables

```bash
# Required
JWT_SECRET=your-jwt-secret-here

# Optional
CLIENT_URLS=http://localhost:3000,https://yourdomain.com
```

## CORS Configuration

For cookie-based authentication to work properly, ensure your CORS configuration allows credentials:

**Server Configuration:**
```javascript
// Already configured in server.js
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // allow non-browser clients
    return callback(null, true)
  },
  credentials: true, // Essential for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Auth-Token', 'X-Request-ID'],
  exposedHeaders: ['Content-Range', 'X-Total-Count']
}
```

**Client Configuration:**
```javascript
// For fetch requests
fetch('http://localhost:5000/api/auth/me', {
  credentials: 'include' // Include cookies
});

// For WebSocket connections
const socket = io('http://localhost:5000', {
  withCredentials: true // Include cookies
});
```

## Authentication Methods

### Cookie-based Authentication (Primary)
The WebSocket server primarily uses cookie-based authentication, which is the same method used by the REST API. This provides seamless integration with your existing authentication system.

**How it works:**
1. User logs in via REST API and receives a JWT token in an httpOnly cookie
2. WebSocket connection automatically includes cookies
3. Server extracts JWT token from the `token` cookie
4. Token is verified and user is authenticated

**Client Setup:**
```javascript
const socket = io('http://localhost:5000', {
  withCredentials: true, // Essential for cookie sending
  transports: ['websocket', 'polling']
});
```

### Token-based Authentication (Fallback)
For cases where cookies aren't available (mobile apps, external integrations), you can pass the JWT token directly.

**Client Setup:**
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket', 'polling']
});
```

## Security Features

1. **Multi-source Authentication**: Supports cookies, auth tokens, and query tokens
2. **JWT Token Validation**: All connections require valid JWT tokens
3. **Input Validation**: All message data is validated before processing
4. **Rate Limiting**: Built-in protection against spam
5. **User Verification**: Recipients are verified before sending messages
6. **Content Length Limits**: Messages limited to 1000 characters
7. **Room Isolation**: Users can only join rooms they have access to
8. **Cookie Security**: httpOnly cookies prevent XSS attacks

## Performance Features

1. **Connection Pooling**: Efficient connection management
2. **Room-based Broadcasting**: Targeted message delivery
3. **Automatic Cleanup**: Rooms are cleaned up on disconnect
4. **Health Monitoring**: Ping/pong for connection health
5. **Error Recovery**: Automatic reconnection support

## Best Practices

1. **Always handle connection errors**
2. **Implement reconnection logic**
3. **Validate message content on client side**
4. **Use rooms for car-specific conversations**
5. **Clean up event listeners on component unmount**
6. **Implement typing debouncing**
7. **Handle offline/online states**

## Example React Hook

### Cookie-based Authentication Hook
```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true, // Enable cookie sending
      transports: ['websocket', 'polling']
    });

    newSocket.on('connected', (data) => {
      setConnected(true);
      console.log('Connected:', data);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      setConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
};
```

### Token-based Authentication Hook
```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connected', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, connected };
};
```
