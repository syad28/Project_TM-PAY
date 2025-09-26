import { Exclude, Expose, Type } from 'class-transformer';

export class UserResponseDto {
    @Expose()
    id: number;

    @Expose()
    nama: string;

    @Expose()
    email: string;

    @Expose()
    no_hp: string;

    @Expose()
    password: string;

    @Expose()
    pin_transaksi: string;
}

export class TabunganResponseDto {

    @Expose()
    id: number;

    @Expose()
    nama: string;

    @Expose()
    target: string

    @Expose()
    progres: number;

    @Expose()
    deadline: Date;

    @Expose()
    status: string;
}

export class TransaksiResponseDto {
    @Expose()
    id: number;

    @Expose()
    jenis: string;

    @Expose()
    jumlah: number;

    @Expose()
    metode: string;

    @Expose()
    promo?: string;

    @Expose()
    keterangan?: string;

    @Expose()
    status: string;

    @Expose()
    tanggal: Date;

    @Expose()
    @Type(() => UserResponseDto)
    user: UserResponseDto;

    @Expose()
    @Type(() => TabunganResponseDto)
    tabungan?: TabunganResponseDto;

    @Expose()
    @Type(() => UserResponseDto)
    userTujuan?: UserResponseDto;
}


export class TransaksiListResponseDto {
    @Expose()
    @Type(() => TransaksiResponseDto)
    data: TransaksiResponseDto[];

    @Expose()
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export class TransaksiStatsResponseDto {
    @Expose()
    totalTransaksi: number;

    @Expose()
    totalSetor: number;

    @Expose()
    totalTarik: number;

    @Expose()
    totalTopup: number;

    @Expose()
    totalTransfer: number;

    @Expose()
    transaksiHariIni: number;

    @Expose()
    transaksiMingguIni: number;

    @Expose()
    transaksiBulanIni: number;
}