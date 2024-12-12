// Import necessary modules and functions
import { getTodoByUserId } from '../../dataLayer/todosAccess.mjs'; // Function to retrieve todos by user ID
import { getUserId, apiResponseSucess, apiResponseError } from '../utils.mjs'; // Utilities for user ID retrieval and API responses
import { requestSuccessMetric, requestLatencyMetric } from '../../utils/cloudWatchMetric.mjs'; // Metrics for CloudWatch monitoring
import { createLogger } from '../../utils/logger.mjs'; // Logger for tracking events

// Set up logging with a unique function tag for better event tracking
const logger = createLogger('getTodos'); // Create a logger instance

// Main handler function for retrieving todo items for a specific user
export async function handler(event) {
    const startTime = Date.now(); // Record the start time for measuring latency
    const userId = getUserId(event); // Retrieve the user ID from the event

    try {
        // Fetch all todos associated with the specified user ID
        const items = await getTodoByUserId(userId);

        // Record metrics for latency and success
        await requestLatencyMetric('getTodos', Date.now() - startTime);
        await requestSuccessMetric('getTodos', 1); // Log a successful request metric

        // Return a successful response containing the retrieved items
        return apiResponseSucess(200, { items });

    } catch (error) {
        // Log any errors that occur during processing
        logger.error('Error retrieving todos:', { message: error.message, error });

        // Log a failed request metric
        await requestSuccessMetric('getTodos', 0);

        // Return an error response with an appropriate message
        return apiResponseError(500, {
            error: error.message || 'Internal server error'
        });
    }
}
