import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  adminAuditLog: { create: jest.fn() },
};

const mockTx = {
  adminAuditLog: { create: jest.fn() },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  describe('log()', () => {
    const baseEntry = {
      actorId: 'admin-1',
      action: 'COMPANY_VERIFIED',
      entity: 'Company',
      entityId: 'co-1',
    };

    it('1. calls prisma.adminAuditLog.create with correct data when no tx provided', async () => {
      mockPrisma.adminAuditLog.create.mockResolvedValue({ id: 'log-1' });

      await service.log(baseEntry);

      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'admin-1',
          action: 'COMPANY_VERIFIED',
          entity: 'Company',
          entityId: 'co-1',
          metadata: undefined,
        },
      });
    });

    it('2. calls tx.adminAuditLog.create (not prisma) when a tx is provided', async () => {
      mockTx.adminAuditLog.create.mockResolvedValue({ id: 'log-2' });

      await service.log(baseEntry, mockTx as any);

      expect(mockTx.adminAuditLog.create).toHaveBeenCalled();
      expect(mockPrisma.adminAuditLog.create).not.toHaveBeenCalled();
    });

    it('3. passes undefined as metadata when none provided', async () => {
      mockPrisma.adminAuditLog.create.mockResolvedValue({ id: 'log-3' });

      await service.log({ actorId: 'admin-1', action: 'ACTION', entity: 'Entity' });

      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ metadata: undefined }),
        }),
      );
    });

    it('4. passes metadata correctly when provided', async () => {
      mockPrisma.adminAuditLog.create.mockResolvedValue({ id: 'log-4' });
      const metadata = { from: 'PENDING', to: 'VERIFIED', notes: 'looks good' };

      await service.log({ ...baseEntry, metadata });

      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ metadata }),
        }),
      );
    });
  });
});
