import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('Generate URL')
const XAWS = AWSXRay.captureAWS(AWS)

logger.info('Upload Image')

// instantiate s3 from AWS-SDK:
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const s3bucket = process.env.TODOS_S3_BUCKET
const s3expiredTime = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info('todoId', todoId)
    const url = getUploadUrl(todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  }
)

handler.use(cors({ credentials: true }))

const getUploadUrl = (todoId: string) => {
  return s3.getSignedUrl('putObject', {
    Bucket: s3bucket,
    Key: todoId,
    Expires: +s3expiredTime
  })
}
