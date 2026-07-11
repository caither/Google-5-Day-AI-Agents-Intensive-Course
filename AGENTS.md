
## Chinese Documentation Encoding

- Chinese Markdown documents are expected to be UTF-8.
- When inspecting Chinese documentation through PowerShell, explicitly pass `-Encoding UTF8` to `Get-Content` to avoid Windows PowerShell default encoding or terminal output decoding artifacts.
- Do not report Chinese documentation as garbled based only on default PowerShell output. Confirm with an explicit UTF-8 read, VS Code rendering, or byte-level inspection first.
- If Chinese text appears garbled only in terminal output but renders correctly in VS Code or with explicit UTF-8 reading, treat it as a terminal decoding issue, not a documentation defect.

