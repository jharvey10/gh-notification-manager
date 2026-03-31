import { graphql } from '@octokit/graphql'
import { loadToken } from '../auth.js'

let graphqlClient = null

function getGraphql() {
  if (!graphqlClient) {
    const token = loadToken()
    if (!token) {
      throw new Error('No GitHub token configured')
    }
    graphqlClient = graphql.defaults({ headers: { authorization: `token ${token}` } })
  }
  return graphqlClient
}

function resetClients() {
  graphqlClient = null
}

export { getGraphql, resetClients }
