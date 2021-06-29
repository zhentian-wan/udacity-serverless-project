import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'
import { TodoAccess } from '../dataAccess/todoAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId)
}

export async function getTodoById(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  return await todoAccess.getTodoById(userId, todoId)
}

export async function isTodoExist(
  userId: string,
  todoId: string
): Promise<boolean> {
  return !!(await todoAccess.getTodoById(userId, todoId))
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
) {
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
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

export async function deleteTodo(userId: string, todoId: string) {
  await todoAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodo: UpdateTodoRequest
) {
  return todoAccess.updateTodo(userId, todoId, updateTodo)
}

export async function appendTodoUrl(
  userId: string,
  todoId: string,
  url: string
) {
  return todoAccess.appendTodoUrl(userId, todoId, url)
}
