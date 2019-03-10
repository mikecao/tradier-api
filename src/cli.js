#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const minimist = require('minimist');
const Tradier = require('./tradier');

const TOKEN_FILE = './token';
const args = minimist(process.argv.slice(2));
const [action, ...params] = args._;
const { token, endpoint, debug } = args;

function print(response) {
    if (debug) {
        console.log(response.config.url);
        console.log('--------------');
    }
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

const tradier = new Tradier(token || getToken(), endpoint || 'prod');

if (debug) {
    console.log('args:', args);
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
    console.log('Usage: tradier <command> [options]');
}
