import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, Shuffle, Trash2, ArrowLeft } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Song, Playlist } from '../types';

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '3:20';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const PlaylistView: React.FC = () => {
  const {
    activePlaylistId,
    setActivePlaylistId,
    setCurrentView,
    playlists,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    toggleLike,
    isLiked,
    removeFromPlaylist,
    openArtist,
  } = useMusic();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  const isUserPlaylist = playlists.some((p) => p.id === activePlaylistId);

  useEffect(() => {
    if (!activePlaylistId) return;

    if (isUserPlaylist) {
      const found = playlists.find((p) => p.id === activePlaylistId);
      if (found) {
        setPlaylist(found);
        setSongs(found.songs || []);
      }
    }
  }, [activePlaylistId, playlists, isUserPlaylist]);

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    playSong(songs[0], songs);
  };

  const handleShuffle = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  };

  const isPlaylistPlaying =
    isPlaying &&
    songs.some(
      (s) => s.id === currentSong?.id || (s.videoId && s.videoId === currentSong?.videoId)
    );

  const firstCover =
    songs[0]?.image ||
    (songs[0]?.videoId ? `https://i.ytimg.com/vi/${songs[0].videoId}/hqdefault.jpg` : '') ||
    'https://i.ytimg.com/vi/D47mUu1b_54/hqdefault.jpg';

  return (
    <div id="playlist-page" className="pb-36 min-h-screen text-white select-none">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => {
            setActivePlaylistId(null);
            setCurrentView('library');
          }}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold truncate max-w-[200px]">
          {playlist?.name || 'Playlist'}
        </span>
        <div className="w-10" />
      </div>

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {/* Hero Card (radius 40px) */}
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-b from-[#202024] to-[#121214] border border-white/10 p-6 shadow-2xl mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-36 h-36 rounded-[32px] overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl shrink-0">
            <img
              src={firstCover}
              alt={playlist?.name || 'Playlist'}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/10 px-2.5 py-1 rounded-full inline-block mb-2">
              Playlist
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate mb-1">
              {playlist?.name || 'Playlist'}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mb-4">
              {playlist?.description || `${songs.length} lagu`}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <button
                onClick={isPlaylistPlaying ? togglePlay : handlePlayAll}
                disabled={songs.length === 0}
                className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isPlaylistPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    Jeda
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    Dengarkan
                  </>
                )}
              </button>

              <button
                onClick={handleShuffle}
                disabled={songs.length === 0}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/10 disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4" />
                Acak
              </button>
            </div>
          </div>
        </div>

        {/* Songs List */}
        {songs.length === 0 ? (
          <div className="py-16 text-center text-white/40 text-xs">
            Belum ada lagu di playlist ini.
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map((song, idx) => {
              const isCurrent =
                currentSong?.videoId === song.videoId || currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;
              const liked = isLiked(song.videoId || song.id);

              return (
                <div
                  key={song.id || song.videoId || idx}
                  onClick={() => playSong(song, songs)}
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
                    className={`p-2 rounded-full transition-transform active:scale-90 cursor-pointer ${
                      liked ? 'text-red-500' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  </button>

                  {isUserPlaylist && playlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPlaylist(playlist.id, song.id);
                      }}
                      className="p-2 text-white/30 hover:text-red-400 rounded-full transition-colors cursor-pointer"
                      title="Hapus dari playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
