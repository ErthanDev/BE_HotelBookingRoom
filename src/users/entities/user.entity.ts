import { UserRole } from "src/enum/userRole.enum";
import { Column, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

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
    address: string;
    @Column({type:"enum",enum:UserRole,default:UserRole.Customer})
    role:UserRole;
    @Column({nullable: true,type:"text"})
    refreshToken:string;
}
