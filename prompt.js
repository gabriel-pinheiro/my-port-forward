const inquirer = require('inquirer');

async function promptNamespace(namespaces) {
    const { namespace } = await inquirer.prompt([{
        type: 'list',
        name: 'namespace',
        message: 'From which namespace would you like to add a service?',
        choices: namespaces,
    }]);

    return namespace;
}

async function promptService(services) {
    const { service } = await inquirer.prompt([{
        type: 'list',
        name: 'service',
        message: 'Which service would you like to port-forward?',
        choices: services,
    }]);

    return service;
}

async function promptPort(message) {
    const { port } = await inquirer.prompt([{
        type: 'input',
        name: 'port',
        message,
        validate: function (value) {
            if(isNaN(value)) {
                return 'Must be a number';
            }

            if(parseInt(value) < 0 || parseInt(value) > 65353) {
                return 'Must be between 0 and 65353';
            }

            return true;
        },
    }]);

    return port;
}

async function promptNext() {
    const { bool } = await inquirer.prompt([{
        type: 'confirm',
        name: 'bool',
        message: 'Would you like to add another one?'
    }]);

    return bool;
}

module.exports = { promptNamespace, promptService, promptPort, promptNext };
