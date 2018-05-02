import React from 'react';

function ReactionsList({ reactions }) {
  return (
    <ul>
      {
        reactions.edges.map(reaction => (
          <li key={reaction.node.id}>{reaction.node.content}</li>
        ))
      }
      
    </ul>
  );
}

export default ReactionsList;