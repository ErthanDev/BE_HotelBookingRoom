import { Payment } from "src/module/payment/entities/payment.entity";
import { Column, Entity, Generated, ManyToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Surcharge {
    @PrimaryColumn({ type: "uuid" })
    @Generated("uuid")
    surchargeId: string

    @Column()
    surchargeName: string

    @Column()
    surchargePercentage: number


}
