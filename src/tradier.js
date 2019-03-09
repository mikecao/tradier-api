const querystring = require('querystring');
const axios = require('axios');
const ensureArray = require('ensure-array');

const URLS = {
    prod: 'https://api.tradier.com/v1/',
    beta: 'https://api.tradier.com/beta/',
    sandbox: 'https://sandbox.tradier.com/v1/',
    stream: 'https://stream.tradier.com/v1',
};

function parseSymbols(symbols) {
    return ensureArray(symbols).join(',');
}

function parseQuery(url, params) {
    const query =
        params &&
        querystring.stringify(
            Object.keys(params).reduce((values, key) => {
                if (params[key] !== undefined) {
                    values[key] = params[key];
                }
                return values;
            }, {})
        );
    return query ? `${url}?${query}` : url;
}

class Tradier {
    constructor(accessToken, endpoint = 'sandbox') {
        this.accessToken = accessToken;
        this.endpoint = endpoint;
    }

    // region HTTP
    config() {
        return {
            baseURL: URLS[this.endpoint],
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                Accept: 'application/json',
            },
        };
    }

    get(url, params, config = {}) {
        return axios.request({
            method: 'get',
            url: parseQuery(url, params),
            ...this.config(),
            ...config,
        });
    }

    post(url, data, config = {}) {
        return axios.request({
            method: 'post',
            url,
            data: querystring.stringify(data),
            ...this.config(),
            ...config,
        });
    }

    put(url, data, config = {}) {
        return axios.request({
            method: 'put',
            url,
            data,
            ...this.config(),
            ...config,
        });
    }

    delete(url, config = {}) {
        return axios.request({
            method: 'delete',
            url,
            ...this.config(),
            ...config,
        });
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
        return this.post(`accounts/${account}/orders`, {
            preview: true,
            ...data,
        });
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
        return this.get('markets/quotes', {
            symbols: ensureArray(symbols).join(','),
        });
    }

    timesales(symbol, interval, start, end, session_filter) {
        return this.get('markets/timesales', {
            symbol,
            interval,
            start,
            end,
            session_filter,
        });
    }

    optionsChains(symbol, expiration) {
        return this.get('markets/options/chains', { symbol, expiration });
    }

    optionsStrikes(symbol, expiration) {
        return this.get('markets/options/strikes', { symbol, expiration });
    }

    optionsExpirations(symbol, includeAllRoots) {
        return this.get('markets/options/expirations', {
            symbol,
            includeAllRoots,
        });
    }

    quoteHistory(symbol, interval, start, end) {
        return this.get('markets/history', {
            symbol,
            interval,
            start,
            end,
        });
    }

    clock() {
        return this.get('markets/clock');
    }

    calendar(market, year) {
        return this.get('markets/calendar', { market, year });
    }

    search(q, indexes = true) {
        return this.get('markets/search', { q, indexes });
    }

    lookup(q, exchanges, types) {
        return this.get('markets/lookup', { q, exchanges, types });
    }

    // region Fundamentals (BETA)
    company(symbols) {
        return this.get(
            'markets/fundamentals/company',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        );
    }

    calendars(symbols) {
        return this.get(
            'markets/fundamentals/calendars',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        );
    }

    dividends(symbols) {
        return this.get(
            'markets/fundamentals/dividends',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        );
    }

    corporateActions(symbols) {
        return this.get(
            'markets/fundamentals/corporate_actions',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        );
    }

    ratios(symbols) {
        return this.get(
            'markets/fundamentals/ratios',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        );
    }

    financials(symbols) {
        return this.get(
            'markets/fundamentals/financials',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        );
    }

    statistics(symbols) {
        return this.get(
            'markets/fundamentals/statistics',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        );
    }
    // endregion

    // region Watchlists
    watchlists() {
        return this.get('/watchlists');
    }

    watchlist(id) {
        return this.get(`/watchlists/${id}`);
    }

    createWatchlist(name, symbols) {
        return this.post('/watchlists', {
            name,
            symbols: parseSymbols(symbols),
        });
    }

    updateWatchlist(id, name, symbols) {
        return this.put(`/watchlists/${id}`, {
            name,
            symbols: parseSymbols(symbols),
        });
    }

    deleteWatchlist(id) {
        return this.delete(`/watchlists/${id}`);
    }

    addSymbols(id, symbols) {
        return this.post(`/watchlists/${id}/symbols`, {
            symbols: parseSymbols(symbols),
        });
    }

    removeSymbols(id, symbol) {
        return this.delete(`/watchlists/${id}/symbols/${symbol}`);
    }
    // endregion

    // region Streaming
    createSession() {
        return this.post('markets/events/session');
    }

    events(sessionid, symbols, filter, linebreak) {
        return this.post(
            'markets/events',
            {
                sessionid,
                symbols: parseSymbols(symbols),
                filter,
                linebreak,
            },
            { baseURL: URLS.stream }
        );
    }
    // endregion
}

module.exports = Tradier;
