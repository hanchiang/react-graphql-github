import React from 'react';
import LinkTargetBlank from './LinkTargetBlank';

import ReactionsList from './ReactionsList';

function Issues({ issues }) {
  return (
    <ul>
      { issues.edges.map(issue => (
        <li key={issue.node.id}>
          <LinkTargetBlank url={issue.node.url} title={issue.node.title} />
          <ReactionsList reactions={issue.node.reactions} />
        </li>
      ))}
    </ul>
  );
}

export default Issues;