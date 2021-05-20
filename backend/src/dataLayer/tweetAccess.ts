import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TweetItem } from '../models/TweetItem'
import { TweetUpdate } from '../models/TweetUpdate'

const XAWS = AWSXRay.captureAWS(AWS);

export class TweetAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly tweetsTable = process.env.TWEETS_DYNAMODB_TABLE,
  ) { }

  async getAllTweets(userId: string): Promise<TweetItem[]> {
    const result = await this.docClient.query({
        TableName: this.tweetsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
    })
    .promise()

    const items = result.Items
    return items as TweetItem[]
  }

  async getTweet(tweetId: string, userId: string): Promise<TweetItem> {
    const result = await this.docClient.query({
        TableName: this.tweetsTable,
        KeyConditionExpression: 'tweetId = :tweetId and userId = :userId',
        ExpressionAttributeValues: {
          ':tweetId': tweetId,
          ':userId': userId,
        },
    })
    .promise()

    const item = result.Items[0]
    return item as TweetItem
  }

  async createTweet(tweetItem: TweetItem): Promise<TweetItem> {
    await this.docClient.put({
        TableName: this.tweetsTable,
        Item: tweetItem,
    })
    .promise()

    return tweetItem
  }

  async updateTweet(
    tweetId: string,
    tweetUpdate: TweetUpdate,
  ): Promise<void> {
    this.docClient.update({
        TableName: this.tweetsTable,
        Key: {
          tweetId,
        },
        UpdateExpression:
          'set #tweetText = :tweetText',
        ExpressionAttributeValues: {
          ':tweetText': tweetUpdate.tweetText,
        },
        ExpressionAttributeNames: {
          '#tweetText': 'tweetText', 
        },
        ReturnValues: 'UPDATED_NEW',
    })
    .promise()
  }

  async setAttachmentUrl(
    tweetId: string,
    userId: string,
    attachmentUrl: string,
  ): Promise<void> {
    this.docClient.update({
        TableName: this.tweetsTable,
        Key: {
          userId,
          tweetId,
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
        ReturnValues: 'UPDATED_NEW',
    })
    .promise()
  }

  async deleteTweet(tweetId: string, userId: string): Promise<void> {
    this.docClient.delete({
        TableName: this.tweetsTable,
        Key: {
          userId,
          tweetId,
        },
    })
    .promise()
  }
}


function createDynamoDBClient(): DocumentClient {
    return new XAWS.DynamoDB.DocumentClient()
}