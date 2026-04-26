const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const handler = require("./case")
const groupHandler = require("./case/group")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(".session/session")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        browser: ["Bot Kamu", "Chrome", "1.0.0"]
    })

    // save session
    sock.ev.on("creds.update", saveCreds)

    // ===== SATU EVENT UTAMA =====
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return

        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        try {
            await handler(sock, msg)
        } catch (err) {
            console.log("❌ Error:", err)
        }
    })

    // ===== GROUP EVENT =====
    sock.ev.on("group-participants.update", async (data) => {
        try {
            await groupHandler.welcome(sock, data)
        } catch (err) {
            console.log("❌ Group Error:", err)
        }
    })

    // ===== CONNECTION =====
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode

            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnecting...")
                startBot()
            } else {
                console.log("❌ Logout, scan ulang QR")
            }
        } else if (connection === "open") {
            console.log("✅ Bot connected")
        }
    })
}

startBot()
