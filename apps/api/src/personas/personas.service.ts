import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.leadPersona.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const persona = await this.prisma.leadPersona.findUnique({ where: { id } });
    if (!persona) throw new NotFoundException('Persona not found.');
    return persona;
  }

  create(dto: CreatePersonaDto) {
    return this.prisma.leadPersona.create({ data: dto });
  }

  async update(id: string, dto: UpdatePersonaDto) {
    try {
      return await this.prisma.leadPersona.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Persona not found.');
    }
  }
}
