class CsvReader extends HTMLElement {
  constructor() {
    super();

    // Attach shadow DOM
    this.attachShadow({ mode: "open" });

    // Default configuration
    this.config = {
      delimiter: ",", // Default delimiter
      header: true, // Parse with headers
    };

    // Create DOM structure
    this.shadowRoot.innerHTML = `
      <div id="drop-zone">
        <p>Drag & Drop your CSV file here</p>
        <p>or</p>
        <button id="file-selector">Select a File</button>
        <input type="file" id="file-input" accept=".csv" hidden />
      </div>
      <div id="output"></div>
    `;

    // Append styles to shadow DOM
    this.addStyles();
  }

  connectedCallback() {
    const dropZone = this.shadowRoot.querySelector("#drop-zone");
    const fileInput = this.shadowRoot.querySelector("#file-input");
    const fileSelector = this.shadowRoot.querySelector("#file-selector");
    const outputDiv = this.shadowRoot.querySelector("#output");

    // Drag-and-drop handlers
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      this.handleFile(file, outputDiv);
    });

    // File selector handlers
    fileSelector.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      this.handleFile(file, outputDiv);
    });
  }

  // Function to handle file reading
  handleFile(file, outputDiv) {
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        this.parseCSV(content, outputDiv);
      };
      reader.onerror = () => {
        alert("Error reading file.");
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  }

  // Function to parse CSV content
  parseCSV(content, outputDiv) {
    const { delimiter, header } = this.config;

    // Split content into lines
    const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.length === 0) {
      alert("CSV file is empty!");
      return;
    }

    // Extract headers if needed
    let headers = [];
    let data = [];

    if (header) {
      headers = this.parseRow(lines[0], delimiter);
      data = lines.slice(1).map((line) => {
        const values = this.parseRow(line, delimiter);
        return headers.reduce((obj, key, index) => {
          obj[key] = values[index] || "";
          return obj;
        }, {});
      });
    } else {
      data = lines.map((line) => this.parseRow(line, delimiter));
    }

    // Save data to localStorage
    localStorage.setItem("csvData", JSON.stringify(data));

    // Display parsed data
    outputDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  }

  // Function to parse a single row of CSV
  parseRow(row, delimiter) {
    const regex = new RegExp(
      `(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`,
      "g"
    );
    const result = [];
    let match;
    while ((match = regex.exec(row)) !== null) {
      result.push(match[1] ? match[1].replace(/""/g, '"') : match[2]);
    }
    return result;
  }

  // Function to dynamically add styles to shadow DOM
  addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #drop-zone {
        border: 2px dashed #0078d4;
        background: #f9f9f9;
        padding: 20px;
        text-align: center;
        border-radius: 10px;
        transition: background 0.3s, border-color 0.3s;
      }

      #drop-zone.dragover {
        border-color: #005bb5;
        background: #eaf4fc;
      }

      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        background: #f4f4f4;
        padding: 10px;
        border-radius: 5px;
        overflow: auto;
      }

      button {
        margin-top: 10px;
        padding: 10px 15px;
        border: none;
        background: #0078d4;
        color: white;
        border-radius: 5px;
        cursor: pointer;
      }

      button:hover {
        background: #005bb5;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  // Allow setting configuration via attributes
  static get observedAttributes() {
    return ["delimiter", "header"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "delimiter") {
      this.config.delimiter = newValue;
    } else if (name === "header") {
      this.config.header = newValue === "true";
    }
  }
}

// Define the custom element
customElements.define("csv-reader", CsvReader);
