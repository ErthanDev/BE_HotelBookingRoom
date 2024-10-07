import { Booking } from "src/module/booking/entities/booking.entity";
import { Utility } from "src/module/utility/entities/utility.entity";
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class BookingUtility {

    @PrimaryColumn({ type: "uuid" })
    @Generated("uuid")
    bookingUtilityId: string;

    @Column()
    quantity: number;

    @ManyToOne(() => Booking, booking => booking.bookingUtilities)
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @ManyToOne(() => Utility, utility => utility.bookingUtilities)
    @JoinColumn({ name: 'utilityId' })
    utility: Utility;
}
