import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { Like, Repository } from 'typeorm';
import { BookingStatus } from 'src/enum/bookingStatus.enum';
import { IUser } from '../users/user.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,

  ) { }
  async create(createReviewDto: CreateReviewDto) {
    const { rating, comment, bookingId } = createReviewDto;
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: bookingId },
      relations: ['user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    booking.bookingStatus = BookingStatus.Reviewed;
    await this.bookingRepository.save(booking);

    const review = this.reviewRepository.create({
      rating,
      comment,
      booking,
      user: booking.user,
    });
    const savedReview = await this.reviewRepository.save(review);

    return savedReview
  }

  async findAll(qs: any) {
    const totalItems = await this.reviewRepository.count();

    const take = qs.limit ? +qs.limit : totalItems; // Lấy tất cả bản ghi nếu qs.limit rỗng

    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const keyword = qs.keyword || '';
    const defaultLimit = +qs.limit ? +qs.limit : 10;
  
  
    const totalPages = Math.ceil(totalItems / defaultLimit);
  
    const [reviews, total] = await this.reviewRepository.findAndCount({
      take: take || totalItems,
      skip: skip,
      relations: ['user', 'booking'],
    });
  
    // Mapping response giống như trong hàm `create`
    const mappedReviews = reviews.map(review => ({
      rating: review.rating,
      comment: review.comment,
      booking: {
        bookingId: review.booking.bookingId,
        startTime: review.booking.startTime,
        endTime: review.booking.endTime,
        bookingType: review.booking.bookingType,
        bookingStatus: review.booking.bookingStatus,
        bookingDate: review.booking.bookingDate,
        numberOfGuest: review.booking.numberOfGuest,
      },
      user: {
        id: review.user.id,
        name: review.user.name,
      },
      reviewId: review.reviewId,
    }));
  
    return {
      meta: {
        current: +qs.currentPage || 1,
        pageSize: +qs.limit,
        pages: totalPages,
        total: total,
      },
      result: mappedReviews,
    };
  }
  
  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
