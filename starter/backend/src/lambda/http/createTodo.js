import { createTodo } from '../../dataLayer/todosAccess.mjs'
import { getUserId, apiResponseSucess, apiResponseError } from '../utils.mjs'
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'
import { v4 } from 'uuid'
import { createLogger } from '../../utils/logger.mjs'

const fTAG = 'createTodo'
const logger = createLogger(fTAG)
export async function handler(event) {
  const startTime = Date.now()
  let resCode = 500
  try {
    const userId = getUserId(event)
    const newTodo = JSON.parse(event.body)
    const itemId = v4()
    const newItem = {
      todoId: itemId,
      userId,
      createdAt: new Date().toISOString(),
      attachmentUrl: '',
      done: false,
      ...newTodo
    }
    logger.info('Handling create new Todo.', { newItem })
    await createTodo(newItem)
    await requestLatencyMetric(fTAG, Date.now() - startTime)
    await requestSuccessMetric(fTAG, 1)
    return apiResponseSucess(200, { item: newItem })
  } catch (error) {
    logger.error(error.message, error)
    await requestSuccessMetric(fTAG, 0)
    return apiResponseError(resCode, {
      error: error.message || 'Internal server error'
    })
  }
}

