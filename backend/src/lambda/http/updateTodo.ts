import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { updateTodo } from '../../busniessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info('todoId', todoId)
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    logger.info('updatedTodo', updatedTodo)
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid todoId'
        })
      }
    }

    return updateTodo(todoId, updatedTodo)
      .then((updated) => {
        return {
          statusCode: 200,
          body: JSON.stringify({
            item: updated
          })
        }
      })
      .catch((err) => {
        return {
          statusCode: err.statusCode,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            message: JSON.stringify(err)
          })
        }
      })
  }
)
handler.use(cors({ credentials: true }))
