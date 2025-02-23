import { Test, TestingModule } from '@nestjs/testing';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';
import { PaginationQueryDto } from './tweets.dto';

describe('TweetsController', () => {
  let controller: TweetsController;
  let service: TweetsService;

  const mockTweet = {
    id: 1,
    text: 'Test tweet',
    authorId: 1,
    author: {
      id: 1,
      name: 'Test Author',
      email: 'test@example.com',
      latestUpdate: new Date(),
    },
  };

  const mockPaginatedResponse = {
    items: [mockTweet],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TweetsController],
      providers: [
        {
          provide: TweetsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
            findOne: jest.fn().mockResolvedValue(mockTweet),
            create: jest.fn().mockResolvedValue(mockTweet),
            update: jest.fn().mockResolvedValue(mockTweet),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<TweetsController>(TweetsController);
    service = module.get<TweetsService>(TweetsService);
  });

  describe('findAll', () => {
    it('should return paginated tweets', async () => {
      const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
      const result = await controller.findAll(paginationQuery);
      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(paginationQuery);
    });
  });

  describe('findOne', () => {
    it('should return a single tweet', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(mockTweet);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a tweet', async () => {
      const createTweetDto = { text: 'Test tweet', authorId: 1 };
      const result = await controller.create(createTweetDto);
      expect(result).toEqual(mockTweet);
      expect(service.create).toHaveBeenCalledWith(createTweetDto);
    });
  });

  describe('update', () => {
    it('should update a tweet', async () => {
      const updateTweetDto = { text: 'Updated tweet' };
      const result = await controller.update(1, updateTweetDto);
      expect(result).toEqual(mockTweet);
      expect(service.update).toHaveBeenCalledWith(1, updateTweetDto);
    });
  });

  describe('remove', () => {
    it('should remove a tweet', async () => {
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
