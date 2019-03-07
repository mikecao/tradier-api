const querystring = require('querystring');
const axios = require('axios');
const ensureArray = require('ensure-array');

const URLS = {
    prod: 'https://api.tradier.com/v1/',
    beta: 'https://api.tradier.com/beta/',
    sandbox: 'https://sandbox.tradier.com/v1/',
};

class Tradier {
    constructor(accessToken, endpoint = 'sandbox') {
        this.accessToken = accessToken;
        this.endpoint = endpoint;
        this.host = URLS[endpoint];
    }

    // region HTTP
    config() {
        return {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                Accept: 'application/json',
            },
        };
    }

    get(url, params) {
        const str = querystring.stringify(Object.keys(params).reduce((values, key) => {
            if (params[key] !== undefined) {
                values[key] = params[key];
            }
            return values;
        }, {}));
        const query = str ? `?${str}` : '';

        return axios.get(`${this.host}${url}${query}`, this.config());
    }

    post(url, data) {
        return axios.post(`${this.host}${url}`, data, this.config());
    }

    put(url, data) {
        return axios.put(`${this.host}${url}`, data, this.config());
    }

    delete(url) {
        return axios.delete(`${this.host}${url}`, this.config());
    }
    // endregion

    // region User Data
    profile() {
        return this.get('user/profile');
    }

    balances() {
        return this.get('user/balances');
    }

    positions() {
        return this.get('user/positions');
    }

    history() {
        return this.get('user/history');
    }

    gainloss() {
        return this.get('user/gainloss');
    }

    orders() {
        return this.get('user/orders');
    }
    // endregion

    // region Account Data
    accountBalances(account) {
        return this.get(`accounts/${account}/balances`);
    }

    accountPositions(account) {
        return this.get(`accounts/${account}/positions`);
    }

    accountHistory(account) {
        return this.get(`accounts/${account}/history`);
    }

    accountGainloss(account) {
        return this.get(`accounts/${account}/gainloss`);
    }

    accountOrders(account) {
        return this.get(`accounts/${account}/orders`);
    }

    accountOrder(account, order) {
        return this.get(`accounts/${account}/orders/${order}`);
    }
    // endregion

    // region Trading
    createOrder(account, data) {
        return this.post(`accounts/${account}/orders`, data);
    }

    previewOrder(account, data) {
        return this.post(`accounts/${account}/orders`, { preview: true, ...data });
    }

    changeOrder(account, order, data) {
        return this.put(`accounts/${account}/orders/${order}`, data);
    }

    cancelOrder(account, order) {
        return this.delete(`accounts/${account}/orders/${order}`);
    }
    // endregion

    // region Market Data
    quote(symbols) {
        return this.get('markets/quotes', { symbols: ensureArray(symbols).join(',') });
    }

    timesales(symbol, interval, start, end, session_filter) {
        return this.get('markets/timesales', {
            symbol, interval, start, end, session_filter,
        });
    }

    options(symbol, expiration) {
        return this.get('markets/options/chains', { symbol, expiration });
    }
    // endregion
}

module.exports = Tradier;
