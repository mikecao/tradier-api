/* eslint-disable no-console */
const fs = require('fs');
const util = require('util');
const minimist = require('minimist');
const Tradier = require('./tradier');

const TOKEN_FILE = './token';
const ENDPOINT = 'prod';

const args = minimist(process.argv.slice(2));
const params = args._.slice(1);

function print(response) {
    console.log(util.inspect(response.data, false, null, true));
    return Promise.resolve(response);
}

function error(err) {
    console.error(err.response || err.message);
}

// Print stuff
console.log('args:', args);
console.log('--------------');
process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
});
console.log('--------------');

const [action] = args._;
const token = fs.existsSync(TOKEN_FILE) && fs.readFileSync(TOKEN_FILE, { encoding: 'utf8' }).replace(/\n$/, '');

const tradier = new Tradier(token, ENDPOINT);

switch (action) {
    case 'quote':
        tradier.quote(params[0].split(',')).then(print).catch(error);
        break;
    case 'timesales':
        tradier.timesales(...params)
            .then(print)
            .then((response) => {
                console.log(`Records: ${response.data.series.data.length}`);
            })
            .catch(error);
        break;
    default:
        if (tradier[action]) {
            tradier[action](...params).then(print).catch(error);
        } else {
            console.log('unknown action');
        }
}
