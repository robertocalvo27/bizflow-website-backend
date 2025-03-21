import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Post } from './Post';
import { Video } from './Video';

@ObjectType()
@Entity('tags')
export class Tag {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Field()
  @Column({ length: 50 })
  name: string;
  
  @Field()
  @Column({ unique: true })
  slug: string;
  
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;
  
  @Field({ nullable: true })
  @Column({ nullable: true, default: true, name: 'is_active' })
  isActive: boolean;
  
  @Field(() => [Post], { nullable: true })
  @ManyToMany(() => Post, post => post.tags)
  posts: Post[];
  
  @Field(() => [Video], { nullable: true })
  @ManyToMany(() => Video, video => video.tags)
  videos: Video[];
  
  @Field()
  @CreateDateColumn()
  createdAt: Date;
  
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 