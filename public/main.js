const socket = io();

let username = '';
let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function getMsgDate() {
    let currentDate = new Date();

    return msgDate = currentDate.toLocaleString();
};

function renderUserList() {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';

    userList.forEach((user) => {
        ul.innerHTML += '<li>' + user + '</li>';
    });
}

function addMessage(type, user, msg) {
    let ul = document.querySelector('.chatList');

    switch (type) {
        case 'status':
            ul.innerHTML += '<li class="m-status">' + msg + '</li>';
            break;
        case 'msg':
            if (username == user) {
                ul.innerHTML += `<li class="m-txt"><span class="me">(${getMsgDate()}) - ${user}: </span>${msg}</li>`;
            } else {
                ul.innerHTML += `<li class="m-txt"><span>(${getMsgDate()}) - ${user}: </span>${msg}</li>`;
            }
            break;
    }

    // Faz com que o scroll fique sempre seguindo a última mensagem
    ul.scrollTop = ul.scrollHeight;
}

// Ao clicar no ENTER na tela de login
loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let name = loginInput.value.trim();
        if (name != '') {
            username = name;
            document.title = `Chat (${username})`;

            socket.emit('join-request', username);
        }
    }
});

// Ao clicar no ENTER na tela de mensagens
textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = '';

        if (txt != '') {
            socket.emit('send-msg', txt);
        }
    }
})

// Ouvindo o sinal "user-ok"
socket.on('user-ok', (serverUserList) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!');

    userList = serverUserList;
    renderUserList();
});

// Ouvindo o sinal "list-update"
socket.on('list-update', (data) => {
    if (data.joined) {
        addMessage('status', null, data.joined + ' entrou no chat.');
    }

    if (data.left) {
        addMessage('status', null, data.left + ' saiu do chat.');
    }

    userList = data.list;
    renderUserList();
});

// Ouvindo o sinal "show-msg"
socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

// Ouvindo o sinal "disconnect"
socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado!');
    userList = [];
    renderUserList();
});

// Ouvindo o sinal "reconnect_error"
socket.on('reconnect_error', () => {
    addMessage('status', null, 'Tentando reconectar...')
});

// Ouvindo o sinal "reconnect"
socket.on('reconnect', () => {
    addMessage('status', null, 'Reconectado!');
    
    if (username != '') {
        socket.emit('join-request', username);
    }
});