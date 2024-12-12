import { parseUserId } from '../auth/utils.mjs'

export function getUserId(event) {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

export function apiResponseSucess(code = 200, data = {}) {
  const resData = {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  }
  return resData
}
export function apiResponseError(code = 500, data = { error: 'Internal server error'}) {
  const resData = {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  }
  return resData
}
