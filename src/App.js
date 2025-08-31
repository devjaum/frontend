import { useState, useEffect } from 'react';
import axios from 'axios';
import socket from './socket';

function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);
  const [showOnline, setShowOnline] = useState(false);

  // Receber mensagens
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user_joined', (data) => {
      setMessages((prev) => [
        ...prev,
        { user: 'Sistema', content: `${data.user} entrou no chat` },
      ]);
    });

    socket.on('user_left', (data) => {
      setMessages((prev) => [
        ...prev,
        { user: 'Sistema', content: `${data.user} saiu do chat` },
      ]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, []);

  // Atualizar lista de online sempre que mensagens mudarem
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    if (lastMsg.user === 'Sistema') {
      const regex = /^(.+?) (entrou|saiu) (no|do) chat$/;
      const match = lastMsg.content.match(regex);

      if (match) {
        const nome = match[1];
        const acao = match[2];

        if (acao === 'entrou') {
          setOnline((prev) =>
            prev.includes(nome) ? prev : [...prev, nome]
          );
        } else if (acao === 'saiu') {
          setOnline((prev) => prev.filter((n) => n !== nome));
        }
      }
    }
  }, [messages]);

  const handleLogin = async () => {
    if (!username) return;
    const BASE_URL = "https://backend-04cn.onrender.com";

    try {
      await axios.post(`${BASE_URL}/users/login`, { username });
      const res = await axios.get(`${BASE_URL}/users/online`);
      setOnline(res.data.map(user => user.username));
    } catch (error) {
      console.error(error);
    }
    setLoggedIn(true);
    socket.emit('login', { username });
  };

  const sendMessage = () => {
    if (!message) return;
    socket.emit('send_message', { content: message });
    setMessage('');
  };

  // apenas formatar mensagem do sistema
  const sistemChat = (content) => {
    const regex = /^(.+?) (entrou|saiu) (no|do) chat$/;
    const match = content.match(regex);

    if (match) {
      const nome = match[1];
      const acao = match[2];
      const chat = match[3] + ' chat';

      return (
        <div className="flex flex-row">
          <p className="text-red-500 font-bold mr-1">{nome}</p>
          <p
            className="mr-1"
            style={{
              color: acao === 'entrou' ? '#98FFAF' : '#F8FF82',
            }}
          >
            {acao}
          </p>
          <p className="text-gray-200">{chat}</p>
        </div>
      );
    }

    return content;
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center h-[100vh] justify-center bg-[#264048] text-[#A7FFFF] font-bold">
        <h1 className="text-3xl font-bold m-5">Login</h1>
        <input
          placeholder="Seu nome"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="bg-[#1A2B30] p-1 rounded-md"
        />
        <button
          onClick={handleLogin}
          className="m-5 pl-10 pr-10 pt-1 pb-1 bg-[#1A2B30] hover:bg-[#375E6A] rounded-md"
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-auto min-h-[100vh] justify-center bg-[#264048] font-bold text-[#A7FFFF]">
      <div className="flex flex-col w-[100%] items-end mr-5">
          <button
          onClick={() => setShowOnline((prev) => !prev)}
          className="px-4 py-2 bg-[#1A2B30] hover:bg-[#375E6A] rounded-md"
          >
            {showOnline ? "Esconder online" : "Mostrar online"}
        </button>

        {showOnline && (
          <div className="border w-[200px] bg-[#1E293B] rounded-xl p-2 mb-4">
            <h2 className="text-white font-bold mb-2">Online:</h2>
            <ul className="text-gray-200">
              {online.map((nome, index) => (
                <li key={index} className="py-1">
                  {nome}
                </li>
              ))}
            </ul>
          </div>)}
      </div>

      <h1 className="text-3xl font-bold m-5">Chat Online</h1>

      <div className="p-4 flex flex-col bg-[#1A2B30] border-[#375E6A] border w-[80%] sm:w-[50%] min-h-[50vh]">
        {messages.map((msg, idx) => (
          <div className="flex justify-center" key={idx}>
            {msg.user === 'Sistema' ? (
              <div className="flex flex-col items-center w-[100%]">
                <p className="text-[#ff5151] mr-2">{msg.user}:</p>
                <p className="break-words">{sistemChat(msg.content)}</p>
              </div>
            ) : msg.user === username ? (
              <div className="flex flex-row-reverse w-[100%]">
                <p className="text-[#21FF30] max-w-[75%] break-words bg-[#375E6A] min-w-[35%] text-end mb-2 rounded-2xl px-3 py-1">
                  {msg.content}
                </p>
              </div>
            ) : (
              <div className="flex flex-row w-[100%]">
                <div className='flex flex-row bg-[#264048] max-w-[75%] min-w-[35%] mb-2  rounded-2xl px-3 py-1'>
                  <p className="text-[#FFB7B4] mr-2">{msg.user}:</p>
                  <p className="max-w-[75%] break-words ">{msg.content}</p>
                </div>  
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-row">
        <input
          placeholder="Mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="bg-[#1A2B30] rounded-md text-[#A7FFFF] mt-5 mb-5 mr-0 pl-2 h-5"
        />
        <button
          onClick={sendMessage}
          className="h-6 w-6 mt-5 ml-2 bg-[#1A2B30] hover:bg-[#375E6A] rounded-full text-[#A7FFFF]"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

export default App;
