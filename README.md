<div align="center">

# 🫧 Bubbly

### Full Stack Real-time Chat App

A cross-platform (iOS & Android) real-time messaging application built with React Native, Node.js, and Socket.io.


</div>

---

## ✨ Features

- **Real-time Messaging** — Instant message delivery and reception using Socket.io
- **Direct & Group Chats** — Support for one-on-one conversations and multi-user groups
- **Media Sharing** — Upload and share images from the device gallery, hosted on Cloudinary
- **Authentication & Security** — JWT-based user authentication, bcrypt password hashing, and persistent login via AsyncStorage
- **Profile Management** — Update display names and profile avatars
- **Responsive UI** — Custom scaling utilities to adapt to various screen sizes
- **Modern Routing** — File-based routing powered by Expo Router

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React Native & Expo Router | Cross-platform UI & file-based routing |
| Socket.io-client | Real-time communication |
| Axios | REST API requests |
| Expo Image Picker & Expo Image | Native media access & optimized rendering |
| Phosphor React Native | Icon library |
| Moment.js | Date & time formatting |

### Backend
| Technology | Purpose |
|---|---|
| Node.js & Express | Server & REST API |
| MongoDB & Mongoose | Database & ODM |
| Socket.io | Real-time event handling |
| JWT & bcryptjs | Authentication & password security |
| Cors & Dotenv | Middleware & environment config |

---

## 📁 Project Structure

```
bubbly-chat-app/
├── frontend/
│   ├── app/
│   │   ├── index.tsx
│   │   ├── welcome.tsx
│   │   ├── (auth)/
│   │   │   └── login.tsx
│   │   └── (main)/
│   │       └── home.tsx
│   ├── components/       # Reusable UI components (buttons, inputs, avatars, message bubbles)
│   └── constants.ts      # API URL & Cloudinary config
│
└── backend/
    ├── models/           # Mongoose schemas (User, Conversation, Message)
    ├── routes/           # Express route definitions
    ├── controllers/      # Route logic & REST API handlers
    └── socket/           # Socket.io events (messaging, connectivity, groups)
```

---

## ⚙️ Prerequisites

Before you begin, make sure you have the following:

- [Node.js](https://nodejs.org/) installed on your machine
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (or a local MongoDB server)
- A [Cloudinary](https://cloudinary.com/) account for media uploads
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally or available via `npx`

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ChinmayDubey231/bubbly-chat-app.git
cd bubbly-chat-app
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` root and add the following:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Open (or create) `constants.ts` and configure your API URL and Cloudinary credentials:

```typescript
import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
export const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

export const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
export const CLOUDINARY_UPLOAD_PRESET = 'your_unsigned_upload_preset';
```

Start the Expo development server:

```bash
npx expo start
```

- Press `i` to open on the iOS Simulator
- Press `a` to open on the Android Emulator
- Scan the QR code with the [Expo Go](https://expo.dev/client) app on a physical device

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Made with 🫧 by <a href="https://github.com/ChinmayDubey231">Chinmay Dubey</a>
</div>
