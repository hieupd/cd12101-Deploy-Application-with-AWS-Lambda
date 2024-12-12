import { getTodoById, updateTodo } from '../../dataLayer/todosAccess.mjs'
import { getUserId, apiResponseSucess, apiResponseError } from '../utils.mjs'
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'
import { createLogger } from '../../utils/logger.mjs'
const fTAG = 'updateTodo'
const logger = createLogger(fTAG)
export async function handler(event) {
  const startTime = Date.now()
  let resCode = 500
  try {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const updatedTodo = JSON.parse(event.body)
    logger.info('Handling update Todos', { todoId, userId, ...updatedTodo })
    const todoInfo = await getTodoById(userId, todoId)
    if (!todoInfo) {
      resCode = 404
      throw 'Todo does not exist'
    }
  
    await updateTodo({ todoId, userId }, updatedTodo);
    await requestLatencyMetric(fTAG, Date.now() - startTime)
    await requestSuccessMetric(fTAG, 1)
    return apiResponseSucess(200, { success: true })
  } catch (error) {
    logger.error(error.message, error)
    await requestSuccessMetric(fTAG, 0)
    return apiResponseError(resCode, {
      error: error.message || 'Internal server error'
    })
  }
}