# ChatVault - Personal Chat & Media Archive System

A modern full-stack web application for importing, parsing, and archiving WhatsApp chat exports.

## Features

- **WhatsApp Backup Import**: Upload and automatically parse WhatsApp chat exports (.zip)
- **Contact Organization**: View all contacts with message and media statistics
- **Media Gallery**: Browse images, videos, audio, and documents in a beautiful grid
- **Timeline View**: Browse messages organized by date
- **Global Search**: Search across all messages, contacts, and files
- **Starred Messages**: Mark and filter important messages
- **Analytics Dashboard**: View statistics and activity trends
- **Premium Dark UI**: Modern glassmorphism design with smooth animations

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- Framer Motion
- Lucide React Icons

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- Multer (file uploads)
- Adm-zip (ZIP extraction)

## Prerequisites

- Node.js 18+
- MongoDB (optional - works without for demo)
- npm or yarn

## Installation

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start MongoDB (Optional)

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod
```

### 3. Run the Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

## Usage

1. Open http://localhost:5173 in your browser
2. Click "Import Backup" in the top navigation
3. Upload a WhatsApp chat export ZIP file
4. Browse your contacts, messages, and media

### How to Export WhatsApp Chats

1. Open WhatsApp → Open a chat
2. Tap More (⋮) → Export chat
3. Choose "Include media" for full backup
4. Share/save as ZIP file
5. Upload the ZIP to ChatVault

## API Endpoints

### Backup
- `POST /api/backup/upload` - Upload ZIP file
- `POST /api/backup/parse` - Parse uploaded backup
- `GET /api/backup/status/:id` - Get parsing status
- `GET /api/backup/all` - List all backups

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/:id` - Get contact details
- `GET /api/contacts/:id/messages` - Get contact messages

### Messages
- `GET /api/messages` - List messages (paginated)
- `GET /api/messages/search` - Search messages
- `GET /api/messages/starred` - Get starred messages
- `PATCH /api/messages/:id/star` - Toggle star

### Media
- `GET /api/media` - List all media
- `GET /api/media/types/:type` - Get media by type
- `GET /api/media/stats` - Get media statistics

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/timeline` - Timeline data
- `GET /api/analytics/activity` - Activity by hour

## Project Structure

```
ChatVault/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── package.json
│
├── server/                 # Express backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── server.js          # Entry point
│
├── backups/               # Uploaded backup files
├── parsed_chats/         # Extracted chat data
└── README.md
```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatvault
```

## Screenshots

The application features:
- Premium dark theme with glassmorphism cards
- Animated sidebar with navigation
- Dashboard with analytics cards
- Media gallery with masonry grid
- Timeline view with collapsible sections
- Contact details with AI summary placeholder

## License

MIT License