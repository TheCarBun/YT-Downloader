import { useState } from "react";
import "./App.css"; // Make sure this CSS file exists, we'll clear it later

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("highestvideo"); // For MP4
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // IMPORTANT: This URL points to your Node.js backend server.
  // For local development, it's http://localhost:5000
  // When deployed to Vercel, it will be relative: '/api' (we'll change this later)
  const backendUrl = "http://localhost:5000";

  const handleDownload = async () => {
    if (!videoUrl) {
      setMessage("Please enter a YouTube video URL.");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const downloadUrl = new URL(`${backendUrl}/download`);
      downloadUrl.searchParams.append("url", videoUrl);
      downloadUrl.searchParams.append("format", format);
      if (format === "mp4") {
        downloadUrl.searchParams.append("quality", quality);
      }

      const response = await fetch(downloadUrl.toString());

      if (response.ok) {
        const blob = await response.blob();

        // --- MODIFIED FILENAME EXTRACTION START (WITH DEBUGGING) ---
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `youtube_video.${format}`; // Default fallback if header parsing fails

        if (contentDisposition) {
          // Attempt to extract from filename* (UTF-8 encoded) first (RFC 5987)
          const filenameStarMatch = /filename\*=(?:utf-8''|UTF-8'')(.*)/.exec(
            contentDisposition
          );
          if (filenameStarMatch && filenameStarMatch[1]) {
            try {
              filename = decodeURIComponent(filenameStarMatch[1]);
              console.log(
                "DEBUG: Filename extracted from filename*:",
                filename
              );
            } catch (e) {
              console.warn("DEBUG: Could not decode filename*:", e);
            }
          } else {
            // Fallback to basic filename= (RFC 6266)
            const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
            } else {
              console.warn(
                "DEBUG: Could not find 'filename=\"...\"' pattern in Content-Disposition."
              );
            }
          }
        } else {
          console.warn("DEBUG: Content-Disposition header was not found.");
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename; // Use the extracted/fallback filename

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessage("Download initiated! Check your browser downloads.");
        setVideoUrl("");
      } else {
        const errorData = await response.json();
        setMessage(
          `Error: ${errorData.error || "Something went wrong on the server."}`
        );
      }
    } catch (error) {
      console.error("Frontend download error:", error);
      setMessage(
        `Network error or problem connecting to backend: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract YouTube video ID for embedding
  const getYouTubeVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Video/Audio Downloader</h1>
        <div>
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            style={{
              width: "300px",
              padding: "10px",
              marginRight: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{
              padding: "10px",
              marginRight: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="mp4">MP4 (Video)</option>
            <option value="mp3">MP3 (Audio)</option>
          </select>

          {format === "mp4" && (
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              style={{
                padding: "10px",
                marginRight: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="highestvideo">Highest Quality (MP4)</option>
              <option value="137">1080p</option>{" "}
              {/* Example ITAG - might need FFmpeg backend */}
              <option value="136">720p</option>{" "}
              {/* Example ITAG - might need FFmpeg backend */}
              <option value="18">360p (Combined)</option>{" "}
              {/* Older combined stream */}
              {/* Note: Specific ITAGs like 137/136 are video-only; backend needs FFmpeg to merge.
                   'highestvideo' will try to find a progressive (combined) stream first. */}
            </select>
          )}

          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              cursor: "pointer",
            }}
          >
            {loading ? "Downloading..." : "Download"}
          </button>
        </div>
        {message && (
          <p
            style={{
              marginTop: "20px",
              color: loading
                ? "#007bff"
                : message.includes("Error")
                ? "red"
                : "green",
            }}
          >
            {message}
          </p>
        )}

        {/* Video preview */}
        {videoId && (
          <div style={{ marginTop: "30px" }}>
            <h2>Video Preview</h2>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: "none", borderRadius: "8px" }}
            ></iframe>
          </div>
        )}

        <footer style={{ marginTop: "50px", fontSize: "0.8em", color: "#888" }}>
          <p>Built with React (Vite) and Node.js by TheCarBun</p>
        </footer>
      </header>
    </div>
  );
}

export default App;
