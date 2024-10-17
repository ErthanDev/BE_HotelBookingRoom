import { BookingUtility } from "src/module/booking-utility/entities/booking-utility.entity";
import { BookingStatus } from "src/enum/bookingStatus.enum";
import { TypeBooking } from "src/enum/typeBooking.enum";
import { Payment } from "src/module/payment/entities/payment.entity";
import { Room } from "src/module/room/entities/room.entity";
import { User } from "src/module/users/entities/user.entity";
import { Column, Entity, Generated, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Review } from "src/module/reviews/entities/review.entity";

@Entity()
export class Booking {
    @PrimaryColumn({ type: "uuid" })
    @Generated("uuid")
    bookingId: string;

    @Column({ type: 'datetime' })
    startTime: Date;

    @Column({ type: 'datetime' })
    endTime: Date;

    @Column({ type: "enum", enum: TypeBooking })
    bookingType: TypeBooking;

    @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.Unpaid })
    bookingStatus: BookingStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    bookingDate: Date;

    @Column({ type: 'int' })
    numberOfGuest: number;

    @ManyToOne(() => User, user => user.bookings,{nullable:true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    user: User

    @ManyToOne(() => Room, room => room.bookings,{ onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    room: Room;

    @OneToMany(() => Payment, payment => payment.booking,{ onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    payments: Payment[];

    @OneToMany(() => BookingUtility, bookingUtility => bookingUtility.booking,{ onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    bookingUtilities: BookingUtility[];

    @OneToOne(()=>Review, review=>review.booking,{ onDelete: 'SET NULL', onUpdate: 'CASCADE' }) 
    review: Review;


}
