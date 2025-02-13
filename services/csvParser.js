const csv = require('csv-parser'); // Import the csv-parser library
const { Readable } = require('stream'); // Required to convert buffer to readable stream

// Parse the CSV file
const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from(file.buffer.toString()); // Convert the buffer to a readable stream

        stream.pipe(csv()) // Pipe it through the csv-parser
            .on('data', (data) => results.push(data)) // Push each row of data into the results array
            .on('end', () => resolve(results)) // Resolve the promise when parsing is done
            .on('error', (error) => reject(error)); // Reject the promise if there's an error
    });
};

module.exports = { parseCSV };
