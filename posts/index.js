const express = require('express');
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());
console.log("bodyparser=", bodyParser)

const posts = {}

app.get("/posts", (req, res) => {
    console.log("GET /posts")
    res.send(posts);
});

app.post("/posts", async (req, res) => {
    console.log("POST /posts")
    const id = randomBytes(4).toString('hex');
    const {title} = req.body;
    posts[id] = {title, id};
    console.log("new post: ", JSON.stringify(posts[id], null, 2));
    console.log("Sending PostCreated to event bus");
    try {
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'PostCreated',
            data: {
                id, title
            }
        })
    } catch (e) {
        console.error(e);
    }
    res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
    console.log("POST /events")
    console.log("new event of type: ", req.body.type);
    res.send({});
})

app.listen(4000, () => {
    console.log("v55");
    console.log("posts listening on 4000")
})