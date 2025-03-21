import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';

export enum CTAType {
  MODAL = 'modal',
  DOCUMENT = 'document',
  FORM = 'form',
  LINK = 'link',
  PAGE = 'page'
}

registerEnumType(CTAType, {
  name: 'CTAType',
  description: 'Tipo de Call To Action',
});

@ObjectType()
@Entity('ctas')
export class CTA {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  title: string;

  @Field()
  @Column('text')
  description: string;

  @Field()
  @Column({ length: 50 })
  buttonText: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: CTAType,
    default: CTAType.LINK
  })
  type: CTAType;

  @Field()
  @Column()
  destination: string;

  @Field(() => Boolean)
  @Column({ default: false })
  openInNewTab: boolean;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  backgroundColor: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  textColor: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  buttonColor: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 