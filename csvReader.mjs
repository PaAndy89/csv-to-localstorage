import handleFile from "./handleFile.mjs";

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
    const element = document.createElement(tag);
    if (text) element.innerText = text;
    if (type) element.type = type;
    if (id) element.id = id;
    if (className) element.className = className;
    if (accept) element.accept = accept;
    if (hidden) element.hidden = hidden;
    return element;
  }

  connectedCallback() {
    const dropZone = this.shadowRoot.querySelector("#drop-zone");
    const fileInput = this.shadowRoot.querySelector("#file-input");
    const fileSelector = this.shadowRoot.querySelector("#file-selector");
    const outputDiv = this.shadowRoot.querySelector("#output");

    // Drag-and-drop handlers
    dropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      dropZone.classList.remove("dragover");
      const file = event.dataTransfer.files[0];
      handleFile(file, outputDiv, this.config);
    });

    // File selector handlers
    fileSelector.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      handleFile(file, outputDiv, this.config);
    });
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
