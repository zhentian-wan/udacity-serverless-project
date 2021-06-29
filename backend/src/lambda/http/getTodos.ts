import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getAllTodos } from '../../busniessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const todos = await getAllTodos(userId)
    logger.info('get all todos', todos)
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(cors({ credentials: true }))
