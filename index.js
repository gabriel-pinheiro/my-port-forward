require('colors');
const { getKubeVersion, getNamespaces, getServices, portForward } = require('./kube');
const { Command } = require('commander');
const ora = require('ora');
const pkg = require('./package.json');
const { promptNamespace, promptService, promptPort, promptNext } = require('./prompt');
const { setGroups, getGroups } = require('./fs');
const { exitWithError } = require('./utils');

async function init() {
    const KUBE_VERSION = await getKubeVersion();
    const program = new Command()
        .version(`mpf/${pkg.version} kubectl/${KUBE_VERSION} node/${process.version}`);

    program.command('create <name>').description('Creates a port-forward group').action(async (name) => {
        let forwards = [];

        do {
            const namespaces = await getNamespaces();
            const namespace = await promptNamespace(namespaces);

            const services = await getServices(namespace);
            const service = await promptService(services);

            const targetPort = await promptPort('Which ' + 'port of the service'.yellow + ' would you like to forward?');
            const localPort = await promptPort('To which ' + 'local port'.yellow + ' would you like to forward?');

            forwards.push({ namespace, service, localPort, targetPort });
        } while(await promptNext());

        const groups = await getGroups().catch(() => {}) || {};
        groups[name] = forwards;
        await setGroups(groups);

        console.log(`\nAdded ${name.green} group with ${forwards.length.toString().green} port-forward`);
    });

    program.command('up <name>').description('Runs a port-forward group').action(async (name) => {
        const groups = await getGroups().catch(() => {});
        if(!groups) {
            exitWithError(`Oops, there are no groups, use 'mpf create <name>' to start`);
        }

        const group = groups[name];
        if(!group) {
            exitWithError(`Oops, the group ${name.red} doesn't exist`);
        }

        group.forEach(f => portForward(f));
        ora({
            color: 'green',
            text: `Listening on ports ${group.map(g => g.localPort).join(', ')}`,
            spinner: 'monkey',
        }).start();
    });

    program.parse();
}

init().catch(console.error);
