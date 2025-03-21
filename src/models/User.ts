import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import * as bcrypt from 'bcryptjs';
import { Post } from './Post';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profileImageUrl: string;

  @Field({ nullable: true })
  @Column({ nullable: true, length: 100 })
  position: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Field()
  @Column({ default: 'user' })
  role: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
} 