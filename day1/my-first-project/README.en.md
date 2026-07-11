# TechNews CLI Tool

[中文版本](README.md) | English Version

A Node.js-based command-line interface (CLI) tool designed to fetch the latest headlines from [TechNews.tw](https://technews.tw/) and allow users to select an article from the terminal to open and read it in their default web browser.

---

## Features

- **Real-time Headline Fetching**: Automatically scrapes and retrieves the latest headlines from the TechNews homepage.
- **Colored Terminal Output**: Leverages `picocolors` to format text for better readability and UI presentation.
- **Duplicate URL Filtering**: Uses a `Set` to prevent duplicate articles from cluttering the listing.
- **Interactive Command-line Menu**: Integrates Node's native `readline` module for an intuitive selection and control flow.
- **One-click Browser Launching**: Uses the `open` library to automatically launch the default browser with the selected article URL.

---

## Requirements

- **Node.js**: v18.0.0 or higher (v20+ or v24+ recommended, as the tool relies on Node's native `fetch` API).

---

## Installation & Usage

### 1. Install Dependencies

Install the required npm packages from the root directory:

```bash
npm install
```

### 2. Run the Tool

Launch the application using npm scripts:

```bash
npm start
```

Or run it directly:

```bash
node index.js
```

---

## Project Structure

This project adopts a clean, lightweight structure, treating "development context and decision records" as first-class assets:

```text
my-first-project/
├── index.js              # Core application logic (scraper & CLI interaction)
├── package.json          # Package info and dependencies
├── package-lock.json     # Dependency lockfile
├── AGENTS.md             # Custom rules for AI agents and engineering practices
└── notes/                # Engineering Notebook root
    └── daily/            # Daily developer journals (decisions, attempts, bugs)
        └── YYYY-MM-DD.md
```

### Engineering Notebook Guidelines
We maintain development contexts under `notes/daily/` using Markdown files with standard YAML Frontmatter. The goal is to preserve context, trade-offs, and debug findings for future contributors and agent systems.

---

## Technical Implementation Details

The implementation is divided into two major components: the Cheerio Web Scraper and the Readline Interactive Menu.

### 1. Cheerio Web Scraper Logic

In [index.js](index.js), the scraping and parsing process works as follows:

* **Sending the Request**: We perform an HTTP GET request to the TechNews homepage using Node's native `fetch` API. A customized `User-Agent` header is added to avoid simple bot detection.
* **HTML Parsing**: Once the HTML body text is fetched, it is parsed via `cheerio.load(html)`. Cheerio implements a subset of core jQuery, allowing for intuitive DOM selection.
* **Selector Query**:
  ```javascript
  $('h1.entry-title a').each((i, el) => { ... })
  ```
  We target `h1.entry-title a` to query the title and link of each headline article.
* **Deduplication**: We initialize a `seenUrls` Set. During traversal, if an article's URL is already present in the Set, we skip it. This ensures all listed headlines are unique.

### 2. Readline Menu & Browser Launching

Once articles are ready, the command-line menu takes over:

* **Interface Creation**: We initialize `readline.createInterface` mapped to `process.stdin` (input) and `process.stdout` (output).
* **Recursive Prompting**:
  We define a recursive `promptUser()` loop. After launching an article or entering an invalid command, the prompt function calls itself recursively. This allows the user to continue selecting articles without restarting the program.
* **Launching the Browser**:
  Upon selecting a valid article index, we extract the target URL and launch the browser asynchronously:
  ```javascript
  await open(selected.url);
  ```
  We wrap the launch in a `try-catch` block. If launching the browser fails, the tool gracefully outputs the URL so the user can manually copy/paste it.
* **Exiting**: Typing `q`, `quit`, or `exit` closes the readline interface and terminates the program via `process.exit(0)`.
