// Import necessary modules and functions
import { getTodoById, updateTodo } from '../../dataLayer/todosAccess.mjs'; // Functions to retrieve and update todo items
import { getUploadUrl, buildS3Url } from '../../fileStorage/attachmentUtils.mjs'; // Functions for managing file uploads in S3
import { getUserId, apiResponseSucess, apiResponseError } from '../utils.mjs'; // Utilities for handling user sessions and API responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics for monitoring performance
import { createLogger } from '../../utils/logger.mjs'; // Logger to track events

// Set up logging with a unique function tag
const logger = createLogger('generateUploadUrl');

// Main handler function for generating an upload URL for a todo item
export async function handler(event) {
    const startTime = Date.now(); // Record start time for measuring latency
    const userId = getUserId(event); // Retrieve user ID from the event
    const todoId = event.pathParameters.todoId; // Extract todoId from path parameters

    try {
        logger.info('Generating upload URL for Todo.', { todoId, userId });

        // Fetch and validate the specified todo item
        const todoInfo = await getTodoById(userId, todoId);
        if (!todoInfo) {
            return apiResponseError(404, { error: 'Todo does not exist' }); // Return 404 if todo not found
        }

        // Generate the upload URL for the todo item
        const uploadUrl = await getUploadUrl(todoId);
        logger.info('Upload URL generated.', { uploadUrl });

        // Build S3 URL for storing attachments and update the todo item
        const attachmentUrl = buildS3Url(todoId);
        await updateTodo({ todoId, userId }, { attachmentUrl });

        // Log metrics for the request
        await requestLatencyMetric('generateUploadUrl', Date.now() - startTime);
        await requestSuccessMetric('generateUploadUrl', 1);

        // Return a successful response containing the generated upload URL
        return apiResponseSucess(200, { uploadUrl });

    } catch (error) {
        // Log and return error response
        logger.error('Error generating upload URL:', { message: error.message, error });
        await requestSuccessMetric('generateUploadUrl', 0); // Log failure metric
        return apiResponseError(500, {
            error: error.message || 'Internal server error'
        });
    }
}
