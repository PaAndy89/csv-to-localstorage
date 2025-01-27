class CsvReader extends HTMLElement {
  constructor() {
    super();

    // Attach shadow DOM
    this.attachShadow({ mode: "open" });

    // Default configuration
    this.config = {
      delimiter: ";", // Default delimiter
      header: true, // Parse with headers
    };

    // Create DOM structure   
    let dropZone = this.createElement({ tag: 'div', id: 'drop-zone' });
    dropZone.append(
      this.createElement({ tag: 'p', text: 'Drag & Drop your CSV file here' }),
      this.createElement({ tag: 'p', text: 'or' }),
      this.createElement({ tag: 'button', id: 'file-selector', text: 'Select a File' }),
      this.createElement({ tag: 'input', type: 'file', id: 'file-input', accept: '.csv', hidden: true })
    );
    this.shadowRoot.append(dropZone, this.createElement({ tag: 'div', id: 'output' }));

    // Append styles to shadow DOM
    this.addStyles();
  }

  createElement({ tag = 'div', text = '', type = "", id = '', className = '', accept = '', hidden = false }) {
    let element = document.createElement(tag);
    element.innerText = text;
    if (type !== '') element.type = type;
    if (id !== '') element.id = id;
    if (className !== '') element.className = className;
    if (accept !== '') element.accept = accept;
    if (hidden) element.hidden = hidden;
    return element;
  }

  connectedCallback() {
    const dropZone = this.shadowRoot.querySelector("#drop-zone");
    const fileInput = this.shadowRoot.querySelector("#file-input");
    const fileSelector = this.shadowRoot.querySelector("#file-selector");

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
      this.handleFile(file);
    });
  }

  // Function to handle file reading
  handleFile(file) {
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        this.parseCSV(content, file);
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
  parseCSV(content, file) {
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
    localStorage.setItem(file.name, JSON.stringify(data));

    // Display parsed data    
    const outputDiv = this.shadowRoot.querySelector("#output");
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
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './style.css';
    this.shadowRoot.appendChild(link);
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
