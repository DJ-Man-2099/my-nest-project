import { DataSource, Repository } from 'typeorm';
import { TweetSubscriber } from './tweets.subscriber';
import { Tweet } from './tweets.entity';
import { Author } from '@/author/author.entity';

describe('TweetSubscriber', () => {
  let subscriber: TweetSubscriber;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockAuthorRepository: jest.Mocked<Repository<Author>>;

  beforeEach(() => {
    mockAuthorRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockDataSource = {
      subscribers: [],
      getRepository: jest.fn().mockReturnValue(mockAuthorRepository),
    } as any;

    subscriber = new TweetSubscriber(mockDataSource);
  });

  it('should be defined', () => {
    expect(subscriber).toBeDefined();
  });

  it('should listen to Tweet entity', () => {
    expect(subscriber.listenTo()).toBe(Tweet);
  });

  it('should update author timestamp after tweet insert', async () => {
    const mockEvent = {
      entity: { authorId: 1 },
      manager: { connection: mockDataSource },
    } as any;

    await subscriber.afterInsert(mockEvent);

    expect(mockDataSource.getRepository).toHaveBeenCalledWith(Author);
    expect(mockAuthorRepository.update).toHaveBeenCalledWith(
      { id: 1 },
      { latestUpdate: expect.any(Date) },
    );
  });

  it('should update author timestamp after tweet update', async () => {
    const mockEvent = {
      entity: { authorId: 1 },
      manager: { connection: mockDataSource },
    } as any;

    await subscriber.afterUpdate(mockEvent);

    expect(mockDataSource.getRepository).toHaveBeenCalledWith(Author);
    expect(mockAuthorRepository.update).toHaveBeenCalledWith(
      { id: 1 },
      { latestUpdate: expect.any(Date) },
    );
  });

  it('should update author timestamp before tweet remove', async () => {
    const mockEvent = {
      entity: { authorId: 1 },
      manager: { connection: mockDataSource },
    } as any;

    await subscriber.beforeRemove(mockEvent);

    expect(mockDataSource.getRepository).toHaveBeenCalledWith(Author);
    expect(mockAuthorRepository.update).toHaveBeenCalledWith(
      { id: 1 },
      { latestUpdate: expect.any(Date) },
    );
  });

  it('should not update if entity is not available in the event', async () => {
    const mockEvent = {
      entity: null,
      manager: { connection: mockDataSource },
    } as any;

    await subscriber.afterUpdate(mockEvent);

    expect(mockDataSource.getRepository).not.toHaveBeenCalled();
    expect(mockAuthorRepository.update).not.toHaveBeenCalled();
  });
});
