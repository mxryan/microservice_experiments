import React from 'react';

const CommentList = ({comments}) => {

    const renderedComments = comments.map(comment => {
        let content = "uhohwhoopsie";

        if (comment.status === 'approved') {
            content = comment.content;
        } else if (comment.status === 'pending') {
            content = "Awaiting moderation";
        } else if (comment.status === 'rejected') {
            content = "This comment has been removed."
        }

        return <li key={comment.id}>{content}</li>
    })

    return <ul>{renderedComments}</ul>
}

export default CommentList;