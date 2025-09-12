# Project Overview

This is a Chrome extension that scans Hacker News comment threads and extracts all hyperlinks from the comments. It provides a popup interface to view, filter, copy, and export these links.

**Key Technologies:**

*   **Platform:** Chrome Extension (Manifest V3)
*   **Languages:** JavaScript
*   **Core Logic:**
    *   `content.js`: Injected into Hacker News item pages to traverse the DOM, find all links within comment bodies (`.commtext`), and extract associated metadata like the author, a snippet of the comment, and a permalink.
    *   `popup.js`: Manages the popup UI. It receives the extracted link data from the content script and handles rendering, filtering (by text/URL, uniqueness), grouping (by domain), copying URLs to the clipboard, and exporting the data as a CSV file.
*   **UI:**
    *   `popup.html`: The main structure of the extension's popup.
    *   `popup.css`: Basic styling for the popup interface.

# Building and Running

This is a standard Chrome extension and does not require a build step.

**To run the extension:**

1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode" using the toggle in the top-right corner.
3.  Click the "Load unpacked" button.
4.  Select the directory containing this project (`/Users/raj/ai/chrome-extension/hn-comment-links`).
5.  The extension will be installed and active. You can test it by navigating to any Hacker News discussion page (e.g., `https://news.ycombinator.com/item?id=...`) and clicking the extension's icon in the toolbar.

# Development Conventions

*   **Code Style:** The code uses modern JavaScript (ES6+ features like `async/await`, `const/let`). It follows a clean, functional approach with helper functions for DOM manipulation (`$`) and data processing.
*   **Structure:**
    *   `manifest.json`: Defines the extension's properties, permissions, and entry points.
    *   `content.js`: Handles all interaction with the Hacker News page DOM.
    *   `popup.html`/`popup.js`/`popup.css`: A self-contained component for the extension's user interface.
*   **Data Handling:** The `content.js` script is responsible for gathering all necessary data from the page. The `popup.js` script then handles all presentation logic based on that data, making a clean separation of concerns.
*   **Error Handling:** Basic error handling is present to inform the user if the extension is used on a non-Hacker News page or if an unexpected error occurs during execution.
