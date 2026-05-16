# ChatVault - Personal Chat & Media Archive System

## Project Overview
- **Project Name**: ChatVault
- **Type**: Full-stack Web Application
- **Core Functionality**: Import WhatsApp chat exports (.zip), parse chat data, organize by contact, and provide a searchable archive system
- **Target Users**: Users who want to archive and search their WhatsApp chat exports

## Tech Stack
- **Frontend**: React + Vite, TailwindCSS, Framer Motion, Lucide React
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **File Handling**: Multer, Adm-zip

## UI/UX Specification

### Color Palette
- **Background Primary**: `#0a0a0f` (Deep charcoal)
- **Background Secondary**: `#12121a` (Dark slate)
- **Background Tertiary**: `#1a1a24` (Elevated surface)
- **Background Card**: `#16161f` (Glassmorphism base)
- **Accent Primary**: `#8b5cf6` (Violet)
- **Accent Secondary**: `#06b6d4` (Cyan)
- **Accent Gradient**: `linear-gradient(135deg, #8b5cf6, #06b6d4)`
- **Text Primary**: `#f8fafc` (Near white)
- **Text Secondary**: `#94a3b8` (Muted)
- **Text Tertiary**: `#64748b` (Dimmed)
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)
- **Border**: `rgba(148, 163, 184, 0.1)`

### Typography
- **Font Family**: `"Outfit", "Plus Jakarta Sans", system-ui, sans-serif`
- **Headings**:
  - H1: 32px, font-weight: 700
  - H2: 24px, font-weight: 600
  - H3: 18px, font-weight: 600
- **Body**: 14px, font-weight: 400
- **Small**: 12px, font-weight: 400

### Layout Structure
- **Sidebar**: 260px fixed left, collapsible to 72px
- **Main Content**: Flexible, min-width 0
- **Right Panel**: 320px fixed (optional toggle)
- **Header Height**: 64px
- **Border Radius**:
  - Small: 8px
  - Medium: 12px
  - Large: 16px
  - XL: 24px

### Components

#### Sidebar
- Logo at top with animated gradient
- Navigation items with icons + labels
- Active state: gradient background, glow effect
- Hover: subtle background shift
- Collapse animation: 300ms ease

#### Top Navbar
- Global search bar (centered, 400px max-width)
- Import Backup button (primary accent)
- Theme toggle (sun/moon icon)
- User avatar dropdown

#### Cards
- Glassmorphism effect: `backdrop-filter: blur(12px)`
- Border: 1px solid border color
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.4)`
- Hover: translateY(-2px), increased shadow

#### Media Grid
- Masonry layout
- Image thumbnails with aspect ratio preserved
- Hover overlay with file info
- Lazy loading with skeleton

#### Animations
- Page transitions: fade + slide (300ms)
- Card hover: scale(1.02) + shadow
- Sidebar: width transition (300ms)
- Modal: scale from 0.95 + fade (200ms)
- Skeleton pulse: 1.5s infinite

### Responsive Breakpoints
- **Desktop**: 1280px+
- **Tablet**: 768px - 1279px (sidebar collapsed)
- **Mobile**: < 768px (bottom nav)

## Functionality Specification

### 1. Import WhatsApp Export ZIP
- Upload .zip file via drag & drop or file picker
- Server-side extraction using adm-zip
- Detect chat .txt file (contains "Messages" or "Chat history")
- Extract all media files (images, videos, audio, documents)
- Store in `backups/` and `uploads/` directories

### 2. Chat Parser Engine
- Parse WhatsApp export format:
  ```
  [DD/MM/YY, HH:MM AM/PM] - Sender: Message
  [DD/MM/YYYY, HH:MM:SS] Sender: Message
  ```
- Handle multi-line messages (until next timestamp)
- Extract media attachments (with file references)
- Support Unicode/Emoji
- Store parsed messages in MongoDB

### 3. Contact Management
- Auto-create contacts from sender names
- Group messages by contact
- Create contact profile with avatar, stats

### 4. File Type Support
- Images: jpg, jpeg, png, gif, webp, svg
- Videos: mp4, 3gp, webm
- Audio: mp3, ogg, wav, m4a
- Documents: pdf, doc, docx, xls, xlsx, txt

### 5. Global Search
- Full-text search on message content
- Filter by contact, file type, date range
- Highlight matching terms

### 6. Media Gallery
- Grid view with masonry layout
- Filter by type (images/videos/audio/documents)
- Lightbox preview for images/videos

### 7. Timeline View
- Group messages by date
- Collapsible sections: Today, Yesterday, This Week, This Month, Older

### 8. Dashboard Analytics
- Total contacts count
- Total messages count
- Total files by type
- Storage used (calculated)
- Most active contacts (top 5)
- Messages per day chart

### 9. Starred Messages
- Mark messages as starred
- Filter starred only view

## API Endpoints

### Backup
- `POST /api/backup/upload` - Upload ZIP file
- `POST /api/backup/parse` - Parse uploaded backup
- `GET /api/backup/status/:id` - Get parsing status

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/:id` - Get contact details
- `GET /api/contacts/:id/messages` - Get contact messages

### Messages
- `GET /api/messages` - List messages (paginated)
- `GET /api/messages/search` - Search messages

### Media
- `GET /api/media` - List all media files
- `GET /api/media/:id` - Get media file
- `GET /api/media/types` - Get media by type

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/timeline` - Timeline data

### Settings
- `GET /api/settings` - Get app settings
- `PUT /api/settings` - Update settings

## Database Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  settings: {
    theme: String,
    sidebarCollapsed: Boolean
  },
  createdAt: Date
}
```

### Contact
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String,
  avatar: String,
  totalMessages: Number,
  totalMedia: Number,
  lastMessageAt: Date,
  createdAt: Date
}
```

### Message
```javascript
{
  _id: ObjectId,
  contactId: ObjectId,
  content: String,
  timestamp: Date,
  type: String, // text, image, video, audio, document
  mediaId: ObjectId,
  isStarred: Boolean,
  metadata: Object
}
```

### MediaFile
```javascript
{
  _id: ObjectId,
  contactId: ObjectId,
  messageId: ObjectId,
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  path: String,
  type: String, // image, video, audio, document
  createdAt: Date
}
```

### ChatBackup
```javascript
{
  _id: ObjectId,
  filename: String,
  originalName: String,
  status: String, // uploaded, parsing, completed, failed
  totalContacts: Number,
  totalMessages: Number,
  totalMedia: Number,
  processedAt: Date,
  createdAt: Date
}
```

## Folder Structure

```
ChatVault/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── RightPanel.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Skeleton.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatViewer.jsx
│   │   │   │   ├── Message.jsx
│   │   │   │   └── ContactList.jsx
│   │   │   ├── media/
│   │   │   │   ├── MediaGrid.jsx
│   │   │   │   ├── MediaCard.jsx
│   │   │   │   └── AudioPlayer.jsx
│   │   │   └── features/
│   │   │       ├── Analytics.jsx
│   │   │       ├── Timeline.jsx
│   │   │       ├── Search.jsx
│   │   │       └── UploadModal.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Contacts.jsx
│   │   │   ├── Media.jsx
│   │   │   ├── Timeline.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── controllers/
│   │   ├── backupController.js
│   │   ├── contactController.js
│   │   ├── messageController.js
│   │   ├── mediaController.js
│   │   └── analyticsController.js
│   ├── routes/
│   ├── models/
│   ├── services/
│   │   └── parserService.js
│   ├── middleware/
│   ├── uploads/
│   ├── parsers/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── backups/
├── parsed_chats/
└── README.md
```

## Acceptance Criteria

1. ✓ Application loads without errors
2. ✓ Sidebar navigation works with smooth animations
3. ✓ Dashboard displays analytics cards with mock data
4. ✓ Upload modal accepts ZIP files
5. ✓ Chat parser extracts messages from test data
6. ✓ Contacts page shows list of contacts with stats
7. ✓ Media gallery displays images in masonry grid
8. ✓ Search returns filtered results
9. ✓ Dark theme with glassmorphism cards throughout
10. ✓ Responsive design works on tablet/mobile
11. ✓ All animations are smooth (60fps)
12. ✓ API endpoints return proper JSON responses