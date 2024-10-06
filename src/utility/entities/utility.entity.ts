import { BookingUtility } from "src/booking-utility/entities/booking-utility.entity";
import { Column, Entity, Generated, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Utility {
    @PrimaryColumn({type:"uuid"})
    @Generated("uuid")
    utilityId: string;

    @Column()
    utilityName: string;

    @Column()
    utilityPrice: number;

    @OneToMany(()=> BookingUtility, bookingUtility => bookingUtility.utility)
    bookingUtilities: BookingUtility[];
}
