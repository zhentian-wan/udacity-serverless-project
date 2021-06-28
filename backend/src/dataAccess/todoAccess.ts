import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodos(): Promise<TodoItem[]> {
    createLogger('getAllTodos')
    const result = await this.docClient
      .scan({
        TableName: this.todosTable
      })
      .promise()
    const items = result.Items
    createLogger('getAllTodos: ' + JSON.stringify(items))
    return items as TodoItem[]
  }

  async getTodoById(todoId: string): Promise<TodoItem> {
    createLogger('getTodoById')
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId: todoId
        }
      })
      .promise()
    createLogger('getTodoById:' + JSON.stringify(result.Item))
    return result.Item as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    createLogger('createTodo')
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
    createLogger('createTodo:' + JSON.stringify(todo))
    return todo
  }

  async deleteTodo(todoId: string): Promise<string> {
    createLogger('deleteTodo')
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { todoId }
      })
      .promise()
    createLogger('deleteTodo:' + todoId)
    return todoId
  }

  async updateTodo(
    todoId: string,
    updateTodo: UpdateTodoRequest
  ): Promise<any> {
    createLogger('updateTodo')
    const { name, dueDate, done } = updateTodo
    return this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId: todoId
        },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'SET #N= :todoName, dueDate= :dueDate, done= :done',
        ExpressionAttributeNames: {
          '#N': 'name'
        },
        ExpressionAttributeValues: {
          ':todoName': name,
          ':done': done,
          ':dueDate': dueDate
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()
  }
}
