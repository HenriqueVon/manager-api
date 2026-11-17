import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BulkDeleteFinancialFundUseCase } from '../../usecases/bulk-delete-financial-fund.usecase';
import type { IFinancialFundRepository } from '../../repositories/ifinancial-fund.repository';
import { ConflictError, ResourcesInUseError, ResourcesNotFoundError } from '@shared/errors/app-error';

describe('BulkDeleteFinancialFundUseCase', () => {
  let repo: IFinancialFundRepository;
  let sut: BulkDeleteFinancialFundUseCase;

  beforeEach(() => {
    repo = {
      findExistingIds : vi.fn(),
      findIdsInUse    : vi.fn().mockResolvedValue([]),
      deleteMany      : vi.fn().mockResolvedValue(undefined),
    } as unknown as IFinancialFundRepository;

    sut = new BulkDeleteFinancialFundUseCase(repo);
  });

  it('should delete the records when all the ids exist', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['id-1', 'id-2']);

    await sut.execute({ ids: ['id-1', 'id-2'] });

    expect(repo.findExistingIds).toHaveBeenCalledWith(['id-1', 'id-2']);
    expect(repo.deleteMany).toHaveBeenCalledTimes(1);
    expect(repo.deleteMany).toHaveBeenCalledWith(['id-1', 'id-2']);
  });

  it('should delete nothing and list the ids that do not exist', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['id-2']);

    const error = await sut.execute({ ids: ['id-1', 'id-2', 'id-3'] }).catch((failure) => failure);

    expect(error).toBeInstanceOf(ResourcesNotFoundError);
    expect(error.statusCode).toBe(404);
    expect(error.ids).toEqual(['id-1', 'id-3']);
    expect(repo.deleteMany).not.toHaveBeenCalled();
  });

  it('should delete nothing and list the ids that other records use', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['id-1', 'id-2', 'id-3']);
    (repo.findIdsInUse as any).mockResolvedValue(['id-2']);

    const error = await sut.execute({ ids: ['id-1', 'id-2', 'id-3'] }).catch((failure) => failure);

    expect(error).toBeInstanceOf(ResourcesInUseError);
    expect(error.statusCode).toBe(409);
    expect(error.ids).toEqual(['id-2']);
    expect(repo.deleteMany).not.toHaveBeenCalled();
  });

  it('should report the ids that do not exist before the ones in use', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['id-1']);
    (repo.findIdsInUse as any).mockResolvedValue(['id-1']);

    const error = await sut.execute({ ids: ['id-1', 'id-2'] }).catch((failure) => failure);

    expect(error).toBeInstanceOf(ResourcesNotFoundError);
    expect(error.ids).toEqual(['id-2']);
    expect(repo.findIdsInUse).not.toHaveBeenCalled();
  });

  it('should let the 409 of the database through, with no ids, when a record became used after the check', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['id-1']);
    (repo.deleteMany as any).mockRejectedValue(new ConflictError('Operation conflicts with related records'));

    const error = await sut.execute({ ids: ['id-1'] }).catch((failure) => failure);

    expect(error).toBeInstanceOf(ConflictError);
    expect(error).not.toBeInstanceOf(ResourcesInUseError);
    expect(error.statusCode).toBe(409);
    expect(error).not.toHaveProperty('ids');
  });
});
