import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../busniessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info('todoId', todoId)
    // TODO: Remove a TODO item by id
    await deleteTodo(todoId)
    logger.info('todo deleted')
    return {
      statusCode: 204,
      body: 'Sucessfully deleted!'
    }
  }
)

handler.use(cors({ credentials: true }))
