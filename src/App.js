import { useState, useEffect } from 'react';
import axios from 'axios';
import socket from './socket';

function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Receber mensagens
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user_joined', (data) => {
      setMessages((prev) => [...prev, { user: 'Sistema', content: `${data.user} entrou no chat` }]);
    });

    socket.on('user_left', (data) => {
      setMessages((prev) => [...prev, { user: 'Sistema', content: `${data.user} saiu do chat` }]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, []);

  const handleLogin = async () => {
    if (!username) return;
    // chama backend para criar ou recuperar usuário
    const BASE_URL = 'https://backend-04cn.onrender.com';

    try {
      const response = await axios.post(`${BASE_URL}/users/login`, { username });
      console.log(response.data);
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

  if (!loggedIn) {
    return (
      <div className='flex flex-col items-center h-[100vh] justify-center bg-[#264048] text-[#A7FFFF] font-bold'>
        <h1 className='text-3xl font-bold m-5'>Login</h1>
        <input
          placeholder="Seu nome"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className='bg-[#1A2B30] p-1 rounded-md'
        />
        <button onClick={handleLogin} className='m-5 pl-10 pr-10 pt-1 pb-1 bg-[#1A2B30] hover:bg-[#375E6A] rounded-md'>Entrar</button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center h-[100vh] justify-center bg-[#264048] font-bold text-[#A7FFFF]'>
      <h1  className='text-3xl font-bold m-5'>Chat Online</h1>

      <div className='p-4 w-[50%]'>
        {messages.map((msg, idx) => (
          <div className='flex flex-row'key={idx}>
            {msg.user === "Sistema" ? (
              <div className='flex w-[100%] justify-center '>
                <p className='text-[#ff5151] mr-2'>
                  {msg.user}:
                </p>
                <p>
                  {msg.content}
                </p>
              </div>
            ):
            (msg.user === username) ? (
              <div className='flex flex-row-reverse w-[100%]'>
                <p className='text-[#21FF30] max-w-[75%]  break-words'>
                  {msg.content}
                </p>
              </div>
            ):(
              <div className='flex flex-row'>
                <p className='text-[#FFB7B4] mr-2'>{msg.user}:</p>
                <p className='max-w-[75%]  break-words'>{msg.content}</p>
              </div>
            )
            }
          </div>
        ))}
      </div>
      <div>
        <input
          placeholder="Mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className='bg-[#1A2B30] p-1 rounded-md text-[#A7FFFF] m-5'
        />
        <button onClick={sendMessage} className='m-5 pl-10 pr-10 pt-1 pb-1 bg-[#1A2B30] hover:bg-[#375E6A] rounded-md text-[#A7FFFF]'>{">"}</button>
      </div>
    </div>
  );
}

export default App;
