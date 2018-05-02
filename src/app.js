import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Organization from './components/Organization';

const axiosGithubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`
  }
});

/* Pass variables by function arguments */
// const getIssuesFromOrgRepoQuery = (organization, repository) => `
// {
//   organization(login: "${organization}") {
//     name
//     url
//     repository(name: "${repository}") {
//       name
//       url
//       issues(last: 5) {
//         edges {
//           node {
//             id
//             title
//             createdAt
//             url
//           }
//         }
//       }
//     }
//   }
// }
// `;

/* Pass variables via the graphQL way */
const GET_ISSUES_OF_ORG_REPO = `
query ($organization: String!, $repository: String!, $endCursor: String){
  organization(login: $organization) {
    name
    url
    repository(name: $repository) {
      id
      name
      url
      viewerHasStarred
      stargazers {
        totalCount
      }
      issues(first: 5, states:[OPEN], after: $endCursor) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            title
            createdAt
            url
            reactions(last: 3) {
              totalCount
              edges {
                node {
                  id
                  content
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

const ADD_STAR_REPO = `
mutation ($repositoryId,: ID!) {
  addStar(input: { starrableId: $repositoryId }) {
    starrable {
      id
      viewerHasStarred
    }
  }
}
`;

const REMOVE_STAR_REPO = `
mutation ($repositoryId: ID!) {
  removeStar(input: { starrableId: $repositoryId }) {
    starrable {
      id
      viewerHasStarred
    }
  }
}
`;

const resolveIssuesQuery = (result, cursor) => (state) => {
  const { data, errors } = result.data;
  const organization = data ? data.organization : null;

  if (!cursor) {
    return {
      organization: organization,
      errors: result.data.errors
    }
  } else if (errors) {
    return { errors };
  }

  const { edges: oldIssues } = state.organization.repository.issues;
  const { edges: newIssues } = organization.repository.issues
  const updatedIssues = [...oldIssues, ...newIssues];

  return {
    organization: {
      ...organization,
      repository: {
        ...organization.repository,
        issues: {
          ...organization.repository.issues,
          edges: updatedIssues
        }
      }
    },
    errors
  };
}

const resolveAddStarMutation = (result) => (state) => {
  const { data, errors } = result.data;
  console.log(result)

  if (errors) {
    return { errors };
  }

  const { viewerHasStarred } = data.addStar.starrable;
  const { totalCount } = state.organization.repository.stargazers;
  return {
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalCount + 1
        }
      }
    }
  };
}

const resolveRemoveStarMutation = (result) => (state) => {
  console.log(result)
  const { data, errors } = result.data;

  if (errors) {
    return { errors };
  }

  const { viewerHasStarred } = data.removeStar.starrable;
  const { totalCount } = state.organization.repository.stargazers;
  return {
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalCount - 1
        }
      }
    }
  }
}

class App extends Component {
  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null,
    isFetching: false,
    isStarring: false
  };

  fetchFromGithub = (path, endCursor) => {
    const [organization, repository] = path.split('/');
    this.setState({ isFetching: true });

    axiosGithubGraphQL
      .post('', { 
        query: GET_ISSUES_OF_ORG_REPO,
        variables: { organization, repository, endCursor }
      })
      .then(result => {
        this.setState({ isFetching: false });
        console.log(result);
        this.setState(resolveIssuesQuery(result, endCursor)(this.state));
      });
  }

  fetchMoreIssues = () => {
    const { endCursor } = this.state.organization.repository.issues.pageInfo;
    this.fetchFromGithub(this.state.path, endCursor)
  }

  addStarToRepository = (repositoryId) => {
    axiosGithubGraphQL.post('', {
      query: ADD_STAR_REPO,
      variables: { repositoryId }
    })
    .then(result =>{
      this.setState(resolveAddStarMutation(result)(this.state));
    });
  }

  removeStarFromRepository = (repositoryId) => {
    axiosGithubGraphQL.post('', {
      query: REMOVE_STAR_REPO,
      variables: { repositoryId }
    })
    .then(result => {
      this.setState(resolveRemoveStarMutation(result)(this.state));
    });
  }

  onStarRepository = (repositoryId, viewerHasStarred) => {
    viewerHasStarred ? this.removeStarFromRepository(repositoryId)
      : this.addStarToRepository(repositoryId);
  }

  componentDidMount() {
    // fetch data
    this.fetchFromGithub(this.state.path);
  }

  onChange = event => {
    this.setState({ path: event.target.value });
  };

  onSubmit = event => {
    event.preventDefault();
    this.fetchFromGithub(this.state.path, undefined);
  };
  
  render() {
    const title = 'React GraphQL Github Client';
    const { path, organization, errors } = this.state;

    return(
      <div>
        <h1>{title}</h1>

        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">Show open issues for https://github.com/</label>
          <input type="text" id="url" onChange={this.onChange} value={path} 
            style={{ width: '300px'}} />
          <button type="submit">Search</button>
        </form>

        <hr />

        <Organization organization={organization} errors={errors}
          fetchMoreIssues={this.fetchMoreIssues} isFetching={this.state.isFetching}
          onStarRepository={this.onStarRepository} />
        
      </div>
    );
  }
}

export default App;
