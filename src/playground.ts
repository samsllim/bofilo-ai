import axios from "axios";
import Account from "@/lib/account";
import { db } from "@/server/db";
import { turndown } from "./lib/turndown";
import { OramaManager } from "./lib/orama";
import { getEmbeddings } from "./lib/embeddings";
import type { SyncUpdatedResponse, EmailMessage, EmailAddress, EmailAttachment, EmailHeader } from './types';


const emails: EmailMessage[] = await db.email.findMany({
    select: {
        subject: true,
        body: true,
        bodySnippet: true,
        from: { select: { address: true, name: true } },
        to: { select: { address: true, name: true } },
        sentAt: true,
        threadId: true
    }
});
const orama = new OramaManager('71789');

for (const email of emails) {
    const body = turndown.turndown(email.body ?? email.bodySnippet ?? '')
    const embeddings = await getEmbeddings(body);
    console.log(embeddings.length);

    await orama.initialize();
    // @ts-ignore
    await orama.insert({
        title: email.subject,
        body: body,
        rawBody: email.bodySnippet ?? '',
        from: email.from.address,
        to: email.to.map(t => `${t.name} <${t.address}>`),
        sentAt: new Date(email.sentAt).toLocaleString(),
        threadId: email.threadId,
        embeddings
    })
}
await orama.saveIndex();



// const account = new Account('7DpSEBvwPPZ2k9XgVLse2WofAaTZc9i6O5MIONM0KKM');
// await account.syncEmails();

// axios.post(`http://localhost:3000/api/initial-sync`, { accountId:'123', userId: 1 }).then((res) => {
//     console.log(res.data)
// }).catch((err) => {
//     console.log('enter waittil error')
//     console.log(err.response.data)
// })

