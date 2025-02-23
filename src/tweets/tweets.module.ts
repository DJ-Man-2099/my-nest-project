import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './tweets.entity';
import { Author } from '../author/author.entity';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';
import { TweetSubscriber } from './tweets.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Author])],
  providers: [TweetsService, TweetSubscriber],
  controllers: [TweetsController],
})
export class TweetsModule {}
