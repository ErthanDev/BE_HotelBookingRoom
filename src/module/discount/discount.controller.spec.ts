import { Test, TestingModule } from '@nestjs/testing';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountStatus } from '../../enum/discountStatus.enum';

describe('DiscountController', () => {
  let discountController: DiscountController;
  let discountService: DiscountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountController],
      providers: [
        {
          provide: DiscountService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    discountController = module.get<DiscountController>(DiscountController);
    discountService = module.get<DiscountService>(DiscountService);
  });

  it('should be defined', () => {
    expect(discountController).toBeDefined();
  });

  describe('create', () => {
    it('should call discountService.create and return the result', async () => {
      const createDiscountDto: CreateDiscountDto = {
        discountName: 'Summer Sale',
        discountPercentage: 10,
        validFrom: new Date(),
        validTo: new Date(),
      };

      const result = { discountId: '123', ...createDiscountDto } as any;
      jest.spyOn(discountService, 'create').mockResolvedValue(result);

      expect(await discountController.create(createDiscountDto)).toBe(result);
      expect(discountService.create).toHaveBeenCalledWith(createDiscountDto);
    });
  });

  describe('findAll', () => {
    it('should call discountService.findAll and return the result', async () => {
      const qs = { limit: 10, currentPage: 1 };
      const result = { meta: {}, discounts: [] } as any;
      jest.spyOn(discountService, 'findAll').mockResolvedValue(result);

      expect(await discountController.findAll(qs)).toBe(result);
      expect(discountService.findAll).toHaveBeenCalledWith(qs);
    });
  });

  describe('findOne', () => {
    it('should call discountService.findOne and return the result', async () => {
      const discountCode = 'SUMMER10';
      const result = { discountCode, discountName: 'Summer Sale' } as any;
      jest.spyOn(discountService, 'findOne').mockResolvedValue(result);

      expect(await discountController.findOne(discountCode)).toBe(result);
      expect(discountService.findOne).toHaveBeenCalledWith(discountCode);
    });
  });

  describe('update', () => {
    it('should call discountService.update and return the result', async () => {
      const updateDiscountDto: UpdateDiscountDto = {
        discountName: 'Winter Sale',
        discountPercentage: 15,
        validFrom: new Date(),
        validTo: new Date(),
        discountStatus: DiscountStatus.Unavailable,
      } ;
      const discountId = '123';
      const result = { discountId, ...updateDiscountDto }as any;
      jest.spyOn(discountService, 'update').mockResolvedValue(result);

      expect(await discountController.update(discountId, updateDiscountDto)).toBe(result);
      expect(discountService.update).toHaveBeenCalledWith(discountId, updateDiscountDto);
    });
  });

  describe('remove', () => {
    it('should call discountService.remove and return the result', async () => {
      const discountId = '123';
      const result = { discountId }as any;
      jest.spyOn(discountService, 'remove').mockResolvedValue(result);

      expect(await discountController.remove(discountId)).toBe(result);
      expect(discountService.remove).toHaveBeenCalledWith(discountId);
    });
  });
});
