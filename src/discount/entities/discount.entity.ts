import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()  
export class Discount {
    @PrimaryColumn()
    discountId: number;

    @Column()
    discountName: string;

    @Column()
    discountPercentage: number;
}
