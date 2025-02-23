import { Tweet } from '@/tweets/tweets.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    default: () => 'CURRENT_TIMESTAMP',
  })
  latestUpdate: Date;

  @OneToMany(() => Tweet, (tweet) => tweet.author)
  tweets: Tweet[];
}
