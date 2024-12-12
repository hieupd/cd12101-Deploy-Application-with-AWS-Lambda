// Import necessary modules and functions
import { createTodo } from '../../dataLayer/todosAccess.mjs'; // Function to add a new todo to the data layer
import { getUserId } from '../ultilities.mjs'; // Utilities for user ID and API responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // CloudWatch metrics
import { v4 } from 'uuid'; // UUID generator for unique item IDs
import { createLogger } from '../../utils/logger.mjs'; // Logger for debugging and auditing

// Set up logging
const logger = createLogger('createTodo'); // Create a logger instance with a function identifier

// Main handler function for creating a todo
export async function handler(event) {
    let resData
    const startTime = Date.now(); // Record the start time for latency calculation

    try {
        // Generate a unique ID for the new todo item
        const itemId = v4(); 
        // Retrieve user ID from the event object
        const userId = getUserId(event);
        // Parse the new todo data from the request body
        const newTodo = JSON.parse(event.body);

        // Create the new todo item object
        const newTodoItem = {
            todoId: itemId,
            userId,
            createdAt: new Date().toISOString(), // Timestamp for when the todo is created
            attachmentUrl: '', // Placeholder for attachments
            done: false, // Default status of the todo
            ...newTodo // Merge additional properties from the input
        };

        // Log the creation of the new todo item
        logger.info('Creating new Todo.', { newTodoItem });

        // Save the new todo item to the database
        await createTodo(newTodoItem);
        
        // Log metrics for the request
        await requestLatencyMetric('createTodo', Date.now() - startTime);
        await requestSuccessMetric('createTodo', 1); // Log success metric
        
        // Return a successful response with the new item
        resData = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ item: newTodoItem })
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