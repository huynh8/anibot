import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity({name: "users"})
export class User {
    @PrimaryColumn()
    private id: string;

    @Column({name: "anilist_id"})
    private _anilistId: number;

    constructor(id: string, anilistId: number) {
        this.id = id;
        this._anilistId = anilistId;
    }

    get anilistId(): number {
        return this._anilistId;
    }
}