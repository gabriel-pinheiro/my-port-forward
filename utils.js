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

module.exports = { streamToString, exitWithError };
