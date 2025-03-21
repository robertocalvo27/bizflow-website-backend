import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from './User';
import { Category } from './Category';
import { Post } from './Post';

export enum VideoProvider {
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  CUSTOM = 'custom'
}

registerEnumType(VideoProvider, {
  name: 'VideoProvider',
  description: 'Proveedor del video',
});

@ObjectType()
@Entity('videos')
export class Video {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 200 })
  title: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description: string;

  @Field()
  @Column()
  videoUrl: string;

  @Field()
  @Column()
  thumbnailUrl: string;

  @Field(() => String)
  @Column({ default: VideoProvider.YOUTUBE })
  provider: string;

  @Field()
  @Column()
  videoId: string;

  @Field()
  @Column({ default: 0 })
  duration: number;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  transcription: string;

  @Field()
  @Column({ default: false })
  featured: boolean;

  @Field(() => Category)
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Field()
  @Column()
  categoryId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Field()
  @Column()
  authorId: string;

  @Field(() => [Post], { nullable: true })
  @ManyToMany(() => Post, (post) => post.videos)
  @JoinTable({
    name: 'video_posts',
    joinColumn: {
      name: 'videoId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'postId',
      referencedColumnName: 'id'
    }
  })
  posts: Post[];

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 