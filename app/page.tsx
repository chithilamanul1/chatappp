"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

// Custom Instagram-style Audio Player
const CustomAudioPlayer = ({ src, isMe }: { src: string, isMe: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      if (audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const setAudioEnd = () => { setIsPlaying(false); setCurrentTime(0); };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', setAudioEnd);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', setAudioEnd);
    }
  }, []);

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 && duration !== Infinity ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0 && duration !== Infinity) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - bounds.left) / bounds.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  return (
    <div className={`flex items-center gap-3 p-2 rounded-2xl ${isMe ? "bg-blue-700/50" : "bg-gray-700/50"} w-[220px] sm:w-[260px] my-1`}>
      <button 
        onClick={togglePlay} 
        className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white shadow-md hover:bg-blue-400 transition"
      >
        {isPlaying ? (
          <span className="w-3 h-3 bg-white rounded-sm"></span>
        ) : (
          <span className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent"></span>
        )}
      </button>
      
      <div className="flex-1 flex flex-col justify-center">
        <div 
          className="w-full h-1.5 bg-gray-400/30 rounded-full overflow-hidden mb-1.5 relative cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-200 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 && duration !== Infinity ? formatTime(duration) : "Voice"}</span>
        </div>
      </div>

      <audio ref={audioRef} src={src} className="hidden" preload="metadata" />
    </div>
  );
};

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [chatPartner, setChatPartner] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [partnerIp, setPartnerIp] = useState("");
  const [partnerLocation, setPartnerLocation] = useState("");
  const [myIp, setMyIp] = useState("");
  const [myLocation, setMyLocation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const [showInfoForMsg, setShowInfoForMsg] = useState<any | null>(null);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch my IP and Location
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.ip) setMyIp(data.ip);
        if (data.city) setMyLocation(`${data.city}, ${data.country_name}`);
      })
      .catch(console.error);
  }, []);

  // Check for saved session on load
  useEffect(() => {
    const savedUser = localStorage.getItem("chat_user");
    if (savedUser === "user2") {
      setCurrentUser("user2");
      setChatPartner("i");
      setRoom("room1");
      setIsLoggedIn(true);
    } else if (savedUser === "alex") {
      setCurrentUser("alex");
      setChatPartner("sarah");
      setRoom("room2");
      setIsLoggedIn(true);
    }
  }, []);

  // CRITICAL SECURITY: Log out if she goes to the home screen or minimizes the app
  // This now ONLY applies to the girls ('i' and 'sarah'), allowing guys to stay logged in
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && (currentUser === "i" || currentUser === "sarah")) {
        handleLogout();
      }
    };

    const handlePageHide = () => {
      if (currentUser === "i" || currentUser === "sarah") {
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
    if (!isLoggedIn || !room) return;

    const presenceChannel = supabase.channel(`presence-${room}`);
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        
        let online = false;
        let pIp = "";
        let pLoc = "";
        
        for (const id in newState) {
          const stateData: any = newState[id][0];
          if (stateData?.user_id === chatPartner) {
            online = true;
            pIp = stateData.ip || "";
            pLoc = stateData.location || "";
          }
        }
        setIsPartnerOnline(online);
        setPartnerIp(pIp);
        setPartnerLocation(pLoc);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ 
            user_id: currentUser, 
            online_at: new Date().toISOString(),
            ip: myIp,
            location: myLocation
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [isLoggedIn, currentUser, chatPartner, room, myIp, myLocation]);

  // Fetch and Listen for Live Messages
  useEffect(() => {
    if (!isLoggedIn || !chatPartner) return;

    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .in("sender", [currentUser, chatPartner])
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`db-changes-${room}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const sender = payload.new.sender;
            if (sender === currentUser || sender === chatPartner) {
              setMessages((prev) => {
                if (prev.find(m => m.id === payload.new.id)) return prev;
                return [...prev, payload.new];
              });
            }
          }
          if (payload.eventType === "UPDATE") {
            const sender = payload.new.sender;
            if (sender === currentUser || sender === chatPartner) {
              setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
            }
          }
          if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn, currentUser, chatPartner, room]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark incoming messages as read
  useEffect(() => {
    if (!isLoggedIn || messages.length === 0) return;

    const unreadMessages = messages.filter((m) => m.sender !== currentUser && !m.read);

    if (unreadMessages.length > 0) {
      const markAsRead = async () => {
        const unreadIds = unreadMessages.map(m => m.id);
        const now = new Date().toISOString();
        
        // Optimistically update local state so we don't spam the database
        setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, read: true, read_at: now, read_by_ip: myIp } : m));

        await supabase
          .from("messages")
          .update({ read: true, read_at: now, read_by_ip: myIp })
          .in('id', unreadIds);
      };
      markAsRead();
    }
  }, [messages, isLoggedIn, currentUser]);

  const previousOnlineRef = useRef(isPartnerOnline);

  // Request Notification Permission on Login
  useEffect(() => {
    if (isLoggedIn && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, [isLoggedIn]);

  // Trigger Notification when partner comes online
  useEffect(() => {
    if (isPartnerOnline && !previousOnlineRef.current) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Library Member Online", {
          body: "A member has just connected to the study portal.",
        });
      }
    }
    previousOnlineRef.current = isPartnerOnline;
  }, [isPartnerOnline]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "i" && password === "gemba") {
      setCurrentUser("i");
      setChatPartner("user2");
      setRoom("room1");
      setIsLoggedIn(true);
    } else if (username === "user2" && password === "pass2") { 
      setCurrentUser("user2");
      setChatPartner("i");
      setRoom("room1");
      setIsLoggedIn(true);
      localStorage.setItem("chat_user", "user2"); 
    } else if (username === "sarah" && password === "pass123") {
      setCurrentUser("sarah");
      setChatPartner("alex");
      setRoom("room2");
      setIsLoggedIn(true);
    } else if (username === "alex" && password === "pass123") {
      setCurrentUser("alex");
      setChatPartner("sarah");
      setRoom("room2");
      setIsLoggedIn(true);
      localStorage.setItem("chat_user", "alex"); 
    } else {
      alert("Wrong credentials");
    }
  };

  const handleLogout = async () => {
    // Stealth feature: wipe chat messages from the database when logging out
    if (currentUser && chatPartner) {
      await supabase.from("messages").delete().in("sender", [currentUser, chatPartner]);
    }

    localStorage.removeItem("chat_user"); 
    setIsLoggedIn(false);
    setCurrentUser("");
    setChatPartner("");
    setRoom("");
    setUsername("");
    setPassword("");
    setMessages([]);
  };

  const handleDeleteMessage = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    setActiveMsgId(null);
  };

  const handleViewOnce = async (msg: any) => {
    setFullscreenImage(msg.content);
    await supabase.from("messages").delete().eq("id", msg.id);
  };

  const sendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage(""); // Clear input instantly

    const { data, error } = await supabase.from("messages").insert([
      { sender: currentUser, message_type: "text", content: text, read: false },
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
        { sender: currentUser, message_type: type, content: data.publicUrl, read: false },
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
    const finalType = (type === "image" && isViewOnce) ? "image_once" : type;
    await uploadFile(file, finalType as any);
    setIsViewOnce(false); // Reset after sending
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
          <div className="text-xs text-gray-400 flex flex-col mt-0.5">
            {isPartnerOnline ? (
              <>
                <span className="text-green-400 font-medium">● Online</span>
                {(partnerIp || partnerLocation) && (
                  <span className="text-[9px] opacity-70 mt-0.5">{partnerIp} • {partnerLocation}</span>
                )}
              </>
            ) : (
              <span>○ Offline</span>
            )}
          </div>
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
              <div 
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 ${isMe ? "bg-blue-600 text-white cursor-pointer" : "bg-gray-800 text-gray-100"} break-words transition-all`}
                onClick={() => { if (isMe) setActiveMsgId(activeMsgId === msg.id ? null : msg.id); }}
              >
                {isMe && activeMsgId === msg.id && (
                  <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex gap-1 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowInfoForMsg(msg); setActiveMsgId(null); }}
                      className="bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-transform hover:scale-105"
                      title="Message Info"
                    >
                      ℹ️
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                      className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-transform hover:scale-105"
                      title="Delete Message"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                {msg.message_type === "text" && <p>{msg.content}</p>}
                {msg.message_type === "image" && <img src={msg.content} alt="Media" className="rounded-lg max-w-full" />}
                {msg.message_type === "audio" && <CustomAudioPlayer src={msg.content} isMe={isMe} />}
                {msg.message_type === "image_once" && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xl">💣</span>
                    {isMe ? (
                      <span className="italic opacity-80 font-medium">View-Once Sent</span>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleViewOnce(msg); }} 
                        className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg shadow-sm font-semibold"
                      >
                        View Photo
                      </button>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-1 mt-1 justify-end opacity-70 text-[10px]">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <span className="ml-1 tracking-tighter font-bold text-xs">
                      {msg.read ? (
                        <span className="text-cyan-300">✓✓</span>
                      ) : (
                        <span className="text-gray-300">✓✓</span>
                      )}
                    </span>
                  )}
                </div>
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
            <button
              type="button"
              onClick={() => setIsViewOnce(!isViewOnce)}
              className={`cursor-pointer text-lg p-1 sm:p-2 rounded-full flex-shrink-0 transition-colors ${isViewOnce ? "bg-red-500/20 text-red-400" : "hover:bg-gray-800 grayscale opacity-50"}`}
              title="Toggle View Once"
            >
              💣
            </button>
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

      {/* Fullscreen View Once Overlay */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <button 
            onClick={() => setFullscreenImage(null)} 
            className="absolute top-6 right-6 text-white text-xl bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center transition-colors shadow-lg border border-gray-700"
          >
            ✕
          </button>
          <img src={fullscreenImage} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          <p className="text-red-400 mt-6 text-sm animate-pulse font-medium tracking-wide">
            This photo has been instantly deleted from the database.
          </p>
        </div>
      )}

      {/* Message Info Modal */}
      {showInfoForMsg && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowInfoForMsg(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 mb-4">Message Info</h3>
            
            <div className="mb-4 bg-gray-800 p-3 rounded-xl break-words text-sm text-gray-200 shadow-inner">
              {showInfoForMsg.message_type === "text" && <p>{showInfoForMsg.content}</p>}
              {showInfoForMsg.message_type === "image" && <span className="italic text-gray-400 flex items-center gap-2">📷 Image Media</span>}
              {showInfoForMsg.message_type === "audio" && <span className="italic text-gray-400 flex items-center gap-2">🎙️ Voice Note</span>}
              {showInfoForMsg.message_type === "image_once" && <span className="italic text-red-400 flex items-center gap-2">💣 View-Once Photo</span>}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-3">
                <span className="text-gray-400 flex items-center gap-2"><span className="text-gray-500 font-bold">✓</span> Delivered</span>
                <span className="text-gray-200">{new Date(showInfoForMsg.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-400 flex items-center gap-2"><span className="text-cyan-400 font-bold tracking-tighter">✓✓</span> Read</span>
                <div className="text-right">
                  {showInfoForMsg.read ? (
                    <>
                      <div className="text-gray-200">
                        {showInfoForMsg.read_at 
                          ? new Date(showInfoForMsg.read_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                          : <span className="italic text-gray-500">Time Unavailable</span>}
                      </div>
                      <div className="text-xs text-blue-400 mt-1 bg-blue-500/10 inline-block px-2 py-0.5 rounded font-mono">
                        IP: {showInfoForMsg.read_by_ip || "Hidden/Unavailable"}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500 italic">Not read yet...</span>
                  )}
                </div>
              </div>
            </div>
            
            <button onClick={() => setShowInfoForMsg(null)} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl transition shadow-md">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
