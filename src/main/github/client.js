const { graphql } = require('@octokit/graphql');
const { loadToken } = require('../auth');

let graphqlClient = null;

function getGraphql() {
  if (!graphqlClient) {
    const token = loadToken();
    if (!token) throw new Error('No GitHub token configured');
    graphqlClient = graphql.defaults({ headers: { authorization: `token ${token}` } });
  }
  return graphqlClient;
}

function resetClients() {
  graphqlClient = null;
}

module.exports = { getGraphql, resetClients };
