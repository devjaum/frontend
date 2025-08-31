import { useState, useEffect } from "react";
import axios from "axios";
import socket from "./socket";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function ChatApp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);
  const [showOnline, setShowOnline] = useState(false);

  const BASE_URL = "http://localhost:3001"; // <- ajuste se for backend deployado

  // Receber mensagens
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

  // Heartbeat
  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(() => {
      socket.emit("heartbeat", username);
    }, 10000);

    return () => clearInterval(interval);
  }, [loggedIn, username]);

  // Atualizar lista de online
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

  // Login normal
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

  // Registro
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

  // Login com Google
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/google-login`, {
        token: credentialResponse.credential,
      });
      setUsername(res.data.username);
      setLoggedIn(true);
      socket.emit("login", { username: res.data.username });
    } catch (err) {
      console.error(err);
      alert("Erro no login com Google");
    }
  };

  const sendMessage = () => {
    if (!message) return;
    socket.emit("send_message", { content: message });
    setMessage("");
  };

  // formatação mensagem sistema
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
      <GoogleOAuthProvider clientId="SUA_GOOGLE_CLIENT_ID">
        <div className="flex flex-col items-center h-[100vh] justify-center bg-[#264048] text-[#A7FFFF] font-bold">
          <h1 className="text-3xl font-bold m-5">Login</h1>

          <input
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#1A2B30] p-1 m-1 rounded-md"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#1A2B30] p-1 m-1 rounded-md"
          />

          <div className="flex gap-3">
            <button
              onClick={handleLogin}
              className="m-2 px-4 py-1 bg-[#1A2B30] hover:bg-[#375E6A] rounded-md"
            >
              Entrar
            </button>
            <button
              onClick={handleRegister}
              className="m-2 px-4 py-1 bg-[#1A2B30] hover:bg-[#375E6A] rounded-md"
            >
              Registrar
            </button>
          </div>

          <div className="mt-4">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => alert("Erro ao logar com Google")}
            />
          </div>
        </div>
      </GoogleOAuthProvider>
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
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold m-5">Chat Online</h1>

      <div className="p-4 flex flex-col bg-[#1A2B30] border-[#375E6A] border w-[80%] sm:w-[50%] min-h-[50vh]">
        {messages.map((msg, idx) => (
          <div className="flex justify-center" key={idx}>
            {msg.user === "Sistema" ? (
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
                <div className="flex flex-row bg-[#264048] max-w-[75%] min-w-[35%] mb-2  rounded-2xl px-3 py-1">
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

export default ChatApp;
