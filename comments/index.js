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
    comments.push({id: commentId, content, status: 'pending'})
    commentsByPostId[req.params.id] = comments;

    await axios.post("http://localhost:4005/events",{
        type: "CommentCreated",
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        }
    }).catch(err => {console.error(err)});
    res.status(201).send(comments);

});

app.post("/events", async (req, res) => {
    console.log("have an event for you: ", req.body.type);
    const {type, data} = req.body;

    if  (type === "CommentModerated") {
        console.log("we got a comment moderated event!")
        const {postId, id, status, content} = data;
        console.log("postId from commentModerated event: ", postId);
        console.log("all our post ids we have: ", Object.keys(commentsByPostId).join(", "));
        console.log("commentsByPostId: ", JSON.stringify(commentsByPostId, null, 2))
        const comments = commentsByPostId[postId];
        const comment = comments.find(com => {
            return com.id === id;
        });
        if (!comment) {
            console.log("uh oh couldnt find the comment. ");
            console.log(`looking with id: ${id}`);
            console.log("all comment ids: ", comments.map(com=>com.id).join(", "))
        }
        comment.status = status;
        try {

        await axios.post("http://localhost:4005/events", {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        }).catch(err => {console.error(err)});
        } catch (someError) {
            console.error("WE GOT AN ERROR...", someError);
        }
    }
    res.send({});
})

app.listen(4001, () => {
    console.log("hello im listening on 4001")
})