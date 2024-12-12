// Import necessary modules and functions
import { getTodoById, updateTodo } from '../../dataLayer/todosAccess.mjs'; // Functions to interact with todo items
import { getUserId, apiResponseSucess, apiResponseError } from '../utils.mjs'; // Utilities for user handling and responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics
import { createLogger } from '../../utils/logger.mjs'; // Logger utility for logging events

const fTAG = 'updateTodo'; 
const logger = createLogger(fTAG); // Logger instance specific to the updateTodo function

// Main handler function for updating a todo item
export async function handler(event) {
    const startTime = Date.now(); // Start time for tracking latency
    const userId = getUserId(event); // Retrieve user ID from the event
    const todoId = event.pathParameters.todoId; // Get todo ID from path parameters

    try {
        const updatedTodo = JSON.parse(event.body); // Parse the updated todo data from the request body

        // Log the initiation of the update operation
        logger.info('Attempting to update Todo', { todoId, userId, ...updatedTodo });

        // Validate if the todo exists
        const todoInfo = await getTodoById(userId, todoId);
        if (!todoInfo) {
            return apiResponseError(404, { error: 'Todo does not exist' }); // Return 404 if todo is not found
        }

        // Update todo item with the new data
        await updateTodo({ todoId, userId }, updatedTodo);

        // Record metrics for performance monitoring
        await requestLatencyMetric(fTAG, Date.now() - startTime);
        await requestSuccessMetric(fTAG, 1);
        
        // Return a successful response
        return apiResponseSucess(200, { success: true });

    } catch (error) {
        // Error handling and logging
        logger.error('Error updating Todo', { message: error.message, error });
        await requestSuccessMetric(fTAG, 0);
        return apiResponseError(500, { error: error.message || 'Internal server error' }); // Return a 500 error for unexpected issues
    }
}