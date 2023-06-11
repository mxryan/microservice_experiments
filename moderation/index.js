const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post("/events", async (req, res) => {
    console.log("POST /events")
    const {type, data} = req.body;

    if (type === 'CommentCreated') {
        let status;
        if (data.content.includes('orange')) {
            console.log("Rejecting new comment");
            status = 'rejected';
        } else {
            console.log("Approving new comment")
            status = 'approved';
        }
        try {
            console.log("Emitting CommentModerated Event")
            await axios.post('http://event-bus-srv:4005/events', {
                type: 'CommentModerated',
                data: {
                    id: data.id,
                    postId: data.postId,
                    status,
                    content: data.content
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
    res.send({});
})

app.listen(4003, () => {
    console.log("moderation service listening on 4003");
})