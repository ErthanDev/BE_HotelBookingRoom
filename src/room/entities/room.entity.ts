import { Booking } from "src/booking/entities/booking.entity";
import { TypeRoom } from "src/type-room/entities/type-room.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Room {
    @PrimaryColumn()
    id: number;

    @Column()
    pricePerDay: number;

    @Column()
    pricePerHour: number;

    @Column()
    interior: string;

    @Column()
    image: string;

    @Column()
    facilities: string;

    @ManyToOne(() => TypeRoom, typeRoom => typeRoom.rooms)
    typeRoom: TypeRoom;

    @OneToMany(()=>Booking, booking => booking.room)
    bookings: Booking[];
}
