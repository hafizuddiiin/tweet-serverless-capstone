import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import * as uuid from 'uuid'
import { attachImage } from '../../businessLogic/tweets'
import { parseUserId } from "../../auth/utils"
import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const logger = createLogger('generateUploadUrl')

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('generate upload url', event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const tweetId = event.pathParameters.tweetId
  const imageId = uuid.v4()
  console.log('tweetId: ', tweetId)

  attachImage(
    tweetId,
    userId,
    `https://${bucketName}.s3.amazonaws.com/${imageId}`
  )

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration,
  });

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl,
    }),
  };
}).use(cors({ credentials: true }))
