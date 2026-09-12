import React, { useState } from 'react';
import {
  Heart,
  History,
  Plus,
  Music2,
  Trash2,
  Play,
  ListPlus,
  ChevronRight,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const LibraryView: React.FC<{ onOpenCreatePlaylist: () => void }> = ({
  onOpenCreatePlaylist,
}) => {
  const {
    likedSongs,
    playlists,
    recentlyPlayed,
    setCurrentView,
    setActivePlaylistId,
    setIsHistoryOpen,
    deletePlaylist,
    playSong,
  } = useMusic();

  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Playlist' | 'Suka' | 'Riwayat'>('Semua');

  const handleOpenPlaylist = (id: string) => {
    setActivePlaylistId(id);
    setCurrentView('playlist');
  };

  return (
    <div id="library-view-container" className="pb-36 min-h-screen text-white select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-30 px-5 pt-4 pb-3 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Pustaka
        </h1>

        <button
          onClick={onOpenCreatePlaylist}
          className="p-2.5 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center"
          title="Buat Playlist Baru"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      <div className="px-4 pt-4 max-w-2xl mx-auto space-y-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {(['Semua', 'Playlist', 'Suka', 'Riwayat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeFilter === tab
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#1C1C1E] text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 1. KARTU SUKA (Disukai) */}
        {(activeFilter === 'Semua' || activeFilter === 'Suka') && (
          <div
            onClick={() => {
              setActivePlaylistId(null);
              setCurrentView('liked');
            }}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-[#1E1E20] to-[#141416] border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-lg group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-red-500 shadow-inner shrink-0">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Lagu yang Disukai
                </h3>
                <p className="text-xs text-white/50 truncate">
                  {likedSongs.length} lagu favorit tersimpan
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/20 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* 2. KARTU RIWAYAT (Riwayat Pemutaran) */}
        {(activeFilter === 'Semua' || activeFilter === 'Riwayat') && (
          <div
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-[#1E1E20] to-[#141416] border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-lg group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-white/80 shadow-inner shrink-0">
                <History className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Riwayat Pemutaran
                </h3>
                <p className="text-xs text-white/50 truncate">
                  {recentlyPlayed.length} lagu baru saja didengar
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/20 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* 3. SECTION PLAYLIST SAYA */}
        {(activeFilter === 'Semua' || activeFilter === 'Playlist') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Playlist Saya
              </h2>
              <button
                onClick={onOpenCreatePlaylist}
                className="text-xs font-semibold text-white/70 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Buat Baru
              </button>
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl p-6">
                <Music2 className="w-10 h-10 mx-auto text-white/20 mb-2" />
                <p className="text-sm font-semibold text-white">Belum ada playlist</p>
                <p className="text-xs text-white/40 mt-1 mb-4">
                  Buat playlist untuk menyusun kumpulan lagu favoritmu.
                </p>
                <button
                  onClick={onOpenCreatePlaylist}
                  className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
                >
                  Buat Playlist
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => {
                  const firstTrack = playlist.songs[0];
                  const cover =
                    firstTrack?.image ||
                    (firstTrack?.videoId
                      ? `https://i.ytimg.com/vi/${firstTrack.videoId}/hqdefault.jpg`
                      : '');

                  return (
                    <div
                      key={playlist.id}
                      onClick={() => handleOpenPlaylist(playlist.id)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#18181A] hover:bg-[#202024] border border-white/5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-neutral-800 overflow-hidden border border-white/10 shrink-0 flex items-center justify-center">
                          {cover ? (
                            <img
                              src={cover}
                              alt={playlist.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ListPlus className="w-6 h-6 text-white/40" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {playlist.name}
                          </h4>
                          <p className="text-xs text-white/50 truncate">
                            {playlist.songs.length} lagu
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {playlist.songs.length > 0 && (
                          <button
                            onClick={() => playSong(playlist.songs[0], playlist.songs)}
                            className="p-2 text-white/50 hover:text-white rounded-full transition-colors cursor-pointer"
                            title="Putar Playlist"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        )}
                        <button
                          onClick={() => deletePlaylist(playlist.id)}
                          className="p-2 text-white/30 hover:text-red-400 rounded-full transition-colors cursor-pointer"
                          title="Hapus Playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
