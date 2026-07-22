# Fashion Rooms

An AI-powered collaborative social shopping platform where friends can browse products, create shared shopping rooms, chat in real-time, and make group purchase decisions.

## Features

- **Smart Product Discovery** — Browse and search a curated catalog of fashion products across Men, Women, Footwear, and Accessories categories
- **Collaborative Shopping Rooms** — Create or join rooms with friends to share products, vote on selections, and make group purchase decisions
- **Real-Time Chat** — Persistent room chats with real-time messaging via Socket.IO, including typing indicators, online presence, and message history
- **AI Stylist (@Maya)** — An AI fashion assistant integrated into room chats that provides style recommendations, answers fashion questions, and helps with purchase decisions
- **Group Voting System** — Members can upvote/downvote products, and vote on preferred colors and sizes for each item in the room cart
- **MynCoins Rewards** — Earn MynCoins (10 MynCoins = ₹1) when 75%+ of room members purchase an item; coins expire after 2 months
- **Personal Cart & Checkout** — Individual cart for personal purchases alongside room-based group purchasing
- **Consolidated Orders** — View all purchases (room and personal) in a single orders page with coin reward tracking
- **Room Analytics** — Track checkout progress, purchase percentages, and member activity within each room

## Tech Stack

- **Frontend** — React 19, Vite 8, TypeScript 6, Tailwind CSS v4, React Router v7
- **Backend** — Express 5, Socket.IO, better-sqlite3, TypeScript 7
- **Authentication** — JWT-based auth with bcryptjs password hashing
- **AI** — OpenAI integration for the @Maya stylist assistant

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd fashion-rooms

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

Copy the environment template and fill in your values:

```bash
cd server
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) |
| `OPENAI_API_KEY` | OpenAI API key for the @Maya AI stylist |

### Development

Start the server and client in separate terminals:

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

The client runs on `http://localhost:5173` and the server API on `http://localhost:3001`.

### Production Build

```bash
# Build client
cd client
npm run build

# Build server
cd ../server
npm run build

# Start production server (serves built client from server)
cd server
npm start
```

Visit `http://localhost:3001` in production mode.

## Project Structure

```
fashion-rooms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers (Auth, Socket, Chat, Toast)
│   │   ├── pages/          # Route page components
│   │   └── lib/            # API client utility
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── db/             # Database setup, migrations, seed data
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic layer
│   │   └── socket/         # Socket.IO event handlers
│   └── .env.example        # Environment variable template
└── README.md
```

## Custom Favicon

Replace the file at `client/public/favicon.svg` with your own image (SVG or any format supported by browsers). The path referenced in `client/index.html` is `/favicon.svg`.
