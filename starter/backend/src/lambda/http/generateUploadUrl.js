import { getTodoById, updateTodo } from '../../dataLayer/todosAccess.mjs'
import { getUploadUrl, buildS3Url } from '../../fileStorage/attachmentUtils.mjs'
import { getUserId, apiResponseSucess, apiResponseError } from '../utils.mjs'
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'
import { createLogger } from '../../utils/logger.mjs'

const fTAG = 'generateUploadUrl'
const logger = createLogger(fTAG)
export async function handler(event) {
  const startTime = Date.now()
  let resCode = 500
  try {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    logger.info('Handling the generated URL.', { todoId, userId })

    const todoInfo = await getTodoById(userId, todoId)
    if (!todoInfo) {
      resCode = 404
      throw 'Todo does not exist'
    }
    const uploadUrl = await getUploadUrl(todoId)
    logger.info('URL generated.', { uploadUrl })
    const buildImageUrl = buildS3Url(todoId)
    await updateTodo({ todoId, userId }, { attachmentUrl: buildImageUrl })
    await requestLatencyMetric(fTAG, Date.now() - startTime)
    await requestSuccessMetric(fTAG, 1)
    return apiResponseSucess(200, { uploadUrl })
  } catch (error) {
    logger.error(error.message, error)
    await requestSuccessMetric(fTAG, 0)
    return apiResponseError(resCode, {
      error: error.message || 'Internal server error'
     })
  }
}

