import { ObjectType, Field } from 'type-graphql';
import { User } from '../models/User';

@ObjectType()
export class LoginResponse {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
} 