import { PaymentMethod } from "src/enum/paymentMethod.enum";
import { PaymentStatus } from "src/enum/paymentStatus.enum";
import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity()
export class Payment {
    @PrimaryColumn({type:"uuid"})
    @Generated("uuid")
    paymentId: string;

    @Column()
    amount: number; 

    @Column({type:"timestamp", default: () => "CURRENT_TIMESTAMP"})
    paymentDate: Date;
    @Column({type:"enum", enum: PaymentStatus, default: PaymentStatus.Success})
    paymentStatus: PaymentStatus;

    @Column({type:"enum", enum: PaymentMethod})
    paymentMethod: PaymentMethod;
}
