import React from 'react';

import Issues from './Issues';
import LinkTargetBlank from './LinkTargetBlank';

function Repository({ repository, fetchMoreIssues, isFetching, onStarRepository }) {
  const { viewerHasStarred } = repository;

  function handleStarRepository(e) {
    onStarRepository(repository.id, viewerHasStarred);
  }

  return (
    <div>
      <p>
        <strong>In repository: </strong>
        <LinkTargetBlank url={repository.url} title={repository.name} />
      </p>

      <button type="button" onClick={handleStarRepository}>
        {viewerHasStarred ? 'Unstar' : 'Star'}{' '}
        {repository.stargazers.totalCount}
      </button>

      <Issues issues={repository.issues} />

      <hr />

      {
        repository.issues.pageInfo.hasNextPage && (
          isFetching ? (<button onClick={fetchMoreIssues} disabled>More</button>)
            : (<button onClick={fetchMoreIssues}>More</button>)
        )
      }
      
    </div>
  );
}

export default Repository;