import React from 'react';

import Repository from './Repository';
import LinkTargetBlank from './LinkTargetBlank';

function Organization({ organization, errors, fetchMoreIssues, isFetching, onStarRepository }) {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong:</strong>
        { errors.map(err => err.message).join(' ') }
      </p>
    );
  } else if (!organization) {
    return (
      <p>No information yet...</p>
    );
  }
  return (
    <div>
      <pre>{JSON.stringify(organization, null, 2)}</pre>
      <p>
        <strong>Issues from Organization: </strong>
        <LinkTargetBlank url={organization.url} title={organization.name} />
      </p>
      <Repository repository={organization.repository} fetchMoreIssues={fetchMoreIssues}
        isFetching={isFetching} onStarRepository={onStarRepository} />  
    </div>
  );
}

export default Organization;