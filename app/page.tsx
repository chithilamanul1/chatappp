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
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check for saved session on load
  useEffect(() => {
    const savedUser = localStorage.getItem("chat_user");
    if (savedUser === "user2") {
      setCurrentUser("user2");
      setIsLoggedIn(true);
    }
  }, []);

  // CRITICAL SECURITY: Log out if she goes to the home screen or minimizes the app
  // This now ONLY applies to her ('i'), allowing you ('user2') to stay logged in
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && currentUser === "i") {
        handleLogout();
      }
    };

    const handlePageHide = () => {
      if (currentUser === "i") {
        handleLogout();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [currentUser]);

  // Online/Offline Presence Tracking
  useEffect(() => {
    if (!isLoggedIn) return;

    const roomOne = supabase.channel('presence-room');
    
    roomOne
      .on('presence', { event: 'sync' }, () => {
        const newState = roomOne.presenceState();
        const partnerId = currentUser === 'i' ? 'user2' : 'i';
        
        let online = false;
        for (const id in newState) {
          if (newState[id][0]?.user_id === partnerId) {
            online = true;
          }
        }
        setIsPartnerOnline(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await roomOne.track({ user_id: currentUser, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(roomOne);
    };
  }, [isLoggedIn, currentUser]);

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
      localStorage.setItem("chat_user", "user2"); // Save session for you
    } else {
      alert("Wrong credentials");
    }
  };

  const handleLogout = async () => {
    // Stealth feature: wipe all chat messages from the database when logging out
    if (currentUser) {
      await supabase.from("messages").delete().neq("sender", "none");
    }

    localStorage.removeItem("chat_user"); // Clear your saved session if you manually lock
    setIsLoggedIn(false);
    setCurrentUser("");
    setUsername("");
    setPassword("");
    setMessages([]);
  };

  const sendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage(""); // Clear input instantly

    const { data, error } = await supabase.from("messages").insert([
      { sender: currentUser, message_type: "text", content: text },
    ]).select();

    // Instantly show the message on your screen even if the realtime socket is slow
    if (data && data.length > 0) {
      setMessages((prev) => {
        // Check if realtime already added it
        if (prev.find(m => m.id === data[0].id)) return prev;
        return [...prev, data[0]];
      });
    }
  };

  const uploadFile = async (file: File, type: "image" | "audio") => {
    setUploading(true);
    const fileExt = file.name.split(".").pop() || "webm";
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);
      
      // Save reference in DB and instantly show
      const { data: insertData } = await supabase.from("messages").insert([
        { sender: currentUser, message_type: type, content: data.publicUrl },
      ]).select();

      if (insertData && insertData.length > 0) {
        setMessages((prev) => {
          if (prev.find(m => m.id === insertData[0].id)) return prev;
          return [...prev, insertData[0]];
        });
      }
    }
    setUploading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file, type);
  };

  // WhatsApp-style Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: "audio/webm" });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        await uploadFile(file, "audio");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access is required to send voice messages. Please allow microphone permissions in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-xl border border-gray-800">
          <h2 className="mb-6 text-center text-xl font-semibold text-white tracking-wide">Library Member Access</h2>
          <input
            type="text"
            placeholder="Library Card Number"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3 w-full rounded-xl bg-gray-800 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="PIN Code"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 w-full rounded-xl bg-gray-800 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-3 font-semibold text-white transition hover:opacity-90">
            Browse Books
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-gray-950 text-white max-w-md mx-auto sm:border-x border-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between bg-gray-900 p-3 sm:p-4 border-b border-gray-800">
        <div className="flex flex-col">
          <span className="font-medium text-blue-400">PDF E-Book Library</span>
          <span className="text-xs text-gray-400">
            {isPartnerOnline ? (
              <span className="text-green-400 font-medium">● Online</span>
            ) : (
              <span>○ Offline</span>
            )}
          </span>
        </div>
        <button onClick={handleLogout} className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-gray-400 hover:text-white">
          Sign Out
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUser;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 ${isMe ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"} break-words`}>
                {msg.message_type === "text" && <p>{msg.content}</p>}
                {msg.message_type === "image" && <img src={msg.content} alt="Media" className="rounded-lg max-w-full" />}
                {msg.message_type === "audio" && <audio src={msg.content} controls className="w-full max-w-[200px]" />}
                <span className={`block text-[10px] mt-1 opacity-70 ${isMe ? "text-right" : "text-left"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Inputs */}
      <footer className="bg-gray-900 p-2 sm:p-4 border-t border-gray-800">
        {isRecording ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-blue-600/20 border border-blue-500/30">
            <span className="text-blue-500 font-medium flex items-center gap-3 px-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              Audio Search...
            </span>
            <button 
              type="button" 
              onClick={stopRecording} 
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap text-white"
            >
              Search
            </button>
          </div>
        ) : (
          <form onSubmit={sendTextMessage} className="flex items-center gap-1 sm:gap-2">
            <label className="cursor-pointer text-lg sm:text-xl p-1 sm:p-2 hover:bg-gray-800 rounded-full flex-shrink-0 transition-colors">
              📷
              <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, "image")} className="hidden" />
            </label>
            <button 
              type="button" 
              onClick={startRecording}
              className="cursor-pointer text-lg sm:text-xl p-1 sm:p-2 hover:bg-gray-800 rounded-full flex-shrink-0 transition-colors"
            >
              🎙️
            </button>
            <input
              type="text"
              placeholder="Search ISBN or Book Title..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 min-w-0 rounded-xl bg-gray-800 px-3 py-2 text-sm sm:text-base text-white focus:outline-none"
            />
            <button type="submit" disabled={uploading} className="rounded-xl bg-blue-600 px-3 py-2 text-sm sm:text-base font-medium whitespace-nowrap flex-shrink-0 transition hover:bg-blue-500 disabled:opacity-50">
              {uploading ? "..." : "Search"}
            </button>
          </form>
        )}
      </footer>
    </div>
  );
}
