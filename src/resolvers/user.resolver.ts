import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { User } from '../models/User';
import { 
  UserInput, 
  UserUpdateInput, 
  UserFilterInput, 
  UserSortInput, 
  PaginatedUsers,
  UserRole
} from '../schema/user.schema';
import { PaginationInput, SortOrder } from '../schema/common.schema';
import { AppDataSource } from '../database/data-source';
import { LoginResponse } from '../schema/auth.schema';
import { createToken } from '../utils/auth';
import { isAuth } from '../middleware/auth';
import { MyContext } from '../middleware/auth';
import { FindOptionsWhere, FindOptionsOrder, Like, In } from 'typeorm';

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

  @Query(() => PaginatedUsers)
  @UseMiddleware(isAuth)
  async paginatedUsers(
    @Ctx() { payload }: MyContext,
    @Arg('pagination', { nullable: true }) pagination?: PaginationInput,
    @Arg('filter', { nullable: true }) filter?: UserFilterInput,
    @Arg('sort', { nullable: true }) sort?: UserSortInput
  ): Promise<PaginatedUsers> {
    // Verificar si el usuario no es admin, solo puede ver sus propios datos
    if (payload.role !== UserRole.ADMIN) {
      throw new Error('Solo los administradores pueden ver todos los usuarios');
    }
    
    const { offset = 0, limit = 10 } = pagination || {};
    const sortField = sort?.field || 'name';
    const sortOrder = sort?.order || SortOrder.ASC;
    
    // Construir el objeto de condiciones where
    const where: FindOptionsWhere<User> = {};
    
    // Aplicar filtros si están presentes
    if (filter) {
      // Filtrar por nombre
      if (filter.name) {
        if (filter.name.contains) {
          where.name = Like(`%${filter.name.contains}%`);
        } else if (filter.name.startsWith) {
          where.name = Like(`${filter.name.startsWith}%`);
        } else if (filter.name.endsWith) {
          where.name = Like(`%${filter.name.endsWith}`);
        } else if (filter.name.equals) {
          where.name = filter.name.equals;
        }
      }
      
      // Filtrar por email
      if (filter.email) {
        if (filter.email.contains) {
          where.email = Like(`%${filter.email.contains}%`);
        } else if (filter.email.equals) {
          where.email = filter.email.equals;
        }
      }
      
      // Filtrar por roles
      if (filter.roles && filter.roles.length > 0) {
        where.role = In(filter.roles);
      }
    }
    
    // Construir el objeto de ordenamiento
    const order: FindOptionsOrder<User> = {
      [sortField]: sortOrder,
    };
    
    // Contar el total de items que coinciden con el filtro
    const totalItems = await this.userRepository.count({ where });
    
    // Calcular info de paginación
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    // Obtener los items para la página actual
    const items = await this.userRepository.find({
      where,
      order,
      skip: offset,
      take: limit,
      relations: ['posts'],
    });
    
    return {
      items,
      pageInfo: {
        totalItems,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
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

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async updateUser(
    @Arg('id') id: string,
    @Arg('input') input: UserUpdateInput,
    @Ctx() { payload }: MyContext
  ): Promise<User> {
    // Verificar permisos - solo puede actualizar su propio perfil o un admin puede actualizar cualquiera
    if (id !== payload.id && payload.role !== UserRole.ADMIN) {
      throw new Error('No tienes permisos para actualizar este usuario');
    }
    
    const user = await this.userRepository.findOne({
      where: { id }
    });
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Si es admin y está actualizando otro usuario, permitir cambio de rol
    if (payload.role === UserRole.ADMIN) {
      Object.assign(user, input);
    } else {
      // Si el usuario está actualizando su propio perfil, no permitir cambio de rol
      const { role, ...restInput } = input;
      Object.assign(user, restInput);
    }
    
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