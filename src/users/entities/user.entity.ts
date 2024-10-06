import { Booking } from "src/booking/entities/booking.entity";
import { UserRole } from "src/enum/userRole.enum";
import { Column, Entity, Generated, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class User {
    @PrimaryColumn({type:"uuid"})
    @Generated("uuid")
    id: string;
    @Column({length: 50,})
    name: string;
    @Column()
    email: string;
    @Column()
    password: string;
    @Column({length:10})
    phoneNumber: string;
    @Column()
    gender: boolean;
    @Column()
    address: string;
    @Column({type:"enum",enum:UserRole,default:UserRole.Customer})
    role:UserRole;
    @Column({nullable: true,type:"text"})
    refreshToken:string;

    @OneToMany(()=>Booking, booking => booking.user)
    bookings: Booking[];
}
