import { graphql } from '@octokit/graphql'
import { Octokit } from '@octokit/rest'
import { loadToken } from '../auth.js'

let graphqlClient: ReturnType<(typeof graphql)['defaults']> | null = null
let restClient: Octokit | null = null

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

function getRest() {
  if (!restClient) {
    const token = loadToken()
    if (!token) {
      throw new Error('No GitHub token configured')
    }
    restClient = new Octokit({ auth: token })
  }
  return restClient
}

function resetClients() {
  graphqlClient = null
  restClient = null
}

export { getGraphql, getRest, resetClients }
