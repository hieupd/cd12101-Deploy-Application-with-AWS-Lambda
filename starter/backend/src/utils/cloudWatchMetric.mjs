import {
  CloudWatchClient,
  PutMetricDataCommand
} from '@aws-sdk/client-cloudwatch'
// CloudWatch client
const cloudwatch = new CloudWatchClient()
export async function requestSuccessMetric(serviceName = 'ServiceName', value = 0) {
  const successMetricCommand = new PutMetricDataCommand({
    MetricData: [
      {
        MetricName: 'Success',
        Dimensions: [
          {
            Name: serviceName,
            Value: 'RequestSuccess-Data'
          }
        ],
        Unit: 'Count',
        Value: value
      }
    ],
    Namespace: 'TODOs/Serveless'
  })
  await cloudwatch.send(successMetricCommand)
}
export async function requestLatencyMetric(serviceName = 'ServiceName', value = 0) {
  const latencyMetricCommand = new PutMetricDataCommand({
    MetricData: [
      {
        MetricName: 'Latency',
        Dimensions: [
          {
            Name: serviceName,
            Value: 'RequestLatency-Data'
          }
        ],
        Unit: 'Milliseconds',
        Value: value
      }
    ],
    Namespace: 'TODOs/Serveless'
  })
  await cloudwatch.send(latencyMetricCommand)
}