import { useState, useEffect } from "react";
import axios from "axios";
import socket from "./socket";


function ChatApp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);
  const [showOnline, setShowOnline] = useState(false);

  const BASE_URL = "https://backend-04cn.onrender.com";

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", (data) => {
      setMessages((prev) => [
        ...prev,
        { user: "Sistema", content: `${data.user} entrou no chat` },
      ]);
    });

    socket.on("user_left", (data) => {
      setMessages((prev) => [
        ...prev,
        { user: "Sistema", content: `${data.user} saiu do chat` },
      ]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(() => {
      socket.emit("heartbeat", username);
    }, 10000);

    return () => clearInterval(interval);
  }, [loggedIn, username]);

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.user === "Sistema") {
      const regex = /^(.+?) (entrou|saiu) (no|do) chat$/;
      const match = lastMsg.content.match(regex);

      if (match) {
        const nome = match[1];
        const acao = match[2];

        if (acao === "entrou") {
          setOnline((prev) =>
            prev.includes(nome) ? prev : [...prev, nome]
          );
        } else if (acao === "saiu") {
          setOnline((prev) => prev.filter((n) => n !== nome));
        }
      }
    }
  }, [messages]);

  const handleLogin = async () => {
    if (!username || !password) return;

    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
      });
      const res = await axios.get(`${BASE_URL}/users/online`);
      setOnline(res.data.map((user) => user.username));
      setLoggedIn(true);
      socket.emit("login", { username });
    } catch (err) {
      alert("Erro ao logar");
    }
  };

  const handleRegister = async () => {
    if (!username || !password) return;
    let email = username;
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        username,
        password,
        email
      });
      alert("Usuário registrado! Agora faça login.");
    } catch (err) {
      alert("Erro ao registrar");
    }
  };



  const sendMessage = () => {
    if (!message) return;
    socket.emit("send_message", { content: message });
    setMessage("");
  };

  const sistemChat = (content) => {
    const regex = /^(.+?) (entrou|saiu) (no|do) chat$/;
    const match = content.match(regex);

    if (match) {
      const nome = match[1];
      const acao = match[2];
      const chat = match[3] + " chat";

      return (
        <div className="flex flex-row">
          <p className="text-red-500 font-bold mr-1">{nome}</p>
          <p
            className="mr-1"
            style={{
              color: acao === "entrou" ? "#98FFAF" : "#F8FF82",
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
        <div 
          style={{backgroundImage: "url('/doodlePatternD.png')"}}
          className="flex flex-col items-center h-[100vh] justify-center bg-[#264048] text-[#A7FFFF] font-bold bg-[size:55%]">
          <div className="flex flex-col backdrop-blur-md w-[85%] sm:w-[25%] items-center">
            <h1 className="text-3xl font-bold m-5">Login</h1>
            <input
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#1A2B30] p-1 m-1 rounded-md w-[65%]"
            />
            <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#1A2B30] p-1 m-1 rounded-md w-[65%]"
            />

            <div className="flex gap-3">
            <button
            onClick={handleLogin}
            className="m-2 px-4 py-1 bg-[#1A2B30] hover:bg-[#375E6A] rounded-md mb-5"
            >
            Entrar
            </button>
            <button
            onClick={handleRegister}
            className="m-2 px-4 py-1 bg-[#1A2B30] hover:bg-[#375E6A] rounded-md mb-5"
            >
            Registrar
</button>
              </div>
          </div>
        </div>
    );
  }

  return (
    <div 
      style={{backgroundImage: "url('/doodlePatternD.png')"}}
      className="flex flex-col items-center h-auto min-h-[100vh] justify-center bg-[#264048] font-bold text-[#A7FFFF] bg-[size:50%]">
      <div className="flex flex-row w-[100%] justify-center items-center mr-5">
        <button
          onClick={() => setShowOnline((prev) => !prev)}
          className="px-4 py-2 backdrop-blur-lg hover:bg-[#375E6A] rounded-md max-h-[40px]"
        >
          {showOnline ? "Esconder online" : "Mostrar online"}
        </button>

        {showOnline && (
          <div className="border w-[200px] backdrop-blur-sm rounded-xl p-2 text-center">
            <h2 className="text-white font-bold mb-2">Online:</h2>
            <ul className="text-gray-200">
              {online.map((nome, index) => (
                <li key={index} className="py-1">
                  {nome}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold m-3 backdrop-blur-lg">Chat Online</h1>

      <div 
        className="p-4 flex flex-col bg-[#1A2B30]/50 backdrop-blur-sm border-[#375E6A] border w-[80%] sm:w-[80%] max-h-[50vh] overflow-y-auto ">
        {messages.map((msg, idx) => (
          <div className="flex justify-center" key={idx}>
            {msg.user === "Sistema" ? (
              <div className="flex flex-col items-center w-[100%]">
                <div className="backdrop-blur-lg px-2 flex mb-5">
                  <p className="text-[#ff5151] mr-2">{msg.user}:</p>
                  <p className="break-words">{sistemChat(msg.content)}</p>
                </div>
              </div>
            ) : msg.user === username ? (
              <div className="flex flex-row-reverse w-[100%]">
                <p className="text-[#21FF30] max-w-[75%] break-words bg-[#375E6A] min-w-[35%] text-end mb-2 rounded-l-3xl px-3 pb-3 pt-1 rounded-tr-3xl ">
                  {msg.content}
                </p>
              </div>
            ) : (
              <div className="flex flex-row w-[100%]">
                <div className="flex flex-row bg-[#264048] max-w-[75%] min-w-[35%] mb-2 rounded-r-3xl px-3 pb-3 pt-1 rounded-tl-3xl py-1">
                  <p className="text-[#FFB7B4] mr-2">{msg.user}:</p>
                  <p className="max-w-[75%] break-words ">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-row items-center">
        <input
          placeholder="Mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="bg-[#1A2B30] rounded-md text-[#A7FFFF] mx-3 py-1 px-3 my-2"
        />
        <button
          onClick={sendMessage}
          className="mx-3 py-1 px-3 my-2 bg-[#1A2B30] hover:bg-[#375E6A] rounded-full text-[#A7FFFF]"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

export default ChatApp;
