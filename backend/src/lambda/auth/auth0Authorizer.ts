import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import Axios from 'axios'
import { decode, verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwt } from '../../auth/Jwt'

const logger = createLogger('auth')
const jwksUrl = 'https://dev-w7mouh1c.eu.auth0.com/.well-known/jwks.json'
// You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
// Go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  logger.info('token:' + JSON.stringify(token))
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  if (!jwt) {
    logger.error('Invalid token')
    throw new Error('401 error invalid token')
  }
  logger.info('jwt:' + JSON.stringify(jwt))
  const data = await Axios.get(jwksUrl).then((res) => {
    return res.data
  })
  const signingKey = data['keys'].find(
    (key) => key['kid'] === jwt['header']['kid']
  )
  logger.info('signingKey:' + JSON.stringify(signingKey))
  if (!signingKey) {
    throw new Error('Invalid Signing key')
  }
  return verify(token, certToPEM(signingKey['x5c'][0]), {
    algorithms: ['RS256']
  }) as JwtPayload
}

function certToPEM(cert) {
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  logger.info('cert', cert)
  return cert
}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
