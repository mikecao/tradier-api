#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const minimist = require('minimist');
const Tradier = require('./tradier');

const TOKEN_FILE = './token';
const ENDPOINT = 'prod';

function print(response) {
    console.log(response.config.url);
    console.log('--------------');
    console.log(util.inspect(response.data, false, null, true));
    return Promise.resolve(response);
}

function error(err) {
    console.error(err.response || err.message);
}

function getToken() {
    return (
        fs.existsSync(TOKEN_FILE) &&
        fs.readFileSync(TOKEN_FILE, { encoding: 'utf8' }).replace(/\n$/, '')
    );
}

// Start
const args = minimist(process.argv.slice(2));
const [action, ...params] = args._;
const token = getToken();
const tradier = new Tradier(token, ENDPOINT);

// Print stuff
console.log('args:', args);
console.log('--------------');
process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
});
console.log('--------------');

// Do stuff
switch (action) {
    case 'quote':
        tradier
            .quote(params[0].split(','))
            .then(print)
            .catch(error);
        break;
    case 'timesales':
        tradier
            .timesales(...params)
            .then(print)
            .then(response => {
                console.log(`Records: ${response.data.series.data.length}`);
            })
            .catch(error);
        break;
    default:
        if (tradier[action]) {
            tradier[action](...params)
                .then(print)
                .catch(error);
        } else {
            console.log('unknown action');
        }
}
