import { Booking } from "src/module/booking/entities/booking.entity";
import { User } from "src/module/users/entities/user.entity";
import { Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Review {
    @PrimaryColumn({ type: "uuid" })
    @Generated("uuid")
    reviewId: string;

    @Column({ type: "int", })
    rating: number;

    @Column({ type: "text", })
    comment: string;

    @OneToOne(() => Booking, booking => booking.review)
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @OneToOne(() => User, user => user.review)
    @JoinColumn({ name: 'userId' })
    user: User;
}
