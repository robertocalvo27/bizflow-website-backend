import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from './User';
import { Category } from './Category';

@ObjectType()
@Entity('posts')
export class Post {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 200 })
  title: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field()
  @Column({ type: 'text' })
  excerpt: string;

  @Field()
  @Column({ type: 'text' })
  content: string;

  @Field()
  @Column({ default: 'draft' })
  status: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Category)
  @ManyToOne(() => Category, category => category.posts)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Field()
  @Column()
  categoryId: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Field()
  @Column()
  authorId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  featuredImageUrl: string;

  @Field(() => [Post], { nullable: true })
  @ManyToMany(() => Post, { nullable: true })
  @JoinTable({
    name: 'related_posts',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'related_post_id',
      referencedColumnName: 'id'
    }
  })
  relatedPosts: Post[];
} 