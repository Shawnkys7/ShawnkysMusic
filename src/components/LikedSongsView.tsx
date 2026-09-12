import React, { useState } from 'react';
import { Heart, Play, Pause, Shuffle, Search, ArrowLeft } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Song } from '../types';

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '3:20';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const LikedSongsView: React.FC = () => {
  const {
    likedSongs,
    toggleLike,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    setCurrentView,
    openArtist,
  } = useMusic();

  const [filterQuery, setFilterQuery] = useState('');

  const filteredSongs = likedSongs.filter((song) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (song.title || song.name || '').toLowerCase().includes(q) ||
      (song.artist || song.artists || '').toLowerCase().includes(q) ||
      (song.album || '').toLowerCase().includes(q)
    );
  });

  const handlePlayAll = () => {
    if (filteredSongs.length === 0) return;
    playSong(filteredSongs[0], filteredSongs);
  };

  const handleShuffle = () => {
    if (filteredSongs.length === 0) return;
    const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  };

  const isLikedPlaying =
    isPlaying &&
    filteredSongs.some(
      (s) => s.id === currentSong?.id || (s.videoId && s.videoId === currentSong?.videoId)
    );

  return (
    <div id="liked-songs-page" className="pb-36 min-h-screen text-white select-none">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => setCurrentView('library')}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold">Lagu yang Disukai</span>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {/* Hero Banner Card (radius 40px) */}
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-b from-[#222226] to-[#121214] border border-white/10 p-6 shadow-2xl mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-36 h-36 rounded-[32px] bg-neutral-900 border border-white/10 flex items-center justify-center text-red-500 shadow-2xl shrink-0">
            <Heart className="w-16 h-16 fill-current" />
          </div>

          <div className="text-center sm:text-left flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
              Favorit
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Lagu yang Disukai
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mb-4">
              {likedSongs.length} lagu favoritmu yang telah disimpan.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <button
                onClick={isLikedPlaying ? togglePlay : handlePlayAll}
                disabled={filteredSongs.length === 0}
                className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isLikedPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    Jeda
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    Putar Semua
                  </>
                )}
              </button>

              <button
                onClick={handleShuffle}
                disabled={filteredSongs.length === 0}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/10 disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4" />
                Acak
              </button>
            </div>
          </div>
        </div>

        {/* Search within liked */}
        {likedSongs.length > 5 && (
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Cari lagu di sini..."
              className="w-full bg-[#1C1C1E] text-xs text-white placeholder-white/40 pl-10 pr-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-white/30"
            />
          </div>
        )}

        {/* Track List */}
        {filteredSongs.length === 0 ? (
          <div className="py-16 text-center text-white/40 text-xs">
            {filterQuery ? 'Tidak ada lagu yang cocok.' : 'Belum ada lagu yang disukai.'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSongs.map((song, idx) => {
              const isCurrent =
                currentSong?.videoId === song.videoId || currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={song.id || song.videoId || idx}
                  onClick={() => playSong(song, filteredSongs)}
                  className={`group flex items-center gap-3 p-2.5 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-white/5 ${
                    isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="w-6 text-center text-xs font-bold text-white/40">
                    {idx + 1}
                  </span>

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

                  <span className="text-xs text-white/40 hidden sm:inline-block">
                    {formatDuration(song.duration)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className="p-2 text-red-500 rounded-full transition-transform active:scale-90 cursor-pointer"
                    title="Hapus dari Disukai"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
