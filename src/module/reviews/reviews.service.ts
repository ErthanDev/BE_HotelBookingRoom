import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { Repository } from 'typeorm';
import { BookingStatus } from 'src/enum/bookingStatus.enum';

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

    return {
      rating: savedReview.rating,
      comment: savedReview.comment,
      booking: {
        bookingId: savedReview.booking.bookingId,
        startTime: savedReview.booking.startTime,
        endTime: savedReview.booking.endTime,
        bookingType: savedReview.booking.bookingType,
        bookingStatus: savedReview.booking.bookingStatus,
        bookingDate: savedReview.booking.bookingDate,
        numberOfGuest: 2,
      },
      user: {
        id: savedReview.user.id,
        name: savedReview.user.name,

      },
      reviewId: savedReview.reviewId,
    };
  }

  findAll() {
    return `This action returns all reviews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
