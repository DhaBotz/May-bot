const ai = require("./ai")
const menu = require("./menu")
const promo = require("./promo")

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid

    const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ""

    const body = text.toLowerCase().trim()

    const cmd = body.split(" ")[0]

    // =====================
    // ROUTER PRO CLEAN
    // =====================
    const routes = {
        menu: menu,
        ai: ai,
        promo: promo
    }

    if (routes[cmd]) {
        return routes[cmd](sock, msg)
    }

    // optional auto reply
    if (body === "halo") {
        return sock.sendMessage(from, { text: "Halo juga 👋" })
    }
}
