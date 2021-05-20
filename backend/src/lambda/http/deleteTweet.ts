import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { parseUserId } from "../../auth/utils"
import { deleteTweet } from '../../businessLogic/tweets'
import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const logger = createLogger('deleteTweet')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('processing delete tweet', event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  const tweetId = event.pathParameters.tweetId

  await deleteTweet(tweetId, userId)
  
  return {
    statusCode: 204,
    body: 'tweet deleted successfully',
  }
}).use(cors({ credentials: true }))