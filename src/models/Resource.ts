import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from './User';
import { Category } from './Category';

export enum ResourceType {
  PDF = 'pdf',
  DOC = 'doc',
  XLSX = 'xlsx',
  IMAGE = 'image',
  ZIP = 'zip',
  OTHER = 'other'
}

@ObjectType()
@Entity('resources')
export class Resource {
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
  description: string;

  @Field()
  @Column()
  fileUrl: string;

  @Field()
  @Column({ type: 'varchar', default: ResourceType.OTHER })
  resourceType: string;

  @Field()
  @Column()
  fileSize: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  thumbnailUrl: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  downloadInstructions: string;

  @Field()
  @Column({ default: false })
  featured: boolean;

  @Field()
  @Column({ default: true })
  isPublic: boolean;

  @Field()
  @Column({ default: 0 })
  downloadCount: number;

  @Field(() => Category)
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Field()
  @Column()
  categoryId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  @Field()
  @Column()
  uploaderId: string;

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