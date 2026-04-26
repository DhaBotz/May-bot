const axios = require("axios")

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid

    const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ""

    const q = text.split(" ").slice(1).join(" ")

    if (!q) {
        return sock.sendMessage(from, { text: "Tanya apa?" })
    }

    try {
        const res = await axios.get(
            `https://api.affiliateplus.xyz/api/chatbot?message=${q}`
        )

        return sock.sendMessage(from, { text: res.data.message })
    } catch {
        return sock.sendMessage(from, { text: "AI error" })
    }
}
