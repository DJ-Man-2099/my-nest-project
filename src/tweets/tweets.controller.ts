import {
  CreateTweetDto,
  PaginatedResult,
  PaginationQueryDto,
  UpdateTweetDto,
} from './tweets.dto';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TweetsService } from './tweets.service';
import { Tweet } from './tweets.entity';

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<Tweet>> {
    return this.tweetsService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Tweet> {
    return this.tweetsService.findOne(id);
  }

  @Post()
  create(@Body() createTweetDto: CreateTweetDto): Promise<Tweet> {
    return this.tweetsService.create(createTweetDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTweetDto: UpdateTweetDto,
  ): Promise<Tweet> {
    return this.tweetsService.update(id, updateTweetDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tweetsService.remove(id);
  }
}
