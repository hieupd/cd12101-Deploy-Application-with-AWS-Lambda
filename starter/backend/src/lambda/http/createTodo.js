// Import necessary modules and functions
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics
import { createLogger } from '../../utils/logger.mjs'; // Logger for debugging and auditing
import { createTodoBUL } from '../../bussinessLogic/todos.mjs';

// Set up logging
const logger = createLogger('createTodo'); // Create a logger instance with a function identifier

// Main handler function for creating a todo
export async function handler(event) {
    let resData
    const startTime = Date.now(); // Record the start time for latency calculation

    try {
        // Log the creation of the new todo item
        logger.info('Creating new Todo');
        const resultTodoItem = await createTodoBUL(event);
        logger.info('Created new Todo.', { resultTodoItem });
        // Log metrics for the request
        await requestLatencyMetric('createTodo', Date.now() - startTime);
        await requestSuccessMetric('createTodo', 1); // Log success metric
        
        // Return a successful response with the new item
        resData = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ item: resultTodoItem })
        }
        return resData

    } catch (error) {
        // Handle errors
        logger.error('Error creating Todo:', { message: error.message, error });

        // Log failure metric
        await requestSuccessMetric('createTodo', 0); 

        // Return error response
        resData = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: error.message || 'Internal server error'
          })
        }
        return resData
    }
}