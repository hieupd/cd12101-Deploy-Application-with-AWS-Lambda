import { getTodoByUserId } from '../../dataLayer/todosAccess.mjs'
import { getUserId, apiResponseSucess, apiResponseError } from '../utils.mjs'
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'
import { createLogger } from '../../utils/logger.mjs'
const fTAG = 'getTodos'
const logger = createLogger(fTAG)
export async function handler(event) {
  const startTime = Date.now()
  let resCode = 500
  try {
    const userId = getUserId(event)
    const items = await getTodoByUserId(userId)
    await requestLatencyMetric(fTAG, Date.now() - startTime)
    await requestSuccessMetric(fTAG, 1)
    return apiResponseSucess(200, { items })
  } catch (error) {
    logger.error(error.message, error)
    await requestSuccessMetric(fTAG, 0)
    return apiResponseError(resCode, {
      error: error.message || 'Internal server error'
    })
  }
}