// Import necessary modules and functions
import { getTodoById, deleteTodo } from '../../dataLayer/todosAccess.mjs'; // Functions to retrieve and delete a todo
import { getUserId, apiResponseSucess, apiResponseError } from '../utils.mjs'; // Utilities for user ID and API responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics
import { createLogger } from '../../utils/logger.mjs'; // Logger for debugging and tracking

// Set up logging
const logger = createLogger('deleteTodo'); // Create a logger instance with a specific tag

// Main handler function for deleting a todo
export async function handler(event) {
    const startTime = Date.now(); // Start time for measuring latency
    const userId = getUserId(event); // Retrieve user ID from the event
    const todoId = event.pathParameters.todoId; // Extract the todo ID from the path parameters

    try {
        logger.info('Handling delete Todo', { todoId, userId });

        // Check if the todo exists
        const todoInfo = await getTodoById(userId, todoId);
        if (!todoInfo) {
            return apiResponseError(404, { error: 'Todo does not exist' }); // Return 404 if todo is not found
        }

        // Proceed to delete the todo item
        await deleteTodo({ todoId, userId });

        // Record metrics and return a successful response
        await requestLatencyMetric('deleteTodo', Date.now() - startTime);
        await requestSuccessMetric('deleteTodo', 1);

        return apiResponseSucess(200, { success: true });
        
    } catch (error) {
        // Log the error and return an error response
        logger.error('Error deleting Todo:', { message: error.message, error });
        await requestSuccessMetric('deleteTodo', 0); // Log failed request metric
        return apiResponseError(500, { error: error.message || 'Internal server error' }); // Return 500 on unexpected error
    }
}
