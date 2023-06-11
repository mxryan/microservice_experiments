const express = require('express');
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors())

const commentsByPostId = {}

app.get("/posts/:id/comments", (req, res) => {
    console.log(`GET /posts/${req.params.id}/comments`);
    res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
    console.log(`POST /posts/${req.params.id}/comments`);
    const commentId = randomBytes(4).toString('hex');
    const {content} = req.body;

    const comments = commentsByPostId[req.params.id] || [];
    comments.push({id: commentId, content, status: 'pending'})
    commentsByPostId[req.params.id] = comments;

    try {
        console.log("Emitting CommentCreated Event")
        await axios.post("http://event-bus-srv:4005/events", {
            type: "CommentCreated",
            data: {
                id: commentId,
                content,
                postId: req.params.id,
                status: 'pending'
            }
        })
    } catch (e) {
        console.error(e);
    }
    res.status(201).send(comments);

});

app.post("/events", async (req, res) => {
    console.log("New Event: ", req.body.type);
    const {type, data} = req.body;

    if (type === "CommentModerated") {
        console.log("Received a comment moderated event!")
        const {postId, id, status, content} = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find(com => {
            return com.id === id;
        });
        comment.status = status;
        try {
            console.log("Emitting CommentUpdated event");
            await axios.post("http://event-bus-srv:4005/events", {
                type: 'CommentUpdated',
                data: {
                    id,
                    status,
                    postId,
                    content
                }
            });
        } catch (someError) {
            console.error("WE GOT AN ERROR...", someError);
        }
    }
    res.send({});
})

app.listen(4001, () => {
    console.log("Comments listening on 4001");
})