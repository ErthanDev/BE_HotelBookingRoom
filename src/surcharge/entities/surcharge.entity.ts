import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity()
export class Surcharge {
    @PrimaryColumn({type:"uuid"})
    @Generated("uuid")
    surchargeId: string

    @Column()
    surchargeName: string

    @Column()
    surchargePercentage: number
}
