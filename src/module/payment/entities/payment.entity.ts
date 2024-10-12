import { Booking } from "src/module/booking/entities/booking.entity";
import { Discount } from "src/module/discount/entities/discount.entity";
import { PaymentMethod } from "src/enum/paymentMethod.enum";
import { PaymentStatus } from "src/enum/paymentStatus.enum";
import { Surcharge } from "src/module/surcharge/entities/surcharge.entity";
import { Column, Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Payment {
    @PrimaryColumn({ type: "uuid" })
    @Generated("uuid")
    paymentId: string;

    @Column()
    amount: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    paymentDate: Date;
    @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.Success })
    paymentStatus: PaymentStatus;

    @Column({ type: "enum", enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @ManyToOne(() => Booking, booking => booking.payments,{ onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;


}
