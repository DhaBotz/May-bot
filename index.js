const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const handler = require("./case")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return

        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        await handler(sock, msg)
    })

    console.log("Bot running...")
}

startBot()
