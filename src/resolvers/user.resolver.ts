import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { User } from '../models/User';
import { UserInput } from '../schema/user.schema';
import { AppDataSource } from '../database/data-source';
import { LoginResponse } from '../schema/auth.schema';
import { createToken } from '../utils/auth';
import { isAuth } from '../middleware/auth';

@Resolver()
export class UserResolver {
  private userRepository = AppDataSource.getRepository(User);

  @Query(() => [User])
  @UseMiddleware(isAuth)
  async users(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['posts'],
    });
  }

  @Query(() => User, { nullable: true })
  async user(@Arg('id') id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
  }

  @Mutation(() => User)
  async register(@Arg('input') input: UserInput): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const user = this.userRepository.create(input);
    return this.userRepository.save(user);
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = createToken(user);

    return {
      user,
      token,
    };
  }
} 