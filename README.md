# CSV Reader Web Component

A custom web component (`<csv-reader>`) that allows you to easily upload and parse CSV files directly in the browser. This component is built without external libraries and provides drag-and-drop functionality, customizable parsing options, and local storage integration.

---

## Features

- **Drag-and-Drop Support**: Drag CSV files onto the component to upload them.
- **File Input Fallback**: Includes a "Select a File" button for manual file selection.
- **Customizable Options**:
  - Configurable delimiters (e.g., `,`, `;`, etc.).
  - Option to include or exclude headers.
- **Encapsulated Styles**: Uses the shadow DOM to ensure style isolation.
- **LocalStorage Integration**: Parsed data is automatically saved to `localStorage` for later use.

---

## Usage

### 1. Include the Component

Add the `csvReader.js` file to your project and include it as a module:

```html
<script type="module" src="./csvReader.js"></script>
