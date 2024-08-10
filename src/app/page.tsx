"use client";

import { useState, useCallback } from "react";

interface Message {
  role: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm the Jakhongirav's Support Agent, how can I assist you today?",
    },
  ]);

  const [message, setMessage] = useState<string>("");

  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: message.trim() },
    ];

    setMessages(newMessages);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessages),
      });

      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = (await reader?.read()) || {};
        if (done) break;

        const text = decoder.decode(value, { stream: true });

        setMessages((currentMessages) => {
          const lastMessage = currentMessages[currentMessages.length - 1];
          return [
            ...currentMessages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [message, messages]);

  return (
    <main className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col border border-black p-2 gap-2 h-[700px] w-[600px]">
        <div className="flex flex-col gap-2 flex-grow overflow-auto max-h-full">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`${msg.role === "assistant" ? "bg-sky-600" : "bg-emerald-400"} text-white rounded-2xl p-3`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full items-center gap-1">
          <input
            className="w-full p-2 border border-gray-500 rounded focus:outline-none"
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
