const express = require('express');
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors())
console.log("bodyparser=", bodyParser)

const commentsByPostId = {

}

app.get("/posts/:id/comments", (req, res) => {
    console.log("get")
    res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
    console.log("post")
    const commentId = randomBytes(4).toString('hex');
    const {content} = req.body;

    const comments = commentsByPostId[req.params.id] || [];
    comments.push({id: commentId, content})
    commentsByPostId[req.params.id] = comments;

    await axios.post("http://localhost:4005/events",{
        type: "CommentCreated",
        data: {
            id: commentId,
            content,
            postId: req.params.id
        }
    })
    res.status(201).send(comments);

});

app.post("/events", (req, res) => {
    console.log("have an event for you: ", req.body.type);
    res.send({});
})

app.listen(4001, () => {
    console.log("hello im listening on 4001")
})