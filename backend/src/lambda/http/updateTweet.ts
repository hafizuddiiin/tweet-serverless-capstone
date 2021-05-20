import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { parseUserId } from "../../auth/utils"
import { UpdateTweetRequest } from '../../requests/UpdateTweetRequest'
import { updateTweet } from '../../businessLogic/tweets'

import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('processing update todo: ', event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTweetRequest = JSON.parse(event.body)

  await updateTweet(todoId, updatedTodo, userId)

  return {
      statusCode: 204,
      body: 'todo updated successfully',
  }
}).use(cors({ credentials: true }))