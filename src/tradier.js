const axios = require('axios');
const ensureArray = require('ensure-array');
const querystring = require('querystring');

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

function parseData(data) {
    return typeof data === 'object'
        ? querystring.stringify(data)
        : querystring.parse(data);
}

class Tradier {
    constructor(accessToken, endpoint = 'prod') {
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
            data: parseData(data),
            ...this.config(),
            ...config,
        });
    }

    put(url, data, config = {}) {
        return axios.request({
            method: 'put',
            url,
            data: parseData(data),
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
    getProfile() {
        return this.get('user/profile').then(
            ({ data: { profile } }) => profile
        );
    }

    getBalances() {
        return this.get('user/balances').then(
            ({ data: { accounts } }) => accounts
        );
    }

    getPositions() {
        return this.get('user/positions').then(
            ({ data: { accounts } }) => accounts
        );
    }

    getHistory() {
        return this.get('user/history').then(
            ({ data: { accounts } }) => accounts
        );
    }

    getGainloss() {
        return this.get('user/gainloss').then(
            ({ data: { accounts } }) => accounts
        );
    }

    getOrders() {
        return this.get('user/orders').then(
            ({ data: { accounts } }) => accounts
        );
    }
    // endregion

    // region Account Data
    getAccountBalances(account) {
        return this.get(`accounts/${account}/balances`).then(
            ({ data: { balances } }) => balances
        );
    }

    getAccountPositions(account) {
        return this.get(`accounts/${account}/positions`).then(
            ({ data: { positions } }) => positions
        );
    }

    getAccountHistory(account) {
        return this.get(`accounts/${account}/history`).then(
            ({ data: { history } }) => history
        );
    }

    getAccountGainloss(account) {
        return this.get(`accounts/${account}/gainloss`).then(
            ({ data: { gainloss } }) => gainloss
        );
    }

    getAccountOrders(account) {
        return this.get(`accounts/${account}/orders`).then(
            ({ data: { orders } }) => orders
        );
    }

    getAccountOrder(account, orderId) {
        return this.get(`accounts/${account}/orders/${orderId}`).then(
            ({ data: { order } }) => order
        );
    }
    // endregion

    // region Trading
    createOrder(account, data) {
        return this.post(`accounts/${account}/orders`, data).then(
            ({ data: { order } }) => order
        );
    }

    previewOrder(account, data) {
        return this.post(`accounts/${account}/orders`, {
            ...parseData(data),
            preview: true,
        }).then(({ data: { order } }) => order);
    }

    changeOrder(account, orderId, data) {
        return this.put(`accounts/${account}/orders/${orderId}`, data).then(
            ({ data: { order } }) => order
        );
    }

    cancelOrder(account, orderId) {
        return this.delete(`accounts/${account}/orders/${orderId}`).then(
            ({ data: { order } }) => order
        );
    }
    // endregion

    // region Market Data
    getQuote(symbols) {
        return this.get('markets/quotes', {
            symbols: ensureArray(symbols).join(','),
        }).then(
            ({
                data: {
                    quotes: { quote },
                },
            }) => quote
        );
    }

    getTimesales(symbol, interval, start, end, sessionFilter) {
        return this.get('markets/timesales', {
            symbol,
            interval,
            start,
            end,
            session_filter: sessionFilter,
        }).then(({ data: { series } }) => series);
    }

    getOptionChains(symbol, expiration) {
        return this.get('markets/options/chains', { symbol, expiration }).then(
            ({ data: { options } }) => options
        );
    }

    getOptionStrikes(symbol, expiration) {
        return this.get('markets/options/strikes', { symbol, expiration }).then(
            ({ data: { strikes } }) => strikes
        );
    }

    getOptionExpirations(symbol, includeAllRoots) {
        return this.get('markets/options/expirations', {
            symbol,
            includeAllRoots,
        }).then(({ data: { expirations } }) => expirations);
    }

    getPriceHistory(symbol, interval, start, end) {
        return this.get('markets/history', {
            symbol,
            interval,
            start,
            end,
        }).then(({ data: { history } }) => history);
    }

    getClock() {
        return this.get('markets/clock').then(({ data: { clock } }) => clock);
    }

    getCalendar(market, year) {
        return this.get('markets/calendar', { market, year }).then(
            ({ data: { calendar } }) => calendar
        );
    }

    search(q, indexes = true) {
        return this.get('markets/search', { q, indexes }).then(
            ({ data: { securities } }) => securities
        );
    }

    lookup(q, exchanges, types) {
        return this.get('markets/lookup', { q, exchanges, types }).then(
            ({ data: { securities } }) => securities
        );
    }

    // region Fundamentals (BETA)
    getCompany(symbols) {
        return this.get(
            'markets/fundamentals/company',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        ).then(({ data: { items } }) => items);
    }

    getCalendars(symbols) {
        return this.get(
            'markets/fundamentals/calendars',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        ).then(({ data: { items } }) => items);
    }

    getDividends(symbols) {
        return this.get(
            'markets/fundamentals/dividends',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        ).then(({ data: { items } }) => items);
    }

    getCorporateActions(symbols) {
        return this.get(
            'markets/fundamentals/corporate_actions',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        ).then(({ data: { items } }) => items);
    }

    getRatios(symbols) {
        return this.get(
            'markets/fundamentals/ratios',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        ).then(({ data: { items } }) => items);
    }

    getFinancials(symbols) {
        return this.get(
            'markets/fundamentals/financials',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        ).then(({ data: { items } }) => items);
    }

    getStatistics(symbols) {
        return this.get(
            'markets/fundamentals/statistics',
            { symbols: parseSymbols(symbols) },
            { baseURL: URLS.beta }
        ).then(({ data: { items } }) => items);
    }
    // endregion

    // region Watchlists
    getWatchlists() {
        return this.get('/watchlists').then(
            ({ data: { watchlists } }) => watchlists
        );
    }

    getWatchlist(id) {
        return this.get(`/watchlists/${id}`).then(
            ({ data: { watchlist } }) => watchlist
        );
    }

    createWatchlist(name, symbols) {
        return this.post('/watchlists', {
            name,
            symbols: parseSymbols(symbols),
        }).then(({ data: { watchlist } }) => watchlist);
    }

    updateWatchlist(id, name, symbols) {
        return this.put(`/watchlists/${id}`, {
            name,
            symbols: parseSymbols(symbols),
        }).then(({ data: { watchlist } }) => watchlist);
    }

    deleteWatchlist(id) {
        return this.delete(`/watchlists/${id}`).then(
            ({ data: { watchlists } }) => watchlists
        );
    }

    addSymbols(id, symbols) {
        return this.post(`/watchlists/${id}/symbols`, {
            symbols: parseSymbols(symbols),
        }).then(({ data: { watchlist } }) => watchlist);
    }

    removeSymbols(id, symbol) {
        return this.delete(`/watchlists/${id}/symbols/${symbol}`).then(
            ({ data: { watchlist } }) => watchlist
        );
    }
    // endregion

    // region Streaming
    createSession() {
        return this.post('markets/events/session');
    }

    getEvents(sessionid, symbols, filter, linebreak) {
        return this.post(
            'markets/events',
            {
                sessionid,
                symbols: parseSymbols(symbols),
                filter,
                linebreak,
            },
            { baseURL: URLS.stream }
        ).then(({ data: { data } }) => data);
    }
    // endregion
}

module.exports = Tradier;
