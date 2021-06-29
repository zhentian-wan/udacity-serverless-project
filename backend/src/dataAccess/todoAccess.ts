import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexTable = process.env.INDEX_TABLE
  ) {}

  async appendTodoUrl(
    userId: string,
    todoId: string,
    url: string
  ): Promise<any> {
    return await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'SET #attachmentUrl= :url',
        ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl'
        },
        ExpressionAttributeValues: {
          ':url': url
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.indexTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
        ScanIndexForward: false
      })
      .promise()
    const items = result.Items
    return items as TodoItem[]
  }

  async getTodoById(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
    return result.Item as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
    return todo
  }

  async deleteTodo(userId: string, todoId: string): Promise<string> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { todoId, userId }
      })
      .promise()
    return todoId
  }

  async updateTodo(
    userId: string,
    todoId: string,
    updateTodo: UpdateTodoRequest
  ): Promise<any> {
    const { name, dueDate, done } = updateTodo
    return this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'SET #name= :name, #dueDate= :dueDate, #done= :done',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        },
        ExpressionAttributeValues: {
          ':name': name,
          ':done': done,
          ':dueDate': dueDate
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()
  }
}
