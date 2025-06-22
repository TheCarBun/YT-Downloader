# YouTube Video/Audio Downloader

A full-stack web application for downloading YouTube videos or audio in MP4 or MP3 format. Built with React (Vite) for the frontend and Node.js (Express + ytdl-core) for the backend.

---

## Features

- Download YouTube videos as MP4 (video+audio) or MP3 (audio only)
- Select video quality (highest, 1080p, 720p, 360p)
- Video preview before downloading
- Clean, responsive UI
- Cross-origin download support

---

## Project Structure

```
YT Downloader/
├── backend_node/      # Node.js Express backend
│   ├── package.json
│   └── server.js
├── frontend/          # React frontend (Vite)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── ...
│   └── public/
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

---

### 1. Backend Setup (`backend_node`)

1. **Install dependencies:**

```bash
cd backend_node
npm install
```

2. **Start the backend server:**

```bash
npm start
```

The backend runs on [http://localhost:5000](http://localhost:5000).

---

### 2. Frontend Setup (`frontend`)

1. **Install dependencies:**

```bash
cd ../frontend
npm install
```

2. **Start the frontend dev server:**

```bash
npm run dev
```

The frontend runs on [http://localhost:5173](http://localhost:5173) by default.

---

### 3. Usage

1. Open the frontend in your browser.
2. Enter a YouTube video URL.
3. Choose format (MP4/MP3) and quality.
4. Click **Download**.
5. The file will be downloaded with the correct filename.

---

## Configuration

- **Backend URL:**  
  The frontend expects the backend at `http://127.0.0.1:5000/` (see `App.jsx`).  
  Update this if deploying to a different host or port.

- **CORS:**  
  CORS is enabled and configured to expose the `Content-Disposition` header for correct filename downloads.

---

## Backend Details

- **Tech:** Node.js, Express, ytdl-core
- **Main endpoint:**
  - `GET /download?url=YOUTUBE_URL&format=mp4|mp3&quality=itag|highestvideo`
- **Features:**
  - Validates YouTube URLs
  - Streams video/audio directly to the client
  - Sets correct MIME type and filename

---

## Frontend Details

- **Tech:** React 19, Vite
- **Features:**
  - Clean UI with input, format/quality selection, and video preview
  - Handles download and error states
  - Extracts filename from backend response

---

## Notes

- For some high-quality MP4 downloads (e.g., 1080p), merging video/audio may require FFmpeg, which is not supported in this backend. The app will return an error if a combined stream is not available.
- Only single video URLs are supported (no playlists).

---

## License

MIT

---

## Credits

- [ytdl-core](https://github.com/fent/node-ytdl-core)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
