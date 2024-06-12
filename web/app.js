const chatInput = document.querySelector('.chat-input');
const chatWindow = document.querySelector('.chat-window');

const baseUrl = "http://localhost:3000"

const sendData = async () => {
    const res = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            msg: chatInput.value
        })
    })
    if (!res.ok) {
        throw new Error("Something went wrong")
    }
    const json = await res.json()
    const data = json.data
    chatWindow.innerHTML += `<br><h4>Chatbot: ${data.msg}</h4>`
}

function myFunc() {
    chatWindow.innerHTML += `<br><h4>User: ${chatInput.value}</h4>`
    sendData()
    chatInput.value = ""
}
