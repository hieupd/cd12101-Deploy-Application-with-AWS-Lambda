import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
const dynamoDbClient = AWSXRay.captureAWSv3Client(DynamoDBDocument.from(new DynamoDB()))

const todoTable = process.env.TODO_TABLE
const userIdIndex = process.env.USER_ID_INDEX

export async function getTodoById(userId, todoId) {
  const segment = AWSXRay.getSegment()
  const subsegment = segment.addNewSubsegment('getTodoById')
  try {
    const result = await dynamoDbClient.get({
      TableName: todoTable,
      Key: {
        userId,
        todoId
      }
    })
    subsegment.addAnnotation('status', 'success')
    return result.Item;
  } catch (error) {
    subsegment.addError(error)
    throw error
  } finally {
    subsegment.close()
  }
}

export async function getTodoByUserId(userId) {
  const segment = AWSXRay.getSegment()
  const subsegment = segment.addNewSubsegment('getTodoByUserId')
  try {
    const queryOpt = {
      TableName: todoTable,
      IndexName: userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }
    const result = await dynamoDbClient.query(queryOpt)
    subsegment.addAnnotation('status', 'success')
    return result.Items;
  } catch (error) {
    subsegment.addError(error)
    throw error
  } finally {
    subsegment.close()
  }
}

export async function updateTodo(keyObj = { todoId, userId }, updateData = { done, name, dueDate }) {
  const segment = AWSXRay.getSegment()
  const subsegment = segment.addNewSubsegment('updateTodo')
  try {
    // NOTE: Attribute name is a reserved keyword dynamodb

    if (!updateData || !Object.keys(updateData).length) {
      console.error('Update data is empty')
      return false
    }
    let updateExpressionStr = null
    const updateAttributeObj = {}

    Object.keys(updateData).forEach(key => {
      if (!updateExpressionStr) {
        updateExpressionStr = `set ${key} = :${key}`
      } else {
        updateExpressionStr += `,${key} = :${key}`
      }
      updateAttributeObj[`:${key}`] = updateData[key]
    });
    const params = {
      TableName: todoTable,
      Key: keyObj,
      UpdateExpression: updateExpressionStr,
      ExpressionAttributeValues: updateAttributeObj
    }
    await dynamoDbClient.update(params);
    subsegment.addAnnotation('status', 'success')
  } catch (error) {
    subsegment.addError(error)
    throw error
  } finally {
    subsegment.close()
  }
}

export async function deleteTodo(keyObj = { todoId, userId }) {
  const segment = AWSXRay.getSegment()
  const subsegment = segment.addNewSubsegment('deleteTodo')
  try {
    const result = await dynamoDbClient.delete({
      TableName: todoTable,
      Key: keyObj
    })
    subsegment.addAnnotation('status', 'success')
    return result
  } catch (error) {
    subsegment.addError(error)
    throw error
  } finally {
    subsegment.close()
  }
}

export async function createTodo(data) {
  const segment = AWSXRay.getSegment()
  const subsegment = segment.addNewSubsegment('createTodo')
  try {
    await dynamoDbClient.put({
      TableName: todoTable,
      Item: data
    })
    subsegment.addAnnotation('status', 'success')
  } catch (error) {
    subsegment.addError(error)
    throw error
  } finally {
    subsegment.close()
  }
}