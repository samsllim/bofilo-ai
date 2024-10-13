import {db} from "./server/db";

console.log('starting test')

await db.test.create({
    data: {
        data: "test",
    },
});
console.log('added test')