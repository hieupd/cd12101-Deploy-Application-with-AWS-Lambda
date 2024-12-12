// Import necessary modules and functions
import { getTodoById } from '../../dataLayer/todosAccess.mjs'; // Functions to retrieve and delete a todo
import { getUserId } from '../ultilities.mjs'; // Utilities for user ID and API responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics
import { createLogger } from '../../utils/logger.mjs'; // Logger for debugging and tracking
import { deleteTodoBUL } from '../../bussinessLogic/todos.mjs';

// Set up logging
const logger = createLogger('deleteTodo'); // Create a logger instance with a specific tag

// Main handler function for deleting a todo
export async function handler(event) {
    let resData
    const startTime = Date.now(); // Start time for measuring latency
    const userId = getUserId(event); // Retrieve user ID from the event
    const todoId = event.pathParameters.todoId; // Extract the todo ID from the path parameters

    try {
        logger.info('Handling delete Todo', { todoId, userId });

        // Check if the todo exists
        const todoInfo = await getTodoById(userId, todoId);
        if (!todoInfo) {
            resData = {
              statusCode: 404,
              headers: {
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ error: 'Todo does not exist' })
            }
            return resData
        }

        // Proceed to delete the todo item
        await deleteTodoBUL(event);

        // Record metrics and return a successful response
        await requestLatencyMetric('deleteTodo', Date.now() - startTime);
        await requestSuccessMetric('deleteTodo', 1);

        resData = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ success: true })
        }
        return resData
        
    } catch (error) {
        // Log the error and return an error response
        logger.error('Error deleting Todo:', { message: error.message, error });
        await requestSuccessMetric('deleteTodo', 0); // Log failed request metric
        resData = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: error.message || 'Internal server error' })
        }
        return resData
    }
}
