import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getAllTweets } from '../../businessLogic/tweets'
import { parseUserId } from "../../auth/utils"
import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const logger = createLogger('getTweets')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('processing get tweets: ', event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  const items = await getAllTweets(userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items,
    })
  }
}).use(cors({ credentials: true }))
