import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PersonasService } from './personas.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  leadPersona: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('PersonasService', () => {
  let service: PersonasService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PersonasService>(PersonasService);
  });

  describe('list', () => {
    it('1. delegates to prisma.leadPersona.findMany ordered by createdAt desc', async () => {
      const personas = [{ id: 'p-1', name: 'CTO' }];
      mockPrisma.leadPersona.findMany.mockResolvedValue(personas);
      const result = await service.list();
      expect(mockPrisma.leadPersona.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toBe(personas);
    });
  });

  describe('get', () => {
    it('2. happy path returns the persona', async () => {
      const persona = { id: 'p-1', name: 'VP Sales' };
      mockPrisma.leadPersona.findUnique.mockResolvedValue(persona);
      const result = await service.get('p-1');
      expect(result).toBe(persona);
    });

    it('3. throws NotFoundException when persona not found', async () => {
      mockPrisma.leadPersona.findUnique.mockResolvedValue(null);
      await expect(service.get('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('4. delegates to prisma.leadPersona.create with dto as data', async () => {
      const dto = { name: 'Head of Procurement', industry: 'Manufacturing' } as any;
      const created = { id: 'p-new', ...dto };
      mockPrisma.leadPersona.create.mockResolvedValue(created);
      const result = await service.create(dto);
      expect(mockPrisma.leadPersona.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toBe(created);
    });
  });

  describe('update', () => {
    it('5. happy path returns updated persona', async () => {
      const updated = { id: 'p-1', name: 'Updated Name' };
      mockPrisma.leadPersona.update.mockResolvedValue(updated);
      const result = await service.update('p-1', { name: 'Updated Name' });
      expect(result).toBe(updated);
    });

    it('6. throws NotFoundException when prisma update throws', async () => {
      mockPrisma.leadPersona.update.mockRejectedValue(new Error('P2025'));
      await expect(service.update('missing', { name: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('7. calls prisma.leadPersona.update with correct id and dto', async () => {
      const dto = { name: 'CFO', industry: 'Finance' };
      mockPrisma.leadPersona.update.mockResolvedValue({ id: 'p-2', ...dto });
      await service.update('p-2', dto);
      expect(mockPrisma.leadPersona.update).toHaveBeenCalledWith({
        where: { id: 'p-2' },
        data: dto,
      });
    });

    it('8. NotFoundException message is "Persona not found."', async () => {
      mockPrisma.leadPersona.update.mockRejectedValue(new Error('record not found'));
      await expect(service.update('ghost', {})).rejects.toThrow('Persona not found.');
    });
  });
});
