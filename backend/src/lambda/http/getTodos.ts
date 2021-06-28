import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyResult } from 'aws-lambda'
import { getAllTodos } from '../../busniessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getTodos')
export const handler = middy(async (): Promise<APIGatewayProxyResult> => {
  const todos = await getAllTodos()
  logger.info('get all todos', todos)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos
    })
  }
})

handler.use(cors({ credentials: true }))
