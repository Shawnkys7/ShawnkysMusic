import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Shuffle,
  Heart,
  MoreVertical,
  PlusCircle,
  ListPlus,
  User,
  Flame,
  Check,
  Loader2,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Song } from '../types';

export const TopIndonesiaView: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    isLiked,
    toggleLike,
    addToQueue,
    setTrackToAddToPlaylist,
    openArtist,
    setCurrentView,
  } = useMusic();

  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch('/api/top-indonesia')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setTopSongs(data);
        }
      })
      .catch((err) => console.error('Failed to load top songs:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlayAll = () => {
    if (topSongs.length > 0) {
      playSong(topSongs[0], topSongs);
    }
  };

  const handleShuffle = () => {
    if (topSongs.length > 0) {
      const shuffled = [...topSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
      showToast('Memutar secara acak');
    }
  };

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '3:30';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const firstCover =
    topSongs[0]?.image ||
    'https://i.ytimg.com/vi/NE41kVB0swQ/hqdefault.jpg';

  return (
    <div id="top-indonesia-page" className="pb-36 min-h-screen text-white select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Back button */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => setCurrentView('home')}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold tracking-tight">Tangga Lagu</span>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {/* Hero Card with iPhone-clean 40px radius */}
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/10 p-6 shadow-2xl mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[32px] overflow-hidden shrink-0 shadow-2xl bg-neutral-950 border border-white/10">
            <img
              src={firstCover}
              alt="Top 50 Indonesia"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-500 fill-current" />
              Chart
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
              Top 50 Indonesia
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mb-4">
              Daftar lagu paling populer dan sering didengarkan di Indonesia minggu ini.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <button
                onClick={handlePlayAll}
                className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Dengarkan
              </button>

              <button
                onClick={handleShuffle}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <Shuffle className="w-4 h-4" />
                Acak
              </button>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="space-y-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/50 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-white/80" />
            </div>
          ) : topSongs.length === 0 ? (
            <div className="text-center py-16 text-white/50 text-sm">
              Tidak ada lagu yang ditemukan.
            </div>
          ) : (
            topSongs.map((song, idx) => {
              const isCurrent =
                currentSong?.videoId === song.videoId || currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;
              const liked = isLiked(song.videoId || song.id);

              return (
                <div
                  key={song.id || song.videoId || idx}
                  className={`group relative flex items-center gap-3 p-2.5 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-white/5 ${
                    isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                  onClick={() => {
                    if (isCurrent) {
                      togglePlay();
                    } else {
                      playSong(song, topSongs);
                    }
                  }}
                >
                  {/* Rank Number */}
                  <span
                    className={`w-6 text-center text-xs font-bold ${
                      idx < 3 ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {/* Album Cover */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5 shadow-md">
                    <img
                      src={
                        song.image ||
                        (song.videoId
                          ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`
                          : '')
                      }
                      alt={song.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        {isSongPlaying ? (
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                            <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-75" />
                            <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? 'text-white' : 'text-white/90'
                      }`}
                    >
                      {song.title}
                    </h4>
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        if (song.artist) {
                          openArtist({ name: song.artist });
                        }
                      }}
                      className="text-xs text-white/50 truncate hover:text-white hover:underline cursor-pointer inline-block mt-0.5"
                    >
                      {song.artist}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-xs text-white/40 hidden sm:inline-block">
                    {formatDuration(song.duration)}
                  </span>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className={`p-2 rounded-full transition-transform active:scale-90 cursor-pointer ${
                      liked ? 'text-red-500' : 'text-white/40 hover:text-white'
                    }`}
                    title={liked ? 'Hapus Suka' : 'Sukai'}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Options Menu Button */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() =>
                        setActiveMenuSongId(
                          activeMenuSongId === song.id ? null : song.id
                        )
                      }
                      className="p-2 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuSongId === song.id && (
                      <div className="absolute right-0 top-10 w-48 bg-[#1E1E20] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => {
                            playSong(song, topSongs);
                            setActiveMenuSongId(null);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left text-white/90 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Putar Sekarang
                        </button>
                        <button
                          onClick={() => {
                            addToQueue(song);
                            setActiveMenuSongId(null);
                            showToast('Ditambahkan ke Antrean');
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left text-white/90 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <ListPlus className="w-3.5 h-3.5" />
                          Tambah ke Antrean
                        </button>
                        <button
                          onClick={() => {
                            setTrackToAddToPlaylist(song);
                            setActiveMenuSongId(null);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left text-white/90 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Tambah ke Playlist
                        </button>
                        {song.artist && (
                          <button
                            onClick={() => {
                              openArtist({ name: song.artist });
                              setActiveMenuSongId(null);
                            }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left text-white/90 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <User className="w-3.5 h-3.5" />
                            Buka Artis
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
