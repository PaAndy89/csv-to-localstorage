/**
 * Configuration object for CSV parsing.
 * @typedef {Object} Config
 * @property {string} delimiter - The delimiter used in the CSV file.
 * @property {boolean} header - Whether the CSV file contains a header row.
 */

/**
 * Handles the file reading process.
 * @param {File} file - The file to be read.
 * @param {HTMLElement} outputDiv - The output div where the results will be displayed.
 * @param {Config} config - Configuration object.
 * @param {string} config.delimiter - The delimiter used in the CSV file.
 * @param {boolean} config.header - Whether the CSV file contains a header row.
 */
export default function handleFile (file, outputDiv, config) {
    if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            parseCSV(content, file, outputDiv, config);
        };
        reader.onerror = () => {
            alert("Error reading file.");
        };
        reader.readAsText(file);
    } else {
        alert("Please upload a valid CSV file.");
    }
}

/**
 * Parses the CSV content.
 * @param {string} content - The content of the CSV file.
 * @param {File} file - The file being read.
 * @param {HTMLElement} outputDiv - The output div where the results will be displayed.
 * @param {Config} config - Configuration object.
 * @param {string} config.delimiter - The delimiter used in the CSV file.
 * @param {boolean} config.header - Whether the CSV file contains a header row.
 */
function parseCSV(content, file, outputDiv, config) {
    const { delimiter, header } = config;

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
        headers = parseRow(lines[0], delimiter);
        data = lines.slice(1).map((line) => {
            const values = parseRow(line, delimiter);
            return headers.reduce((obj, key, index) => {
                obj[key] = values[index] || "";
                return obj;
            }, {});
        });
    } else {
        data = lines.map((line) => parseRow(line, delimiter));
    }

    // Save data to localStorage
    localStorage.setItem(file.name, JSON.stringify(data));

    // Display parsed data    
    outputDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

/**
 * Parses a single row of CSV data.
 * @param {string} row - The row to be parsed.
 * @param {string} delimiter - The delimiter used in the CSV file.
 * @returns {string[]} - An array of values from the row.
 */
function parseRow(row, delimiter) {
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