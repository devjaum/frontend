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
      <div style={{ padding: '20px' }}>
        <h1>Login</h1>
        <input
          placeholder="Seu nome"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleLogin}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Chat Online</h1>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <b>{msg.user}:</b> {msg.content}
          </div>
        ))}
      </div>

      <input
        placeholder="Mensagem"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
}

export default App;
