const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const handler = require("../case")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        browser: ["BotPro", "Chrome", "1.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    // 🔥 SINGLE MESSAGE LOOP (clean)
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return

        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        try {
            await handler(sock, msg)
        } catch (err) {
            console.log("Handler error:", err)
        }
    })

    // 🔄 connection stable
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update

        if (connection === "open") {
            console.log("✅ Bot Connected")
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode

            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnecting...")
                startBot()
            } else {
                console.log("❌ Logged out")
            }
        }
    })
}

startBot()

module.exports = startBot
