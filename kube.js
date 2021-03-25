const { spawn } = require('child_process');
const { streamToString, exitWithError } = require('./utils');

const KUBECTL = 'kubectl';
const K_VERSION = 'version --client --short'.split(' ');
const K_GET_NS = 'get ns -ojson'.split(' ');
const K_GET_SVC = ns => `get svc -ojson -n${ns}`.split(' ');

const NO_KUBECTL_ERROR = "Failed to spawn 'kubectl', make sure it's installed".red;

async function getKubeVersion() {
    try {
        const versionCmd = spawn(KUBECTL, K_VERSION);
        versionCmd.on('error', () => exitWithError(NO_KUBECTL_ERROR));
        return (await streamToString(versionCmd.stdout)).split('v')[1].trim();
    } catch(e) {
        exitWithError(NO_KUBECTL_ERROR);
    }
}

async function getNamespaces() {
    const cmd = spawn(KUBECTL, K_GET_NS);
    const output = JSON.parse(await streamToString(cmd.stdout));

    return output.items.map(n => n.metadata.name);
}

async function getServices(namespace) {
    const cmd = spawn(KUBECTL, K_GET_SVC(namespace));
    const output = JSON.parse(await streamToString(cmd.stdout));

    return output.items.map(n => n.metadata.name);
}

async function getPorts(namespace, service) {
    const cmd = spawn(KUBECTL, `-n=${namespace} get svc ${service} -ojson`.split(' '));
    const output = JSON.parse(await streamToString(cmd.stdout));

    return output.spec.ports.map(p => p.port);
}

function portForward({ namespace, service, localPort, targetPort }) {
    return spawn(KUBECTL, `port-forward -n=${namespace} svc/${service} ${localPort}:${targetPort}`.split(' '));
}

module.exports = { getKubeVersion, getNamespaces, getServices, getPorts, portForward };
