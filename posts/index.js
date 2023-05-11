const express = require('express');
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());
console.log("bodyparser=", bodyParser)

const posts = {

}

app.get("/posts", (req, res) => {
    console.log("get")
    res.send(posts);
});

app.post("/posts", async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const {title} = req.body;
    posts[id] = {title, id};
    console.log("posts", JSON.stringify(posts, null ,2));

    await axios.post('http://localhost:4005/events', {
        type: 'PostCreated',
        data: {
            id, title
        }
    })
    res.status(201).send(posts[id]);

});

app.post("/events", (req, res) => {
    console.log("have an event for you: ", req.body.type);
    res.send({});
})

app.listen(4000, () => {
    console.log("hello im listening on 4000")
})