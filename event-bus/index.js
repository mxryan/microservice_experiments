const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const events = [];
app.post('/events', (req, res) => {
    console.log("POST /events")
    const event = req.body;
    console.log("Event: ", JSON.stringify(event, null, 2));
    events.push(event);
    console.log("Total number of events received: ", events.length);
    console.log("Relaying event to each service");
    axios.post("http://posts-clusterip-srv:4000/events", event).catch(err => {console.error(err)});
    axios.post("http://comments-srv:4001/events", event).catch(err => {console.error(err)});
    axios.post("http://query-srv:4002/events", event).catch(err => {console.error(err)});
    axios.post("http://moderation-srv:4003/events", event).catch(err => {console.error(err)});

    res.send({status: 'OK'});
});

app.get('/events', (req, res) => {
    console.log("GET /events");
    res.send(events);
});

app.listen(4005, () => {
    console.log('event-bus listening on 4005')
})