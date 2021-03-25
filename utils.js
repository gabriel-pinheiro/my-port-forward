function streamToString (stream) {
    const chunks = [];

    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

function exitWithError(error) {
    console.error(error);
    process.exit(1);
}

const logs = [];
const log = (...cols) => logs.push(cols);
function printLogs() {
    if(logs.length === 0) {
        return;
    }

    const maxSizes = new Array(logs[0].length).fill()
        .map((_, i) => logs.map(l => l[i].length).reduce((acc, v) => Math.max(acc, v), -Infinity));

    const text = logs.map(line =>
        line.map((col, i) => col.padEnd(maxSizes[i], ' ')).join('\t'))
        .join('\n');
    
    console.log(text);
}

module.exports = { streamToString, exitWithError, log, printLogs };
