import { Room } from "src/module/room/entities/room.entity";
import { Column, Entity, Generated, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class TypeRoom {
    @PrimaryColumn({ type: "uuid" })
    @Generated("uuid")
    id: string;

    @Column({ length: 50, })
    name: string;

    @Column({ type: "text" })
    introduction: string;

    @Column({ type: "text" })
    highlight: string;

    @Column()
    sizeRoom: number;

    @Column()
    beds: string;

    @Column()
    maxPeople: number;

    @Column({ type: "text" })
    image: string;

    @OneToMany(() => Room, room => room.typeRoom, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    rooms: Room[];
}
