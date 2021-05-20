import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

import * as middy from 'middy'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJfOQVfYt4cqrOMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1zM29idDdiZS51cy5hdXRoMC5jb20wHhcNMjEwNDE4MDc1NjAzWhcN
MzQxMjI2MDc1NjAzWjAkMSIwIAYDVQQDExlkZXYtczNvYnQ3YmUudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0zlqmFK19EboEzG0
fCdm5hWE+8OrZRBWJaXHJTdb0UV4E5tRJQz1QoH4UuzPHpbplfTsCr4ePyCtKVRa
N1DRw3GfcCPsbyQyGcCw2aU1rjQOkFCPcnI3S+sfT1Q/3qK9oRkGz/YEiXvU7Xq8
u3OvhbRj8wQCiKnxgEpeDa2wxF8vqQXt+drMEFPjaENIo0lykM474/41BWEb69BE
i+6nEvp0Ws9jkIGwEB3h/BaUxMW+cKshPYogimZDnDMdgml1eFUtm8tqzcPpZcjB
Np22B80czNPyquFQuoGgkmEscEeiGlG/Va8/KZj4HeDsI546PfMHLrOg0PNZdHUB
0dRy8QIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRBmDR1Kr3h
2pRsoBoaTaKJwjTvNzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ALmQEZ0jdtSeBh6LppEYpcEopVJs00nSEsrVPPt+DC4sPQnsCXgZPQ3c97n73e6P
gcd7/qGFS/lPdovt/axmU9sJmOrMr6m/oGFxfqQnm2eldaEntA37z8yIRCn6Mxqf
jEgh8jTChbcCn/K1Fqsy0YSYQVomi5LeK5Fw6L05Yf3fYWxIwtQR6M1IPWniz21a
L2zaFnKRyuKYqNpgmFZxBtdGK5p0naPpiFbwiSRq+7+rRj9W0iXjLQysPOFH7PZw
w9itBIVLPi95aRaxWu9uAFBAWPOMyPHkmncldjxkQZgRs5nFalAje42EUk4wKOf1
qOq0sXBRkz/6U4P7spvTT14=
-----END CERTIFICATE-----`

export const handler = middy( async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = verifyToken(event.authorizationToken)
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
})

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}