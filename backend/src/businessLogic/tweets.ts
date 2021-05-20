import * as uuid from 'uuid'

import { TweetItem } from '../models/TweetItem'
import { TweetAccess } from '../dataLayer/tweetAccess'
import { CreateTweetRequest } from '../requests/CreateTweetRequest'
import { UpdateTweetRequest } from '../requests/UpdateTweetRequest'

const tweetAccess = new TweetAccess()

export async function getAllTweets(userId: string): Promise<TweetItem[]> {
    return tweetAccess.getAllTweets(userId)
}

export async function createTweet(
    createTweetRequest: CreateTweetRequest,
    userId: string,
): Promise<TweetItem> {
    const itemId = uuid.v4()

    return tweetAccess.createTweet({
        tweetId: itemId,
        userId,
        tweetText: createTweetRequest.tweetText,
        createdAt: new Date().toISOString(),
    })
}

export async function updateTweet(
    tweetId: string,
    updateTweetRequest: UpdateTweetRequest,
    userId: string,
): Promise<void> {
    const tweet = await tweetAccess.getTweet(tweetId, userId)

    tweetAccess.updateTweet(tweet.tweetId, updateTweetRequest)
}

export async function deleteTweet(
    tweetId: string,
    userId: string,
): Promise<void> {
    const tweet = await tweetAccess.getTweet(tweetId, userId)

    await tweetAccess.deleteTweet(tweet.tweetId, tweet.userId)
}

export async function attachImage(
    tweetId: string,
    userId: string,
    attachmentUrl: string,
): Promise<void> {
    const tweet = await tweetAccess.getTweet(tweetId, userId)

    tweetAccess.setAttachmentUrl(tweet.tweetId, tweet.userId, attachmentUrl)
}