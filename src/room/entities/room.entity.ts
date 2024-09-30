import { RoomStatus } from "src/enum/roomStatus.enum";
import { TypeRoom } from "src/type-room/entities/type-room.entity";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Room {
    @PrimaryColumn()
    id: number;

    @Column()
    pricePerDay: number;

    @Column()
    pricePerHour: number;

    @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.Available })
    status: RoomStatus;

    @Column()
    interior: string;

    @Column()
    image: string;

    @Column()
    facilities: string;

    @ManyToOne(() => TypeRoom, typeRoom => typeRoom.rooms)
    typeRoom: TypeRoom;
}
