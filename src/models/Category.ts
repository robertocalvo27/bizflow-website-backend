import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Post } from './Post';

@ObjectType()
@Entity('categories')
export class Category {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Campos SEO
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

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'social_image_url' })
  socialImageUrl: string;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, post => post.category)
  posts: Post[];
} 