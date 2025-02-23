import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './tweets.entity';
import { Author } from '../author/author.entity';
import {
  CreateTweetDto,
  PaginatedResult,
  PaginationQueryDto,
  UpdateTweetDto,
} from './tweets.dto';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<Tweet>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [items, total] = await this.tweetRepository.findAndCount({
      relations: ['author'],
      skip,
      take: limit,
      order: { id: 'DESC' }, // Most recent tweets first
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Tweet> {
    const tweet = await this.tweetRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!tweet) {
      throw new NotFoundException(`Tweet with ID ${id} not found`);
    }

    return tweet;
  }

  async create(createTweetDto: CreateTweetDto): Promise<Tweet> {
    const author = await this.authorRepository.findOne({
      where: { id: createTweetDto.authorId },
    });

    if (!author) {
      throw new NotFoundException(
        `Author with ID ${createTweetDto.authorId} not found`,
      );
    }

    const tweet = this.tweetRepository.create(createTweetDto);
    await this.tweetRepository.save(tweet);

    return this.findOne(tweet.id);
  }

  async update(id: number, updateTweetDto: UpdateTweetDto): Promise<Tweet> {
    const tweet = await this.findOne(id);

    const updatedTweet = Object.assign(tweet, updateTweetDto);
    await this.tweetRepository.save(updatedTweet);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const tweet = await this.findOne(id);
    await this.tweetRepository.remove(tweet);
  }
}
