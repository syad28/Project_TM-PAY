const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.user.create({
        data: {
            id: 1,
            nama: "melin",
            email: "testesr@gmail.com",
            no_hp: "08888888",
            password: "123",
            saldo: "50000",
            role: "user",
            pin_transaksi: "123123",

            id: 2,
            nama: "syad",
            email: "tssssssr@gmail.com",
            no_hp: "0888288",
            password: "123",
            saldo: "50000",
            role: "user",
            pin_transaksi: "123123"
        },
    });

}

main()
    .then(() => {
        console.log('Seeding selesai!');
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });