export default function generateRoomId(length: number) {
    let result = ""
    const characters = "QWERTYUIOPASDFGHJKLZXCVBNMqwrtyuiopzxcvbnm1234567890"
    for (let i = 0; i< length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}