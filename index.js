require('colors');
const { getKubeVersion, getNamespaces, getServices, getPorts } = require('./kube');
const { Command } = require('commander');
const ora = require('ora');
const pkg = require('./package.json');
const { promptNamespace, promptService, promptNext, promptLocalPort, promptTargetPort } = require('./prompt');
const { setGroups, getGroups } = require('./fs');
const { exitWithError, log, printLogs } = require('./utils');
const { PortForward } = require('./port-forward');

async function init() {
    const KUBE_VERSION = await getKubeVersion();
    const program = new Command()
        .version(`mpf/${pkg.version} kubectl/${KUBE_VERSION} node/${process.version}`);

    program.command('list').description('Lists all port-forward groups').action(async () => {
        const groups = await getGroups().catch(() => {});
        if(!groups) {
            exitWithError(`Oops, there are no groups, use 'mpf create <name>' to start`);
        }

        log('NAME    ', 'PORTS')
        Object.entries(groups).forEach(([name, forwards]) =>
            log(name, forwards.map(f => f.localPort).join(', ')));

        printLogs();
    });

    program.command('get <name>').description('Lists all port-forwards of a group').action(async (name) => {
        const groups = await getGroups().catch(() => {});
        if(!groups) {
            exitWithError(`Oops, there are no groups, use 'mpf create <name>' to start`);
        }

        const group = groups[name];
        if(!group) {
            exitWithError(`Oops, the group ${name.red} doesn't exist`);
        }

        log('LOCAL PORT  ', 'NAMESPACE  ', 'SERVICE  ', 'REMOTE PORT');
        group.forEach(f => log(f.localPort.toString(), f.namespace, f.service, f.targetPort.toString()));
        printLogs();
    });

    program.command('delete <name>').description('Deletes a port-forward group').action(async (name) => {
        const groups = await getGroups().catch(() => {});
        if(!groups) {
            exitWithError(`Oops, there are no groups, use 'mpf create <name>' to start`);
        }

        if(!groups[name]) {
            exitWithError(`Oops, the group ${name.red} doesn't exist`);
        }

        delete groups[name];
        await setGroups(groups);
    });

    program.command('create <name>').description('Creates a port-forward group').action(async (name) => {
        let forwards = [];
        const namespaces = await getNamespaces();

        do {
            const namespace = await promptNamespace(namespaces);
            const services = await getServices(namespace);
            if(services.length === 0) {
                console.log('Oops, there are no services in this namespace'.yellow);
                namespaces.splice(namespaces.indexOf(namespace), 1);
                continue;
            }

            const service = await promptService(services);
            const servicePorts = await getPorts(namespace, service);

            const targetPort = servicePorts.length === 1 ? servicePorts[0] : await promptTargetPort(servicePorts);
            const localPort = await promptLocalPort(targetPort);

            forwards.push({ namespace, service, localPort, targetPort });
        } while(await promptNext());

        const groups = await getGroups().catch(() => {}) || {};
        groups[name] = forwards;
        await setGroups(groups);

        console.log(`\nAdded ${name.green} group with ${forwards.length.toString().green} port-forward`);
    });

    program
        .command('up <name>')
        .option('-t, --timeout <seconds>', 'Seconds to wait for port-forward to start listening. Defaults to 10')
        .description('Runs a port-forward group')
        .action(async (name, { timeout }) => {
            const groups = await getGroups().catch(() => {});
            if(!groups) {
                exitWithError(`Oops, there are no groups, use 'mpf create <name>' to start`);
            }

            const group = groups[name];
            if(!group) {
                exitWithError(`Oops, the group ${name.red} doesn't exist`);
            }

            const spinner = ora({
                color: 'green',
                text: 'Creating tunnels',
            }).start();
            const forwards = group.map(g => new PortForward(g, { timeout }))
            const successMessage = `Listening on ports ${forwards.map(f => f.localPort).join(', ')}`;

            forwards.forEach(f => f.registerMessageEvents(successMessage.length));
            forwards.forEach(f => f.on('exit', () => {
                forwards.forEach(f2 => f2.kill());
                process.exit(1);
            }));

            await Promise.all(forwards.map(f => f.start()));
            spinner.stop();

            ora({
                text: successMessage,
                spinner: 'monkey',
            }).start();
        });

    program.parse();
}

init().catch(console.error);
