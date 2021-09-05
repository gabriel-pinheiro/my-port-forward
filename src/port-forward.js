const { EventEmitter } = require('events');
const { portForward } = require('./kube');

const KUBE_TO_EVENT = {
    FORWARDING: 'listen',
    HANDLING: 'connection',
};

class PortForward extends EventEmitter {
    constructor({ namespace, service, localPort, targetPort }, { timeout = 10 } = {}) {
        super();

        this.namespace = namespace;
        this.service = service;
        this.localPort = localPort;
        this.targetPort = targetPort;

        this.timeout = timeout;

        this.isListening = false;
        this.process = null;
    }

    start() {
        return new Promise((res, rej) => {
            this.process = portForward(this);
            this.process.on('error',       () => this.emit('exit'));
            this.process.on('exit',        () => this.emit('exit'));
            this.process.stderr.on('data',  e => this.emit('exit', e.toString()));
            this.process.stdout.on('data',  d => this._processLog(d.toString('utf8')));

            const timeout =  setTimeout(() => this.emit('exit', 'Port-forward took too long to stablish.\nMake sure that your service has available endpoints (kubectl get ep) or use the option --timeout <seconds> to increase the timeout.'), this.timeout * 1e3);
            this.once('exit', () => {
                this.isListening = false;
                rej();
                clearTimeout(timeout);
            });
            this.once('listen', () => {
                this.isListening = true;
                res();
                clearTimeout(timeout);
            });

        });
    }

    registerMessageEvents(padLength) {
        const pad = padLength + 15;

        this.on('listen', () => {
            console.log(`\r${'✔'.green} Forwarding ${this.localPort} to ${this.namespace}/${this.service}:${this.targetPort}`.padEnd(pad, ' '));
        });

        this.on('exit', m => {
            const baseMessage = `\r${'✖'.red} Failed to forward ${this.localPort} to ${this.namespace}/${this.service}:${this.targetPort}`;
            const message = baseMessage + (m ? ': ' + m : '');

            console.error(message.padEnd(pad, ' '));
        });

        this.on('connection', () => {
            console.log(`\r${'ℹ'.blue} Handling connection on ${this.localPort} ${new Date().toISOString().grey}`.padEnd(pad, ' '));
        });
    }

    kill() {
        this.process.kill();
    }

    _processLog(log) {
        if(log.trim().length === 0) {
            return;
        }

        const firstWord = log.split(' ')[0].toUpperCase();
        if(firstWord === 'FORWARDING' && this.isListening) {
            return;
        }

        this.emit(KUBE_TO_EVENT[firstWord] || 'unknown');
    }
}

module.exports = { PortForward };
