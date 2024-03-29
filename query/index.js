const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    console.log("GET /posts");
    res.send(posts);
})

function handleEvent(type, data) {
    if (type === 'PostCreated') {
        const {id, title} = data;
        posts[id] = {id, title, comments: []};
    } else if (type === 'CommentCreated') {
        const {postId, id, content, status} = data;
        posts[postId].comments.push({id, content, status});
    } else if (type === 'CommentUpdated') {
        const {id, content, postId, status} = data;
        const post = posts[postId];
        const comment = post.comments.find(comment => comment.id === id);
        comment.status = status;
        comment.content = content;
    }
}

app.post("/events", (req, res) => {
    console.log("POST /events")
    console.log("Event received: ", req.body);
    const {type, data} = req.body;
    handleEvent(type, data);

    res.send({});
})

app.listen(4002, async () => {
    console.log("Query service listening on 4002");

    const res = await axios.get('http://event-bus-srv:4005/events');
    for (let event of res.data) {
        console.log('Processing previous event of type: ', event.type);
        handleEvent(event.type, event.data);
    }
})