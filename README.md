# RelationHub - Chrome Extension for Relationship Management

A beautiful Chrome extension similar to ClientPoint that helps you manage contacts, track interactions, and build better business relationships. The extension detects email addresses on any webpage and provides a sidebar for quick access to your contact management system.

## Features

### Intelligent Contact Detection
- Automatically detects email addresses on any webpage
- One-click to add detected contacts to your database
- Real-time detection as you browse

### Relationship Sidebar
- Floating button appears on all websites
- Sidebar slides in from the right with your contact information
- Quick actions for contacts: email, call, meetings, notes
- View recent contacts and interactions

### Contact Management Dashboard
- Full-featured web dashboard for managing contacts
- Store contact details: name, email, company, title, phone
- Add notes and tags to organize your contacts
- Search and filter contacts

### Interaction Tracking
- Log all interactions with contacts (emails, calls, meetings, notes)
- Track interaction history for each contact
- See when you last contacted someone
- View interactions with context (URL where interaction occurred)

### Meeting Scheduling
- Schedule meetings with contacts
- Track meeting status (scheduled, completed, cancelled)
- Store meeting details and links

### Secure Authentication
- Email/password authentication via Supabase
- Secure session management
- Row-level security for all data

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Chrome Extension**: Manifest V3

## Installation

### Prerequisites

1. Node.js 18+ installed
2. Chrome browser
3. Supabase account with database configured

### Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. The `.env` file is already configured with Supabase credentials

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Usage

### First Time Setup

1. Click the RelationHub extension icon in Chrome toolbar
2. Sign up with email and password
3. Start managing your contacts!

### Using the Sidebar

1. Visit any website
2. Click the floating cyan button in the bottom-right corner
3. The sidebar will slide in showing:
   - Detected emails on the page
   - Your recent contacts
   - Quick actions

### Adding Contacts

**From Detected Emails:**
- Click the "+" button next to any detected email
- Contact is automatically added to your database

**Manually:**
- Click the "+" button in the sidebar or dashboard
- Fill in contact details
- Save

### Tracking Interactions

1. Select a contact from the sidebar
2. Click action buttons:
   - Email icon: Log an email interaction
   - Phone icon: Log a call
   - Check icon: Add a note
3. All interactions are saved with timestamp and current URL

### Managing Contacts

1. Click the extension icon to open the full dashboard
2. Browse contacts, interactions, and meetings
3. Click any contact to view/edit details
4. Add notes, schedule meetings, update information

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Auth.tsx          # Authentication UI
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   └── Sidebar.tsx       # Extension sidebar
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/
│   │   └── supabase.ts       # Supabase client
│   ├── background.ts         # Extension background script
│   ├── content.ts            # Content script for email detection
│   ├── content.css           # Content script styles
│   ├── main.tsx              # Main app entry
│   └── sidebar.tsx           # Sidebar entry
├── public/
│   ├── manifest.json         # Extension manifest
│   ├── sidebar.html          # Sidebar HTML
│   └── icon.svg              # Extension icon
└── scripts/
    └── build-extension.js    # Build script
```

## Database Schema

The extension uses the following Supabase tables:

- **profiles**: User profiles linked to auth.users
- **contacts**: Contact information
- **interactions**: Interaction history
- **meetings**: Scheduled meetings

All tables have Row Level Security enabled to ensure users can only access their own data.

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Features Comparison with ClientPoint

| Feature | RelationHub | ClientPoint |
|---------|-------------|-------------|
| Email Detection | Yes | Yes |
| Contact Management | Yes | Yes |
| Interaction Tracking | Yes | Yes |
| Meeting Scheduling | Yes | Yes |
| Sidebar Interface | Yes | Yes |
| CRM Integration | Coming Soon | Yes |
| E-signatures | No | Yes |
| Payment Links | No | Yes |

## Security

- All data is stored securely in Supabase
- Row Level Security ensures data isolation
- Secure authentication with JWT tokens
- No data is shared with third parties
- Extension runs in sandboxed environment

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Brave (Chromium-based)
- Any Chromium-based browser supporting Manifest V3

## Contributing

This project was created as a demonstration of building a relationship management Chrome extension similar to ClientPoint.

## License

MIT
