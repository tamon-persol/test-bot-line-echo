'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const axios = require('axios').default;

const instance = axios.create({
    baseURL: 'http://api.weatherstack.com/',
    params: {
        access_key: 'babf9100915e4f574c18c492a75086e9'
    }
});
// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

app.get('/weather', async (req, res) => {
    const {data} = await axios.get('http://api.weatherstack.com/',{
        params: {
            access_key: 'babf9100915e4f574c18c492a75086e9',
            query: 'New York'
        }
    });
    console.log(data);
    return res.send(200)
});

// event handler
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // create a echoing text message
    const echo = { type: 'text', text: 'hello from server'};

    // use reply API
    return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
