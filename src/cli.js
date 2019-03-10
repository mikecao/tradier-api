#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const yargs = require('yargs');
const Tradier = require('./tradier');

const CONFIG_FILE = './tradier.json';
const cmd = yargs
    .usage('Usage: tradier <command> [options]')
    .options({
        debug: {
            type: 'boolean',
            alias: 'd',
            describe: 'Show debug output',
        },
        token: {
            type: 'string',
            alias: 't',
            describe: 'API token',
        },
        endpoint: {
            type: 'string',
            alias: 'e',
            describe: 'API endpoint (prod, beta, sandbox)',
        },
    })
    .help('h')
    .alias('h', 'help');

const { argv } = cmd;
const {
    _: [action, ...params],
    token,
    endpoint,
    debug,
} = argv;

function print(data) {
    console.log(util.inspect(data, false, null, true));
}

function error(err) {
    if (debug) {
        console.log(err.response);
    }
    console.error(`ERROR: ${err.message}`);
    console.error(`${err.response.data}`);
}

function getConfig() {
    return JSON.parse(
        fs.existsSync(CONFIG_FILE) &&
            fs.readFileSync(CONFIG_FILE, { encoding: 'utf8' })
    );
}

const config = getConfig();
const tradier = new Tradier(token || config.token, endpoint || config.endpoint);

if (debug) {
    console.log('args:', argv);
    console.log('--------------');
    process.argv.forEach((val, index) => {
        console.log(`${index}: ${val}`);
    });
    console.log('--------------');
}

if (tradier[action]) {
    tradier[action](...params)
        .then(print)
        .catch(error);
} else {
    cmd.showHelp();
}
