import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import AWSXRay from 'aws-xray-sdk-core'
const s3Client = AWSXRay.captureAWSv3Client(new S3Client())
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
export async function getUploadUrl(todoId) {
  const segment = AWSXRay.getSegment()
  const subsegment = segment.addNewSubsegment('getUploadUrl')
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId
    })
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: urlExpiration
    })
    subsegment.addAnnotation('status', 'success')
    return url
  } catch (error) {
    subsegment.addError(error)
    throw error
  } finally {
    subsegment.close()
  }
}
export function buildS3Url(id) {
  return `https://${bucketName}.s3.us-east-1.amazonaws.com/${id}`
}