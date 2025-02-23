import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Tweet } from './tweets.entity';
import { Author } from '@/author/author.entity';

@EventSubscriber()
export class TweetSubscriber implements EntitySubscriberInterface<Tweet> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Tweet;
  }

  private async updateAuthorTimestamp(
    authorId: number,
    dataSource: DataSource,
  ) {
    const authorRepository = dataSource.getRepository(Author);
    await authorRepository.update(
      { id: authorId },
      { latestUpdate: new Date() },
    );
  }

  async afterInsert(event: InsertEvent<Tweet>) {
    await this.updateAuthorTimestamp(
      event.entity.authorId,
      event.manager.connection,
    );
  }

  async afterUpdate(event: UpdateEvent<Tweet>) {
    if (event.entity) {
      await this.updateAuthorTimestamp(
        event.entity.authorId,
        event.manager.connection,
      );
    }
  }

  async beforeRemove(event: RemoveEvent<Tweet>) {
    // We need to use beforeRemove because after the tweet is removed, we won't have access to the authorId
    if (event.entity) {
      await this.updateAuthorTimestamp(
        event.entity.authorId,
        event.manager.connection,
      );
    }
  }
}
