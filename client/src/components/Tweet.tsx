import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTweet, deleteTweet, getTweets, patchTweet } from '../api/tweet-api'
import Auth from '../auth/Auth'
import { Tweet } from '../types/Tweet'

interface TweetsProps {
  auth: Auth
  history: History
}

interface TweetsState {
  tweets: Tweet[]
  newTweetText: string
  loadingTweets: boolean
}

export class Tweets extends React.PureComponent<TweetsProps, TweetsState> {
  state: TweetsState = {
    tweets: [],
    newTweetText: '',
    loadingTweets: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTweetText: event.target.value })
  }

  onEditButtonClick = (tweetId: string) => {
    this.props.history.push(`/tweets/${tweetId}/edit`)
  }

  onTweetCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const date = this.calculateDate()
      const newTweet = await createTweet(this.props.auth.getIdToken(), {
        tweetText: this.state.newTweetText,
        date
      })
      this.setState({
        tweets: [...this.state.tweets, newTweet],
        newTweetText: ''
      })
    } catch {
      alert('Tweet creation failed')
    }
  }

  onTweetDelete = async (tweetId: string) => {
    try {
      await deleteTweet(this.props.auth.getIdToken(), tweetId)
      this.setState({
        tweets: this.state.tweets.filter(tweet => tweet.tweetId != tweetId)
      })
    } catch {
      alert('Tweet deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const tweets = await getTweets(this.props.auth.getIdToken())
      this.setState({
        tweets,
        loadingTweets: false
      })
    } catch (e) {
      alert(`Failed to fetch Tweets: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        {this.renderCreateTweetInput()}

        {this.renderTweets()}
      </div>
    )
  }

  renderCreateTweetInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'blue',
              content: 'Post tweet',
              onClick: this.onTweetCreate
            }}
            fluid
            placeholder="What's happening now ?"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTweets() {
    if (this.state.loadingTweets) {
      return this.renderLoading()
    }

    return this.renderTweetsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Tweets
        </Loader>
      </Grid.Row>
    )
  }

  renderTweetsList() {
    return (
      <Grid padded>
        {this.state.tweets.map((tweet) => {
          return (
            <Grid.Row key={tweet.tweetId}>
              <Grid.Column width={10} verticalAlign="middle">
                <h4>{tweet.tweetText}</h4>
                
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {dateFormat(tweet.createdAt, 'dddd, mmmm dS, yyyy, h:MM:ss TT')}
              </Grid.Column>
              <Grid.Column width={1} floated="left">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(tweet.tweetId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTweetDelete(tweet.tweetId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {tweet.attachmentUrl && (
                <Image src={tweet.attachmentUrl} size="medium" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'hh:mm ,  yyyy-mm-dd') as string
  }
}
