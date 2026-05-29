"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // CRITICAL SECURITY: Log out if she goes to the home screen or minimizes the app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleLogout();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleLogout);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleLogout);
    };
  }, []);

  // Fetch and Listen for Live Messages
  useEffect(() => {
    if (!isLoggedIn) return;

    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple custom authentication logic
    if (username === "i" && password === "gemba") {
      setCurrentUser("i");
      setIsLoggedIn(true);
    } else if (username === "user2" && password === "pass2") { 
      // Replace user2/pass2 with your own login details
      setCurrentUser("user2");
      setIsLoggedIn(true);
    } else {
      alert("Wrong credentials");
    }
  };

  const handleLogout = async () => {
    // Stealth feature: wipe all chat messages from the database when logging out
    if (currentUser) {
      await supabase.from("messages").delete().neq("sender", "none");
    }

    setIsLoggedIn(false);
    setCurrentUser("");
    setUsername("");
    setPassword("");
    setMessages([]);
  };

  const sendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from("messages").insert([
      { sender: currentUser, message_type: "text", content: newMessage },
    ]);
    setNewMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);
      
      // Save reference in DB
      await supabase.from("messages").insert([
        { sender: currentUser, message_type: type, content: data.publicUrl },
      ]);
    }
    setUploading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-xl border border-gray-800">
          <h2 className="mb-6 text-center text-xl font-semibold text-white tracking-wide">Secure Access</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3 w-full rounded-xl bg-gray-800 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 w-full rounded-xl bg-gray-800 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-3 font-semibold text-white transition hover:opacity-90">
            Enter Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white max-w-md mx-auto border-x border-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between bg-gray-900 p-4 border-b border-gray-800">
        <span className="font-medium text-pink-400">Us Only ❤️</span>
        <button onClick={handleLogout} className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-gray-400 hover:text-white">
          Lock
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUser;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl p-3 ${isMe ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-100"}`}>
                {msg.message_type === "text" && <p>{msg.content}</p>}
                {msg.message_type === "image" && <img src={msg.content} alt="Media" className="rounded-lg max-w-full" />}
                {msg.message_type === "audio" && <audio src={msg.content} controls className="w-full max-w-[200px]" />}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Inputs */}
      <footer className="bg-gray-900 p-4 border-t border-gray-800">
        <form onSubmit={sendTextMessage} className="flex items-center gap-2">
          <label className="cursor-pointer text-xl p-2 hover:bg-gray-800 rounded-full">
            📷
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} className="hidden" />
          </label>
          <label className="cursor-pointer text-xl p-2 hover:bg-gray-800 rounded-full">
            🎙️
            <input type="file" accept="audio/*" capture="user" onChange={(e) => handleFileUpload(e, "audio")} className="hidden" />
          </label>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-xl bg-gray-800 px-4 py-2 text-white focus:outline-none"
          />
          <button type="submit" className="rounded-xl bg-pink-600 px-4 py-2 font-medium">Send</button>
        </form>
      </footer>
    </div>
  );
}
