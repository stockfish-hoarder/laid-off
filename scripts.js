var defaultMessage = 'Hello! I\'m the world\'s smartest AI, designed to help you out. Ask me anything!'

var cD = {
    chats: 1,
    chatData: [
        {
            name: "Hello",
            messages: [
                defaultMessage
            ]
        }
    ]
}

const chars = [
    '?',
    'b',
    '=',
    '+',
    'c',
    '4',
    'n',
    '~',
    'd',
    'f',
    '5',
    '^',
    'y',
    '-',
    'x',
    '1',
    'h',
    '(',
    '@',
    '2',
    'p',
    '9',
    '0',
    'a',
    'j',
    'k',
    '3',
    'l',
    'm',
    '6',
    'i',
    '7',
    '/',
    '8',
    'o',
    'r',
    's',
    '&',
    't',
    'v',
    '%',
    'g',
    'w',
    'e',
    'z',
    '!',
    ':',
    'q',
    ' ',
    '.',
    ',',
    'u',
    '#',
]

var currentChat

var password

function decipher(text, password){
    var pass = []

    for(var i = 0; i < password.length; i++){
        pass.push(chars.indexOf(password.substring(i, i + 1)))
    }

    var cipher = []

    for(var i = 0; i < text.length; i++){
        let before = chars.indexOf(text.substring(i, i + 1))
        let after = (before - pass[i % pass.length] + chars.length) % chars.length

        cipher.push(chars[after])
    }

    return cipher.join('')
}

async function getResponse(prompt){
    const API_KEY = decipher("2 gcfuxt2=:ql7 @7m3/6j4h,8k%w,zswsjv=z6-s:@jv3:&t?hd+^z.q./?emxf/&+~^,txf", password)
    const MODEL_NAME = decipher("wf47cd~6.^c-4dzg.2w:oc%^,j2n.6hsp@-", password)
    const ENDPOINT = decipher("#d-e57~=%+-o4ds--g/:4=,44=!u=/v,a~l%^e=-y1f6w", password)

    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.href,
                "X-Title": "LLM Chat App"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        return data.choices[0].message.content;
    } catch (error) {
        window.close()
    }
}

window.addEventListener("load", () => {
    //load

    if(localStorage.getItem("aiPassword") === null || isPasswordExpired()){
        $("#status").text("You are not verified!")
    }else{
        password = localStorage.getItem("aiPassword")
     
        $("#status").text("You are verified")
        $("#status-button").show()
    }

    if(localStorage.getItem("aiSaved") !== null){
        cD = JSON.parse(localStorage.getItem("chatData"))
    }

    load(cD)
})

function promptPassword(){
    var temp = prompt("Password?")

    if(temp == ""){
        return
    }

    password = temp

    localStorage.setItem("aiPassword", password)
    localStorage.setItem("aiPasswordSetDate", new Date().toISOString())

    $("#status").text("You are verified!")
}

function isPasswordExpired() {
    const setDateStr = localStorage.getItem("aiPasswordSetDate")
    if (!setDateStr) return true;
    const setDate = new Date(setDateStr)
    const now = new Date()
    // Find the next Sunday after setDate
    const nextSunday = new Date(setDate)
    nextSunday.setDate(setDate.getDate() + (7 - setDate.getDay()))
    // If now is after or equal to next Sunday, password expired
    return now >= nextSunday;
}

function load(obj){
    let chats = obj.chats
    for(let i = 0; i < chats; i++){
        addChatMenu(cD.chatData[i].name, i)
    }

    openChat(0)
}

function openChat(chat){
    let chatObj = cD.chatData[chat].messages
    
    currentChat = chat

    $("#messages").html("")

    for(let i = 0; i < chatObj.length; i++){
        addChatMessage(chatObj[i], i % 2 == 0)
    }
}

function newChat(){
    cD.chatData.push({
        name: 'New Chat',
        messages: [
            defaultMessage
        ]
    })

    cD.chats ++

    save()

    addChatMenu('New Chat', cD.chatData.length - 1)
}

function changeName(number){
    var newName = prompt("New Name?")

    if(newName != ""){
        cD.chatData[number].name = newName
        $("#chat" + number).text(newName)
    }

    save()
}

function deleteChat(number){
    cD.chatData.splice(number, 1)
    cD.chats --
    save()

    $("#chat" + number).remove()
}

function addChatMenu(chatName, chatNumber){
    $("#sidebar").append(`<div><button id="chat${chatNumber}" onclick='openChat(${chatNumber})'>${chatName}
            <button onclick="changeName(${chatNumber})"><i class="material-symbols-outlined">edit</i></button>
            <button onclick="deleteChat(${chatNumber})"><i class="material-symbols-outlined">delete</i></button>
        </button>
    </div>`)
}

function addChatMessage(message, robot){
    var id = generateRandomHex(10)

    $("#messages").append(`
        <div class="message ${robot ? 'robot' : 'human'}" id="msg${id}">${message}
            
        </div>`)
    return id
}

function addChatMessageSave(message, robot){
    var id = generateRandomHex(10)

    $("#messages").append(`<div class="message ${robot ? 'robot loading' : 'human'}" id="msg${id}">${robot ? '' : message}</div>`)
    cD.chatData[currentChat].messages.push(message)

    save()

    return id
}

function generateRandomHex(length) {
    return [...Array(length)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
}

async function sendMessage(){
    let message = $("#message").val()
    
    if(message.length == ""){
        return
    }

    addChatMessageSave(message, false)

    $("#message").val("")

    var x = addChatMessage("", true)//stream response
    const v = $("#msg" + x)

    v.toggleClass("loading")

    let response = await getResponse(message)
    
    // let response = "Hey there, how can I help you? I can solve math problems, or I can even troll you."
    var response2 = marked.parse(response)

    cD.chatData[currentChat].messages.push(response2)

    save()
    
    //stream response
    var items = []
    var temp = ""

    for(let i = 0; i < response2.length; i++){
        temp += response2.substring(i, i + 1)
        if((i + 1) % 5 == 0){
            items.push(temp)
            temp = ""
        }
    }

    items.push(temp)

    let i = 0
    
    var c = ""

    v.removeClass('loading')
    const interval = setInterval(() => {
        c += items[i]
        v.html(c)

        // scroll to da bottom
        $("#messages").scrollTop($("#messages")[0].scrollHeight)

        i++

        if(i >= items.length){
            clearInterval(interval);
        }
    }, 30);
}

function save(){
    localStorage.setItem("aiSaved", true)
    localStorage.setItem("chatData", JSON.stringify(cD))

    console.log(cD)
}