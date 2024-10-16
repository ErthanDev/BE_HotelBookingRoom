import { Test, TestingModule } from '@nestjs/testing';
import { DiscountService } from './discount.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountStatus } from '../../enum/discountStatus.enum';

// Mock repository
const mockDiscountRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

describe('DiscountService', () => {
  let service: DiscountService;
  let repository: Repository<Discount>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountService,
        {
          provide: getRepositoryToken(Discount),
          useValue: mockDiscountRepository,
        },
      ],
    }).compile();

    service = module.get<DiscountService>(DiscountService);
    repository = module.get<Repository<Discount>>(getRepositoryToken(Discount));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a discount', async () => {
      const dto: CreateDiscountDto = {
        discountName: 'Test Discount',
        discountPercentage: 10,
        validFrom: new Date(),
        validTo: new Date(),
      };
      const savedDiscount = { ...dto, discountId: '1' };
      
      (repository.create as jest.Mock).mockReturnValue(savedDiscount);
      (repository.save as jest.Mock).mockResolvedValue(savedDiscount);

      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(savedDiscount);
      expect(result).toEqual(savedDiscount);
    });
  });

  describe('findAll', () => {
    it('should return all discounts with pagination meta data', async () => {
      const discounts = [{ discountName: 'Test Discount' }];
      const qs = { currentPage: 1, limit: 10 };
      (repository.findAndCount  as jest.Mock).mockResolvedValue([discounts, 1]);
      (repository.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(qs);
      expect(repository.findAndCount).toHaveBeenCalled();
      expect(result.discounts).toEqual(discounts);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a discount by code', async () => {
      const discount = { discountCode: 'CODE1', discountName: 'Test Discount' };
      (repository.findOne  as jest.Mock).mockResolvedValue(discount);

      const result = await service.findOne('CODE1');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { discountCode: 'CODE1' } });
      expect(result).toEqual(discount);
    });

    it('should throw NotFoundException if discount not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      
      await expect(service.findOne('INVALID_CODE')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated discount', async () => {
      const dto: UpdateDiscountDto = { 
        discountName: 'Updated Discount' ,
        discountPercentage: 10,
        validFrom: new Date(),
        validTo: new Date(),
        discountStatus: DiscountStatus.Available
    };
      const discount = { discountCode: 'CODE1', discountName: 'Test Discount' };

      (repository.findOne  as jest.Mock).mockResolvedValue(discount);
      (repository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.update('1', dto);
      expect(repository.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(discount);
    });

    it('should throw NotFoundException if discount not found', async () => {
      (repository.findOne  as jest.Mock).mockResolvedValue(null);
      
      await expect(service.update('INVALID_ID', {} as UpdateDiscountDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the discount', async () => {
      const discount = { discountId: '1', discountName: 'Test Discount' };
      (repository.findOne  as jest.Mock).mockResolvedValue(discount);
      (repository.delete  as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.remove('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if discount not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      
      await expect(service.remove('INVALID_ID')).rejects.toThrow(NotFoundException);
    });
  });
});
