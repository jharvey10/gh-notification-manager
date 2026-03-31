const VALIDATE_TOKEN_QUERY = `
  query ValidateToken {
    viewer {
      notificationThreads(first: 1) {
        nodes {
          id
        }
      }
    }
  }
`

export { VALIDATE_TOKEN_QUERY }
