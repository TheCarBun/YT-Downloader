const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const path = require("path"); // Not strictly needed for serverless, but good for local dev understanding
const fs = require("fs"); // Not strictly needed for serverless, but good for local dev understanding

const app = express();
const port = 5000;

// Configure CORS to allow Content-Disposition header to be exposed to the frontend
app.use(
  cors({
    exposedHeaders: ["Content-Disposition"],
  })
);
app.use(express.json());

// Basic route to check if the backend is running
app.get("/", (req, res) => {
  res.send("YouTube Downloader Backend is running!");
});

// Main download route
app.get("/download", async (req, res) => {
  const videoURL = req.query.url;
  const format = req.query.format || "mp4"; // Default to mp4
  const quality = req.query.quality || "highestvideo"; // Default to highest video quality for MP4

  // Basic URL validation
  if (!videoURL || !ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: "Invalid YouTube URL provided." });
  }

  try {
    // Get video information (title, available formats, etc.)
    const info = await ytdl.getInfo(videoURL);
    // Sanitize the title to create a safe filename
    const title = info.videoDetails.title
      .replace(/[^a-zA-Z0-9_\-]/g, "_")
      .replace(/_{2,}/g, "_")
      .trim();

    let selectedFormat;
    let mimeType;
    let filename;

    if (format === "mp4") {
      // Try to find a progressive MP4 stream (contains both video and audio) for the desired quality
      selectedFormat = ytdl.chooseFormat(info.formats, {
        quality: quality,
        filter: "videoandaudio",
      });

      // If a specific quality progressive stream isn't found, fall back to highest progressive
      if (!selectedFormat) {
        selectedFormat = ytdl.chooseFormat(info.formats, {
          progressive: true,
          filter: "videoandaudio",
        });
        if (!selectedFormat) {
          // If no progressive stream is found at all, you might need FFmpeg to merge later
          return res.status(500).json({
            error:
              "Could not find a suitable combined video/audio format for MP4. High-quality MP4s (1080p+) often require merging video and audio streams with FFmpeg.",
          });
        }
      }

      mimeType = "video/mp4";
      filename = `${title}.mp4`;
    } else if (format === "mp3") {
      // Select the highest quality audio-only stream
      selectedFormat = ytdl.chooseFormat(info.formats, {
        quality: "highestaudio",
      });
      if (!selectedFormat) {
        return res
          .status(500)
          .json({ error: "Could not find a suitable audio format for MP3." });
      }
      mimeType = "audio/mpeg"; // Standard MIME type for MP3
      filename = `${title}.mp3`;
    } else {
      return res
        .status(400)
        .json({ error: 'Unsupported format. Choose "mp4" or "mp3".' });
    }

    // Set headers for file download
    res.header("Content-Disposition", `attachment; filename="${filename}"`);
    res.header("Content-Type", mimeType);

    // Pipe the video stream directly to the response, allowing the browser to download
    ytdl(videoURL, { format: selectedFormat }).pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    // Send a user-friendly error message
    res.status(500).json({ error: `Failed to download video: ${err.message}` });
  }
});

// Start the server for local development
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
