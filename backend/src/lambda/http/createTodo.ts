import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../busniessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    logger.info('newTodo', newTodo)
    const authorization = event.headers.Authorization
    logger.info('authorization', authorization)
    const splits = authorization.split(' ')
    const jwtToken = splits[1]

    if (
      !authorization ||
      splits[0].toLocaleLowerCase() !== 'bearer' ||
      !jwtToken.length
    ) {
      return {
        statusCode: 400,
        body: 'Invalid authorization token'
      }
    }

    const newItem = await createTodo(newTodo, jwtToken)
    logger.info('new todo created', newItem)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
