import { DiscountStatus } from "src/enum/discountStatus.enum";
import { Payment } from "src/module/payment/entities/payment.entity";
import { Column, Entity, Generated, JoinColumn, ManyToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Discount {
    @PrimaryColumn({ type: "uuid" })
    @Generated("uuid")
    discountId: string;

    @Column({ unique: true })
    @Generated("uuid")
    discountCode: string;

    @Column()
    discountName: string;

    @Column()
    discountPercentage: number;

    @Column({ type: "enum", enum: DiscountStatus, default: DiscountStatus.Available })
    discountStatus: DiscountStatus;

    @Column()
    validFrom: Date;

    @Column()
    validTo: Date;

}

