const { promises: fs } = require('fs');
const os = require('os');
const path = require('path');

const homedir = os.homedir();
const mpfDir = path.join(homedir, '.mpf');

async function getGroups() {
    try {
        const file = await fs.readFile(path.join(mpfDir, 'groups.json'));
        return JSON.parse(file.toString());
    } catch(e) {
        throw new Error(`No groups found, create one with 'mpf create <name>'`);
    }
}

async function setGroups(groups) {
    await fs.mkdir(mpfDir, { recursive: true });
    await fs.writeFile(path.join(mpfDir, 'groups.json'), JSON.stringify(groups));
}

module.exports = { getGroups, setGroups };
