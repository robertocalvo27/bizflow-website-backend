import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from './User';
import { Category } from './Category';
import { Video } from './Video';
import { CTA } from './CTA';
import { GraphQLJSON } from 'graphql-type-json';

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

  @Field({ nullable: true })
  @Column({ length: 160, nullable: true, name: 'meta_title' })
  metaTitle: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'meta_description' })
  metaDescription: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'meta_keywords' })
  metaKeywords: string;

  @Field({ nullable: true })
  @Column({ nullable: true, default: true, name: 'indexable' })
  indexable: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'canonical_url' })
  canonicalUrl: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true, name: 'structured_data' })
  structuredData: Record<string, any>;

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

  @Field({ nullable: true })
  @Column({ length: 200, nullable: true, name: 'featured_image_alt' })
  featuredImageAlt: string;

  @Field({ nullable: true })
  @Column({ length: 200, nullable: true, name: 'featured_image_caption' })
  featuredImageCaption: string;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'social_image_url' })
  socialImageUrl: string;

  @Field({ nullable: true })
  @Column({ length: 200, nullable: true, name: 'social_image_alt' })
  socialImageAlt: string;

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

  @Field(() => [Video], { nullable: true })
  @ManyToMany(() => Video, (video) => video.posts)
  videos: Video[];

  @Field(() => CTA, { nullable: true })
  @ManyToOne(() => CTA)
  @JoinColumn({ name: 'ctaId' })
  cta: CTA;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ctaId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'reading_time' })
  readingTime: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true, name: 'custom_metadata' })
  customMetadata: Record<string, any>;
} 