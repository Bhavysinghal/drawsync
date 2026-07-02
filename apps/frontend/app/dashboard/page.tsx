'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Copy,
  Check,
  LogOut,
  User,
  ArrowRight,
  Loader2,
  PenLine,
  Users,
  UserPlus,
  Globe,
  Lock,
  Trash2,
  AlertTriangle,
  DoorOpen,
} from "lucide-react";
import { BACKEND_URL } from '../../config';
import Link from 'next/link';

interface Room {
  id: string | number;
  slug: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  adminId: string;
  createdAt: string;
  collaborators?: { id: string; name: string; photo?: string }[];
}

const Logo = ({ size = 26 }: { size?: number }) => (
  <motion.svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <motion.circle cx="12" cy="16" r="9" stroke="var(--coral)" strokeWidth="1.8"
      fill="var(--coral)" fillOpacity="0.15"
      animate={{ cx: [12, 11.2, 12] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.circle cx="20" cy="16" r="9" stroke="var(--ink)" strokeWidth="1.8"
      fill="var(--ink)" fillOpacity="0.07"
      animate={{ cx: [20, 20.8, 20] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.ellipse cx="16" cy="16" rx="3.5" ry="6" fill="var(--coral)" fillOpacity="0.55"
      animate={{ fillOpacity: [0.45, 0.75, 0.45] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
  </motion.svg>
);

const AVATAR_COLORS = ['#cc785c', '#5db8a6', '#e8a55a', '#5d7eb8', '#a65db8'];
const Avatar = ({ name, size = 32, idx = 0 }: { name: string; size?: number; idx?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: size * 0.38, fontWeight: 600,
    fontFamily: 'var(--font-sans)', border: '2px solid var(--canvas)',
    flexShrink: 0,
  }}>
    {name ? name.charAt(0).toUpperCase() : '?'}
  </div>
);

// Image with automatic fallback to initials avatar if the photo URL
// fails to load (expired Google photo links, network hiccups, etc).
const SafeImage = ({
  src, name, size = 32, idx = 0, style,
}: { src?: string; name: string; size?: number; idx?: number; style?: React.CSSProperties }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <Avatar name={name} size={size} idx={idx} />;
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        border: '2px solid var(--canvas)',
        ...style,
      }}
    />
  );
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} title="Copy slug"
      style={{
        width: 28, height: 28, borderRadius: 6,
        border: '1px solid var(--hairline)',
        background: copied ? 'var(--surface-card)' : 'transparent',
        color: copied ? 'var(--coral)' : 'var(--muted-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.15s',
        flexShrink: 0,
      }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
};

const RoomSkeleton = () => (
  <div style={{
    background: 'var(--surface-card)', borderRadius: 12,
    border: '1px solid var(--hairline)', padding: 24,
    display: 'flex', flexDirection: 'column', gap: 16,
  }}>
    <div style={{ height: 14, width: '60%', background: 'var(--hairline)', borderRadius: 4 }} className="animate-pulse" />
    <div style={{ height: 11, width: '35%', background: 'var(--hairline)', borderRadius: 4 }} className="animate-pulse" />
    <div style={{ height: 1, background: 'var(--hairline)' }} />
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--hairline)' }} className="animate-pulse" />
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--hairline)' }} className="animate-pulse" />
    </div>
    <div style={{ height: 36, background: 'var(--hairline)', borderRadius: 8 }} className="animate-pulse" />
  </div>
);

// ── Animated dot grid background ─────────────────────────────────────────────
const DotGrid = () => {
  const [opacity, setOpacity] = useState(0.8);
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      setOpacity(0.8 + Math.sin(t * 0.6) * 0.15);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.8" fill="var(--muted-color)" fillOpacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomSlug, setRoomSlug] = useState('');
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);

  const [userData, setUserData] = useState<{ id: string; name: string; photo?: string } | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roomVisibility, setRoomVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');

  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [collabEmail, setCollabEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [roomToLeave, setRoomToLeave] = useState<Room | null>(null);
  const [leaving, setLeaving] = useState(false);

  const toastOptions = { position: 'top-right' as const, autoClose: 2000 };

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const storageToken = localStorage.getItem('token');
    const savedToken = storageToken || urlToken;
    if (savedToken) {
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setToken(savedToken);
      fetchRooms(savedToken);
      fetchUserProfile(savedToken);
    } else {
      router.push('/auth');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (searchQuery.trim() === '') setFilteredRooms(rooms);
    else setFilteredRooms(rooms.filter(r => r.slug.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, rooms]);

  const fetchRooms = async (t: string) => {
    setLoadingRooms(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/my-rooms`, { headers: { Authorization: `Bearer ${t}` } });
      setRooms(res.data.rooms);
    } catch (err) { console.error(err); }
    finally { setLoadingRooms(false); }
  };

  const fetchUserProfile = async (t: string) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.data.user) {
        setUserData({
          id: res.data.user.id,
          name: res.data.user.name,
          photo: res.data.user.photo || undefined,
        });
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateRoom = async () => {
    if (!token) return;
    setCreating(true);
    try {
      await axios.post(
        `${BACKEND_URL}/create-room`,
        { visibility: roomVisibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Room created!', toastOptions);
      setShowCreateDialog(false);
      setRoomVisibility('PRIVATE');
      fetchRooms(token);
    } catch { toast.error('Error creating room', toastOptions); }
    finally { setCreating(false); }
  };

  const handleAddCollaborator = async () => {
    if (!selectedRoom || !collabEmail || !token) return;
    setInviting(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/rooms/${selectedRoom.id}/add-collaborator`,
        { email: collabEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || 'Invited!', toastOptions);
      setShowAddUserDialog(false);
      setCollabEmail('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to invite', toastOptions);
    } finally { setInviting(false); }
  };

  const joinRoom = async () => {
    if (!roomSlug.trim() || !token) return;
    setJoiningSlug(roomSlug.trim());
    try {
      const res = await axios.get(`${BACKEND_URL}/room/${roomSlug.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.room?.slug) router.push(`/canvas/${res.data.room.slug}`);
    } catch (error: any) {
      const message = error.response?.status === 404
        ? 'Room not found, or it is private and you need an invite.'
        : 'Unable to open room';
      toast.error(message, toastOptions);
    }
    finally { setJoiningSlug(null); }
  };

  const handleEnterRoom = async (slug: string) => {
    setJoiningSlug(slug);
    router.push(`/canvas/${slug}`);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete || !token) return;
    setDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/room/${roomToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Room deleted', toastOptions);
      setRoomToDelete(null);
      fetchRooms(token);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete room', toastOptions);
    } finally {
      setDeleting(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomToLeave || !token) return;
    setLeaving(true);
    try {
      await axios.post(`${BACKEND_URL}/room/${roomToLeave.id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Left room', toastOptions);
      setRoomToLeave(null);
      fetchRooms(token);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to leave room', toastOptions);
    } finally {
      setLeaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', fontFamily: 'var(--font-sans)', position: 'relative' }}>

      {/* Dot grid */}
      <DotGrid />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--canvas)', borderBottom: '1px solid var(--hairline)',
        height: 64, display: 'flex', alignItems: 'center',
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Logo size={26} />
            <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 16, letterSpacing: '-0.3px' }}>DrawSync</span>
          </Link>

          <span style={{ color: 'var(--muted-color)', fontSize: 13, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Dashboard
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface-card)', border: '1px solid var(--hairline)',
                borderRadius: 999, padding: '6px 14px 6px 6px', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}>
                <SafeImage src={userData?.photo} name={userData?.name || '?'} size={30} idx={0} />
                <span style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 500 }}>{userData?.name?.split(' ')[0] || 'You'}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ minWidth: 180 }}>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} style={{ color: 'var(--error)' }}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 1 }}>

        {/* Hero row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" style={{ marginBottom: 40 }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400,
              color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: 1.15,
              marginBottom: 6,
            }}>
              Your Workspaces
            </h1>
            <p style={{ color: 'var(--muted-color)', fontSize: 14, fontFamily: 'var(--font-sans)' }}>
              {loadingRooms ? 'Loading...' : `${rooms.length} room${rooms.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <button
            onClick={() => setShowCreateDialog(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--coral)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '11px 22px',
              fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)',
              cursor: 'pointer', transition: 'opacity 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={16} /> New Room
          </button>
        </div>

        {/* Search + Join bar */}
        <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: 40 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--muted-color)', pointerEvents: 'none',
            }} />
            <input
              placeholder="Search rooms…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', height: 42, paddingLeft: 36, paddingRight: 16,
                background: 'var(--surface-soft)', border: '1px solid var(--hairline)',
                borderRadius: 8, color: 'var(--ink)', fontSize: 14,
                fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              placeholder="Enter room slug…"
              value={roomSlug}
              onChange={e => setRoomSlug(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && joinRoom()}
              style={{
                width: 200, height: 42, padding: '0 14px',
                background: 'var(--surface-soft)', border: '1px solid var(--hairline)',
                borderRadius: 8, color: 'var(--ink)', fontSize: 14,
                fontFamily: 'var(--font-sans)', outline: 'none',
              }}
            />
            <button
              onClick={joinRoom}
              disabled={!!joiningSlug || !roomSlug.trim()}
              style={{
                height: 42, padding: '0 18px',
                background: 'var(--surface-card)', border: '1px solid var(--hairline)',
                borderRadius: 8, color: 'var(--ink)', fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)', cursor: joiningSlug ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                opacity: joiningSlug || !roomSlug.trim() ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {joiningSlug === roomSlug.trim() && joiningSlug !== null
                ? <Loader2 size={14} className="animate-spin" />
                : <ArrowRight size={14} />
              }
              Join
            </button>
          </div>
        </div>

        {/* ── ROOM GRID ── */}
        {loadingRooms ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => <RoomSkeleton key={i} />)}
          </div>
        ) : rooms.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '96px 24px', gap: 20, textAlign: 'center',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--surface-card)', border: '1px solid var(--hairline)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PenLine size={28} style={{ color: 'var(--muted-color)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--ink)', marginBottom: 8 }}>
                No rooms yet
              </h2>
              <p style={{ color: 'var(--muted-color)', fontSize: 14 }}>Create your first canvas or join one with a slug.</p>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              style={{
                background: 'var(--coral)', color: '#fff', border: 'none',
                borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <Plus size={15} /> Create Room
            </button>
          </div>
        ) : filteredRooms.length === 0 ? (
          <p style={{ color: 'var(--muted-color)', fontSize: 14, textAlign: 'center', padding: '64px 0' }}>
            No rooms match &quot;{searchQuery}&quot;
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => {
              const isOwner = room.adminId === userData?.id;

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 12, padding: 24,
                    display: 'flex', flexDirection: 'column', gap: 16,
                    cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--coral)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(204,120,92,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--hairline)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{
                          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
                          color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {room.slug}
                        </span>
                        <span
                          title={room.visibility === 'PUBLIC' ? 'Public room' : 'Private room'}
                          style={{ display: 'inline-flex', color: 'var(--muted-color)', flexShrink: 0 }}
                        >
                          {room.visibility === 'PUBLIC' ? <Globe size={13} /> : <Lock size={13} />}
                        </span>
                        <CopyButton text={room.slug} />
                      </div>
                      <span style={{ color: 'var(--muted-color)', fontSize: 12 }}>
                        {new Date(room.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button style={{
                          width: 28, height: 28, borderRadius: 6,
                          border: '1px solid var(--hairline)', background: 'transparent',
                          color: 'var(--muted-color)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="3" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="8" cy="13" r="1.4"/>
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isOwner ? (
                          <>
                            {room.visibility === 'PRIVATE' && (
                              <DropdownMenuItem onClick={() => { setSelectedRoom(room); setShowAddUserDialog(true); }}>
                                <UserPlus className="mr-2 h-4 w-4" /> Invite
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setRoomToDelete(room)}
                              style={{ color: 'var(--error)' }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Room
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setRoomToLeave(room)}
                            style={{ color: 'var(--error)' }}
                          >
                            <DoorOpen className="mr-2 h-4 w-4" /> Leave Room
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div style={{ height: 1, background: 'var(--hairline)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, minHeight: 32 }}>
                    {room.collaborators && room.collaborators.length > 0 ? (
                      <>
                        <Users size={13} style={{ color: 'var(--muted-color)', marginRight: 4 }} />
                        <div style={{ display: 'flex' }}>
                          {room.collaborators.slice(0, 4).map((c, idx) => (
                            <div key={c.id} style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: idx }}>
                              <SafeImage
                                src={c.photo} name={c.name || '?'} size={28} idx={idx}
                                style={{ border: '2px solid var(--surface-card)' }}
                              />
                            </div>
                          ))}
                        </div>
                        {room.collaborators.length > 4 && (
                          <span style={{ color: 'var(--muted-color)', fontSize: 12, marginLeft: 4 }}>+{room.collaborators.length - 4}</span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--muted-color)', fontSize: 12 }}>No collaborators yet</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleEnterRoom(room.slug)}
                    disabled={joiningSlug === room.slug}
                    style={{
                      width: '100%', height: 38, borderRadius: 8,
                      background: joiningSlug === room.slug ? 'var(--surface-cream-strong)' : 'var(--canvas)',
                      border: '1px solid var(--hairline)',
                      color: 'var(--ink)', fontSize: 13, fontWeight: 500,
                      fontFamily: 'var(--font-sans)', cursor: joiningSlug === room.slug ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (joiningSlug !== room.slug) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--coral)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--coral)';
                        (e.currentTarget as HTMLElement).style.color = '#fff';
                      }
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--canvas)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--hairline)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
                    }}
                  >
                    {joiningSlug === room.slug
                      ? <><Loader2 size={13} className="animate-spin" /> Opening…</>
                      : <><ArrowRight size={13} /> Enter Room</>
                    }
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── CREATE ROOM DIALOG ── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 12 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, color: 'var(--ink)' }}>
              New Room
            </DialogTitle>
          </DialogHeader>
          <p style={{ color: 'var(--muted-color)', fontSize: 14, marginBottom: 8 }}>
            A unique three-word slug will be generated automatically.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setRoomVisibility('PRIVATE')}
              style={{
                padding: 14,
                borderRadius: 8,
                border: roomVisibility === 'PRIVATE' ? '1px solid var(--coral)' : '1px solid var(--hairline)',
                background: roomVisibility === 'PRIVATE' ? 'var(--surface-soft)' : 'transparent',
                color: 'var(--ink)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 5,
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <Lock size={14} /> Private
              </span>
              <span style={{ color: 'var(--muted-color)', fontSize: 12 }}>
                Owner and invited collaborators
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRoomVisibility('PUBLIC')}
              style={{
                padding: 14,
                borderRadius: 8,
                border: roomVisibility === 'PUBLIC' ? '1px solid var(--coral)' : '1px solid var(--hairline)',
                background: roomVisibility === 'PUBLIC' ? 'var(--surface-soft)' : 'transparent',
                color: 'var(--ink)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 5,
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <Globe size={14} /> Public
              </span>
              <span style={{ color: 'var(--muted-color)', fontSize: 12 }}>
                Any signed-in user with the link
              </span>
            </button>
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={creating}
            style={{
              width: '100%', height: 42, borderRadius: 8,
              background: creating ? 'var(--surface-card)' : 'var(--coral)',
              color: creating ? 'var(--muted-color)' : '#fff',
              border: 'none', fontSize: 14, fontWeight: 500,
              fontFamily: 'var(--font-sans)', cursor: creating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.15s',
            }}
          >
            {creating ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : <><Plus size={14} /> Create Room</>}
          </button>
        </DialogContent>
      </Dialog>

      {/* ── INVITE COLLABORATOR DIALOG ── */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 12 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, color: 'var(--ink)' }}>
              Invite to <span style={{ color: 'var(--coral)' }}>{selectedRoom?.slug}</span>
            </DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
            <Label style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 500 }}>Email address</Label>
            <input
              placeholder="colleague@example.com"
              value={collabEmail}
              onChange={e => setCollabEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCollaborator()}
              style={{
                height: 42, padding: '0 14px',
                background: 'var(--surface-soft)', border: '1px solid var(--hairline)',
                borderRadius: 8, color: 'var(--ink)', fontSize: 14,
                fontFamily: 'var(--font-sans)', outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            onClick={handleAddCollaborator}
            disabled={inviting || !collabEmail}
            style={{
              width: '100%', height: 42, borderRadius: 8,
              background: inviting || !collabEmail ? 'var(--surface-card)' : 'var(--coral)',
              color: inviting || !collabEmail ? 'var(--muted-color)' : '#fff',
              border: 'none', fontSize: 14, fontWeight: 500,
              fontFamily: 'var(--font-sans)', cursor: inviting || !collabEmail ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {inviting ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : 'Send Invitation'}
          </button>
        </DialogContent>
      </Dialog>

      {/* ── DELETE ROOM CONFIRMATION DIALOG ── */}
      <Dialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <DialogContent style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 12 }}>
          <DialogHeader>
            <DialogTitle style={{
              fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: 'var(--ink)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <AlertTriangle size={20} style={{ color: 'var(--error)' }} />
              Delete this room?
            </DialogTitle>
          </DialogHeader>
          <p style={{ color: 'var(--muted-color)', fontSize: 14, lineHeight: 1.6 }}>
            This will permanently delete <strong style={{ color: 'var(--ink)' }}>{roomToDelete?.slug}</strong> along
            with all its drawings and chat history. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              onClick={() => setRoomToDelete(null)}
              disabled={deleting}
              style={{
                flex: 1, height: 42, borderRadius: 8,
                background: 'transparent', border: '1px solid var(--hairline)',
                color: 'var(--ink)', fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)', cursor: deleting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRoom}
              disabled={deleting}
              style={{
                flex: 1, height: 42, borderRadius: 8,
                background: 'var(--error)', border: 'none',
                color: '#fff', fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)', cursor: deleting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: deleting ? 0.7 : 1,
              }}
            >
              {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── LEAVE ROOM CONFIRMATION DIALOG ── */}
      <Dialog open={!!roomToLeave} onOpenChange={(open) => !open && setRoomToLeave(null)}>
        <DialogContent style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 12 }}>
          <DialogHeader>
            <DialogTitle style={{
              fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: 'var(--ink)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <DoorOpen size={20} style={{ color: 'var(--error)' }} />
              Leave this room?
            </DialogTitle>
          </DialogHeader>
          <p style={{ color: 'var(--muted-color)', fontSize: 14, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--ink)' }}>{roomToLeave?.slug}</strong> will be removed from
            your dashboard. You&apos;ll need a new invite from the owner to rejoin.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              onClick={() => setRoomToLeave(null)}
              disabled={leaving}
              style={{
                flex: 1, height: 42, borderRadius: 8,
                background: 'transparent', border: '1px solid var(--hairline)',
                color: 'var(--ink)', fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)', cursor: leaving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleLeaveRoom}
              disabled={leaving}
              style={{
                flex: 1, height: 42, borderRadius: 8,
                background: 'var(--error)', border: 'none',
                color: '#fff', fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)', cursor: leaving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: leaving ? 0.7 : 1,
              }}
            >
              {leaving ? <><Loader2 size={14} className="animate-spin" /> Leaving…</> : <><DoorOpen size={14} /> Leave</>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: 'var(--coral)' }} className="animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}