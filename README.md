# tradier-api
Node.js library for the Tradier API

## API Documentation

The REST API documentation can be found at https://developer.tradier.com/documentation.

## Usage
```javascript
const Tradier = require('tradier-api');

// You will need to get an access token from https://developer.tradier.com/
// Possible endpoints are prod, beta, and sandbox
const tradier = new Tradier(ACCESS_TOKEN, ENDPOINT);

tradier.getQuote('SPY')
  .then(quote => {
    console.log(`
      symbol: ${quote.symbol}
      price: ${quote.last}
      bid: ${quote.bid}
      ask: ${quote.ask}     
      volume: ${quote.volume} 
    `);
  })
  .catch(error => {
    console.log(error);
  });
```
