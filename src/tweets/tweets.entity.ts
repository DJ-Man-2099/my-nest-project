import { Author } from '@/author/author.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  authorId: number;

  @ManyToOne(() => Author, (author) => author.tweets)
  author: Author;
}
