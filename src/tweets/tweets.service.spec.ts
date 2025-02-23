import { Test, TestingModule } from '@nestjs/testing';
import { TweetsService } from './tweets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tweet } from './tweets.entity';
import { Author } from '@/author/author.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('TweetsService', () => {
  let service: TweetsService;
  let tweetRepository: Repository<Tweet>;
  let authorRepository: Repository<Author>;

  const mockTweet = {
    id: 1,
    text: 'Test tweet',
    authorId: 1,
    author: {
      id: 1,
      name: 'Test Author',
      email: 'test@example.com',
      latestUpdate: new Date(),
      tweets: [],
    },
  };

  const mockAuthor = {
    id: 1,
    name: 'Test Author',
    email: 'test@example.com',
    latestUpdate: new Date(),
    tweets: [],
  };

  const mockTweetRepository = {
    find: jest.fn().mockResolvedValue([mockTweet]),
    findOne: jest.fn().mockResolvedValue(mockTweet),
    findAndCount: jest.fn().mockResolvedValue([[mockTweet], 1]),
    create: jest.fn().mockReturnValue(mockTweet),
    save: jest.fn().mockResolvedValue(mockTweet),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockAuthorRepository = {
    findOne: jest.fn().mockResolvedValue(mockAuthor),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: getRepositoryToken(Tweet),
          useValue: mockTweetRepository,
        },
        {
          provide: getRepositoryToken(Author),
          useValue: mockAuthorRepository,
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
    tweetRepository = module.get<Repository<Tweet>>(getRepositoryToken(Tweet));
    authorRepository = module.get<Repository<Author>>(
      getRepositoryToken(Author),
    );

    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tweets', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.items).toEqual([mockTweet]);
      expect(tweetRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['author'],
        skip: 0,
        take: 10,
        order: { id: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single tweet', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockTweet);
      expect(tweetRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
    });

    it('should throw NotFoundException when tweet not found', async () => {
      jest.spyOn(tweetRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a tweet', async () => {
      const createTweetDto = { text: 'Test tweet', authorId: 1 };

      const result = await service.create(createTweetDto);

      expect(result).toEqual(mockTweet);
      expect(authorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(tweetRepository.create).toHaveBeenCalledWith(createTweetDto);
      expect(tweetRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when author not found', async () => {
      jest.spyOn(authorRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        service.create({ text: 'Test', authorId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a tweet', async () => {
      const updateTweetDto = { text: 'Updated tweet' };
      const result = await service.update(1, updateTweetDto);

      expect(result).toEqual(mockTweet);
      expect(tweetRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
      expect(tweetRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when tweet not found', async () => {
      jest.spyOn(tweetRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.update(999, { text: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a tweet', async () => {
      await service.remove(1);
      expect(tweetRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
      expect(tweetRepository.remove).toHaveBeenCalledWith(mockTweet);
    });

    it('should throw NotFoundException when tweet not found', async () => {
      jest.spyOn(tweetRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
