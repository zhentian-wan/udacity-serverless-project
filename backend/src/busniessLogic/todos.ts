import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'
import { TodoAccess } from '../dataAccess/todoAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const todoAccess = new TodoAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
  return todoAccess.getAllTodos()
}

export async function getTodoById(todoId: string): Promise<TodoItem> {
  return await todoAccess.getTodoById(todoId)
}

export async function isTodoExist(todoId: string): Promise<boolean> {
  return !!(await todoAccess.getTodoById(todoId))
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
) {
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  createLogger('userId:' + userId)
  const newTodo: TodoItem = {
    todoId: todoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  }
  return await todoAccess.createTodo(newTodo)
}

export async function deleteTodo(todoId: string) {
  await todoAccess.deleteTodo(todoId)
}

export async function updateTodo(
  todoId: string,
  updateTodo: UpdateTodoRequest
) {
  return todoAccess.updateTodo(todoId, updateTodo)
}
