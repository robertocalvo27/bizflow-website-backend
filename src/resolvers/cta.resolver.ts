import { Resolver, Query, Mutation, Arg, Ctx, Authorized, ID, Int } from 'type-graphql';
import { CTA, CTAType } from '../models/CTA';
import { AppDataSource } from '../database/data-source';
import { AuthContext } from '../types/context';
import { PaginatedCTAResponse } from '../types/pagination';

@Resolver(CTA)
export class CTAResolver {
  private ctaRepository = AppDataSource.getRepository(CTA);

  @Query(() => CTA, { nullable: true })
  async getCTA(@Arg('id') id: string): Promise<CTA | null> {
    return this.ctaRepository.findOne({ where: { id } });
  }

  @Query(() => PaginatedCTAResponse)
  async getCTAs(
    @Arg('skip', () => Int, { defaultValue: 0 }) skip: number,
    @Arg('take', () => Int, { defaultValue: 10 }) take: number,
  ): Promise<PaginatedCTAResponse> {
    const [items, totalCount] = await this.ctaRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' }
    });

    return {
      items,
      totalCount,
      hasMore: skip + take < totalCount
    };
  }

  @Authorized()
  @Mutation(() => CTA)
  async createCTA(
    @Arg('title') title: string,
    @Arg('description') description: string,
    @Arg('buttonText') buttonText: string,
    @Arg('type', () => String) type: CTAType,
    @Arg('destination') destination: string,
    @Arg('openInNewTab', () => Boolean, { nullable: true, defaultValue: false }) openInNewTab: boolean,
    @Arg('backgroundColor', () => String, { nullable: true }) backgroundColor: string | null,
    @Arg('textColor', () => String, { nullable: true }) textColor: string | null,
    @Arg('buttonColor', () => String, { nullable: true }) buttonColor: string | null,
    @Ctx() { user }: AuthContext
  ): Promise<CTA> {
    // Verificar permisos (opcional)
    if (!user || user.role !== 'admin') {
      throw new Error('No tienes permiso para crear CTAs');
    }

    const cta = new CTA();
    cta.title = title;
    cta.description = description;
    cta.buttonText = buttonText;
    cta.type = type as CTAType;
    cta.destination = destination;
    cta.openInNewTab = openInNewTab;
    
    if (backgroundColor) cta.backgroundColor = backgroundColor;
    if (textColor) cta.textColor = textColor;
    if (buttonColor) cta.buttonColor = buttonColor;

    await this.ctaRepository.save(cta);
    return cta;
  }

  @Authorized()
  @Mutation(() => CTA)
  async updateCTA(
    @Arg('id') id: string,
    @Arg('title', () => String, { nullable: true }) title: string | null,
    @Arg('description', () => String, { nullable: true }) description: string | null,
    @Arg('buttonText', () => String, { nullable: true }) buttonText: string | null,
    @Arg('type', () => String, { nullable: true }) type: CTAType | null,
    @Arg('destination', () => String, { nullable: true }) destination: string | null,
    @Arg('openInNewTab', () => Boolean, { nullable: true }) openInNewTab: boolean | null,
    @Arg('backgroundColor', () => String, { nullable: true }) backgroundColor: string | null,
    @Arg('textColor', () => String, { nullable: true }) textColor: string | null,
    @Arg('buttonColor', () => String, { nullable: true }) buttonColor: string | null,
    @Ctx() { user }: AuthContext
  ): Promise<CTA> {
    // Verificar permisos (opcional)
    if (!user || user.role !== 'admin') {
      throw new Error('No tienes permiso para actualizar CTAs');
    }

    const cta = await this.ctaRepository.findOne({ where: { id } });
    if (!cta) {
      throw new Error('CTA no encontrado');
    }

    if (title) cta.title = title;
    if (description) cta.description = description;
    if (buttonText) cta.buttonText = buttonText;
    if (type) cta.type = type as CTAType;
    if (destination) cta.destination = destination;
    if (openInNewTab !== null) cta.openInNewTab = openInNewTab;
    if (backgroundColor) cta.backgroundColor = backgroundColor;
    if (textColor) cta.textColor = textColor;
    if (buttonColor) cta.buttonColor = buttonColor;

    await this.ctaRepository.save(cta);
    return cta;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteCTA(
    @Arg('id') id: string,
    @Ctx() { user }: AuthContext
  ): Promise<boolean> {
    // Verificar permisos (opcional)
    if (!user || user.role !== 'admin') {
      throw new Error('No tienes permiso para eliminar CTAs');
    }

    const cta = await this.ctaRepository.findOne({ where: { id } });
    if (!cta) {
      throw new Error('CTA no encontrado');
    }

    await this.ctaRepository.remove(cta);
    return true;
  }
} 