import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { parseUserId } from "../../auth/utils"
import { CreateTweetRequest } from '../../requests/CreateTweetRequest'
import { createTweet } from '../../businessLogic/tweets'
import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const logger = createLogger('createTweet')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => { 
  logger.info('processing create tweet', event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  
  const newTweet: CreateTweetRequest = JSON.parse(event.body)
  const item = await createTweet(newTweet, userId)
  return {
      statusCode: 201,
      body: JSON.stringify({
          item,
      }),
  }
}).use(cors({ credentials: true }))
