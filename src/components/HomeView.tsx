import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Heart,
  MoreVertical,
  PlusCircle,
  ListPlus,
  User,
  History,
  Check,
  Shuffle,
  Loader2,
  Radio,
  Plus,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Song } from '../types';

interface FeaturedArtist {
  name: string;
  image: string;
  artistId?: string;
  subscribers?: string;
}

interface CommunityPlaylist {
  id: string;
  title: string;
  trackCount?: number | string;
  covers?: string[];
  gridCovers?: string[];
  tracks?: Song[];
  songs?: Song[];
}

interface SimilarSection {
  artist: {
    name: string;
    artistId?: string;
    image: string;
  };
  tracks?: Song[];
  songs?: Song[];
}

interface HomeSectionsData {
  communityPlaylists?: CommunityPlaylist[];
  listeningArtists?: FeaturedArtist[];
  trendingNow?: Song[];
  newReleases?: Song[];
  similarSections?: SimilarSection[];
  viralTikTok?: Song[];
  feelGoodRock?: Song[];
  acousticChill?: Song[];
  eidGetaways?: Song[];
}

export const HomeView: React.FC = () => {
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
    setIsHistoryOpen,
  } = useMusic();

  const [songs, setSongs] = useState<Song[]>([]);
  const [quickPicks, setQuickPicks] = useState<Song[]>([]);
  const [sectionsData, setSectionsData] = useState<HomeSectionsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePill, setActivePill] = useState<string>('Beranda');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Helper to pick 3-4 random songs
  const pickRandomSongs = (source: Song[], count: number = 4): Song[] => {
    if (!source || source.length === 0) return [];
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const handleShuffleQuickPicks = () => {
    if (songs.length > 0) {
      setQuickPicks(pickRandomSongs(songs, 4));
      showToast('Pilihan cepat diperbarui');
    }
  };

  // Fetch initial home songs & home sections data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // 1. Fetch comprehensive home sections (From the community, Trending, New Releases, Serupa, etc.)
    fetch('/api/home-sections')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data && typeof data === 'object') {
          setSectionsData(data);
          // If we have trendingNow songs, we can also use them for quick picks
          if (Array.isArray(data.trendingNow) && data.trendingNow.length > 0) {
            setSongs((prev) => (prev.length === 0 ? data.trendingNow : prev));
            setQuickPicks((prev) => (prev.length === 0 ? pickRandomSongs(data.trendingNow, 4) : prev));
          }
        }
      })
      .catch((err) => console.error('Error fetching home sections:', err));

    // 2. Fetch popular home songs for quick picks pool
    fetch('/api/home-songs')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setSongs(data);
          setQuickPicks(pickRandomSongs(data, 4));
        } else {
          // Fallback to top-indonesia
          fetch('/api/top-indonesia')
            .then((r2) => (r2.ok ? r2.json() : []))
            .then((topData) => {
              if (isMounted && Array.isArray(topData) && topData.length > 0) {
                setSongs(topData);
                setQuickPicks(pickRandomSongs(topData, 4));
              }
            });
        }
      })
      .catch((err) => console.error('Error fetching home songs:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlayQuickPicks = () => {
    if (quickPicks.length > 0) {
      playSong(quickPicks[0], quickPicks);
    } else if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const categories = ['Beranda', 'Cari', 'Top 50', 'Artis Populer'];

  const handlePillClick = (cat: string) => {
    setActivePill(cat);
    if (cat === 'Beranda') {
      const scrollEl = document.getElementById('main-content-scroll');
      if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (cat === 'Cari') {
      setCurrentView('search');
    } else if (cat === 'Top 50') {
      setCurrentView('top');
    } else if (cat === 'Artis Populer') {
      const el = document.getElementById('tetap-mendengarkan-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Reusable song card renderer for horizontal lists
  const renderHorizontalTrackCard = (song: Song, playlist: Song[]) => {
    const isCurrent = currentSong?.videoId === song.videoId || currentSong?.id === song.id;
    const isSongPlaying = isCurrent && isPlaying;
    const liked = isLiked(song.videoId || song.id);

    return (
      <div
        key={song.id || song.videoId}
        className="w-36 sm:w-40 shrink-0 group cursor-pointer"
        onClick={() => {
          if (isCurrent) {
            togglePlay();
          } else {
            playSong(song, playlist);
          }
        }}
      >
        {/* Cover with rounded 22px */}
        <div className="relative aspect-square rounded-[22px] overflow-hidden bg-neutral-900 border border-white/5 shadow-xl group-hover:scale-[1.02] transition-transform">
          <img
            src={
              song.image ||
              (song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg` : '')
            }
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Play/Pause state or Hover overlay */}
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
              {isSongPlaying ? (
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150" />
                </div>
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </div>
          </div>
        </div>

        {/* Title & Artist */}
        <div className="mt-2 px-1">
          <h4
            className={`text-xs sm:text-sm font-bold truncate ${
              isCurrent ? 'text-emerald-400' : 'text-white'
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
            className="text-[11px] sm:text-xs text-white/50 truncate mt-0.5 hover:text-white hover:underline cursor-pointer"
          >
            {song.artist}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div id="home-view-container" className="pb-36 min-h-screen text-white select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 pt-4 pb-3 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Beranda</h1>

        <div className="flex items-center gap-2">
          {/* Riwayat Quick Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Riwayat Pemutaran"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Suka Quick Button */}
          <button
            onClick={() => setCurrentView('liked')}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Lagu yang Disukai"
          >
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 max-w-2xl mx-auto space-y-9">
        {/* Category Pills: Beranda, Cari, Top 50, Artis Populer */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handlePillClick(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activePill === cat
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#1C1C1E] text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 1. PILIHAN CEPAT (3-4 lagu populer terus berganti/random) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Pilihan cepat
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffleQuickPicks}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Ganti / Acak pilihan cepat"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handlePlayQuickPicks}
                className="px-4 py-1 rounded-full border border-white/20 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Putar semua
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-7 h-7 animate-spin text-white/60" />
              </div>
            ) : quickPicks.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs">
                Tidak ada lagu tersedia saat ini.
              </div>
            ) : (
              quickPicks.map((song, idx) => {
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
                        playSong(song, quickPicks);
                      }
                    }}
                  >
                    {/* Cover Art */}
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
                        referrerPolicy="no-referrer"
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

                    {/* Like Button */}
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

                    {/* Options Menu */}
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
                              playSong(song, quickPicks);
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

        {/* 2. FROM THE COMMUNITY (Horizontal Cards dengan 2x2 grid artwork & 3 song list seperti di foto 1) */}
        {sectionsData?.communityPlaylists && sectionsData.communityPlaylists.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                From the community
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
              {(sectionsData.communityPlaylists || []).map((playlist) => {
                const covers = (playlist.covers || playlist.gridCovers || []).slice(0, 4);
                const playlistTracks = playlist.tracks || playlist.songs || [];
                return (
                  <div
                    key={playlist.id}
                    className="w-[305px] sm:w-[325px] shrink-0 bg-[#161618] border border-white/10 rounded-[30px] p-5 shadow-2xl flex flex-col justify-between"
                  >
                    {/* Card Header: 2x2 grid artwork + Title */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0 bg-neutral-900 border border-white/10 shadow-md">
                        {covers.map((c, i) => (
                          <img
                            key={i}
                            src={c}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {playlist.title}
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">
                          {playlist.trackCount || 100}{' '}
                          {typeof playlist.trackCount === 'string' && playlist.trackCount.includes('lagu')
                            ? ''
                            : 'lagu'}
                        </p>
                      </div>
                    </div>

                    {/* 3 Songs Preview Rows */}
                    <div className="space-y-2 mb-4">
                      {playlistTracks.slice(0, 3).map((track, tIdx) => {
                        const isCur =
                          currentSong?.videoId === track.videoId || currentSong?.id === track.id;
                        return (
                          <div
                            key={track.id || track.videoId || tIdx}
                            onClick={() => playSong(track, playlistTracks)}
                            className={`flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer ${
                              isCur ? 'bg-white/10' : ''
                            }`}
                          >
                            <img
                              src={track.image}
                              alt={track.title}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 bg-neutral-800"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <h5
                                className={`text-xs font-bold truncate ${
                                  isCur ? 'text-emerald-400' : 'text-white'
                                }`}
                              >
                                {track.title}
                              </h5>
                              <p className="text-[11px] text-white/50 truncate mt-0.5">
                                {track.artist}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Action Controls Row (Mint-green Play + Radio + Add) */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                      {/* Mint Play button */}
                      <button
                        onClick={() => {
                          if (playlistTracks.length > 0) {
                            playSong(playlistTracks[0], playlistTracks);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-[#9DD4B4] hover:bg-[#8ec7a5] text-black flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all"
                        title="Putar Playlist"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>

                      {/* Radio button */}
                      <button
                        onClick={() => {
                          if (playlistTracks.length > 0) {
                            const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
                            playSong(shuffled[0], shuffled);
                            showToast(`Memutar Radio ${playlist.title}`);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer border border-white/10 active:scale-95 transition-all"
                        title="Radio Playlist"
                      >
                        <Radio className="w-4 h-4" />
                      </button>

                      {/* Add to Queue button */}
                      <button
                        onClick={() => {
                          if (playlistTracks.length > 0) {
                            playlistTracks.forEach((t) => addToQueue(t));
                            showToast(`${playlistTracks.length} lagu ditambahkan ke Antrean`);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer border border-white/10 active:scale-95 transition-all"
                        title="Tambah ke Antrean"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ARTIS / TETAP MENDENGARKAN (Horizontal Circular Cards seperti di foto 2) */}
        {sectionsData?.listeningArtists && sectionsData.listeningArtists.length > 0 && (
          <div id="tetap-mendengarkan-section">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Tetap mendengarkan
              </h2>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-1">
              {(sectionsData.listeningArtists || []).map((artist) => (
                <div
                  key={artist.name}
                  onClick={() =>
                    openArtist({
                      name: artist.name,
                      artistId: artist.artistId,
                      image: artist.image,
                    })
                  }
                  className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer w-24 sm:w-28 text-center"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/15 group-hover:border-white/40 transition-all bg-neutral-900 shadow-xl">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-full px-1">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 truncate block transition-colors">
                      {artist.name}
                    </span>
                    <span className="text-[10px] text-white/50 block mt-0.5">Artis</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. TRENDING NOW (Horizontal Square Cards seperti di foto 2) */}
        {sectionsData?.trendingNow && sectionsData.trendingNow.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Trending now
              </h2>
            </div>

            <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
              {(sectionsData.trendingNow || []).map((song) =>
                renderHorizontalTrackCard(song, sectionsData.trendingNow || [])
              )}
            </div>
          </div>
        )}

        {/* 5. NEW RELEASES (Horizontal Square Cards seperti di foto 3) */}
        {sectionsData?.newReleases && sectionsData.newReleases.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                New Releases
              </h2>
            </div>

            <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
              {(sectionsData.newReleases || []).map((song) =>
                renderHorizontalTrackCard(song, sectionsData.newReleases || [])
              )}
            </div>
          </div>
        )}

        {/* 6. SERUPA DENGAN.. (Artis/Band beserta isi musiknya seperti di foto 3 & 4) */}
        {sectionsData?.similarSections && sectionsData.similarSections.length > 0 && (
          <div className="space-y-7">
            {sectionsData.similarSections.map((sim, sIdx) => {
              const simArtist = sim.artist || { name: 'Artis', image: '' };
              const simTracks = sim.tracks || sim.songs || [];
              return (
                <div key={simArtist.name || sIdx}>
                  {/* Header with Circular Avatar and Arrow */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div
                      onClick={() => openArtist(simArtist)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0 bg-neutral-800 shadow-md">
                        <img
                          src={simArtist.image}
                          alt={simArtist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-white/50 font-medium block leading-none">
                          Serupa dengan
                        </span>
                        <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight mt-0.5">
                          {simArtist.name}
                        </h2>
                      </div>
                    </div>

                    <button
                      onClick={() => openArtist(simArtist)}
                      className="p-2 text-white/40 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      title={`Buka ${simArtist.name}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Horizontal scroll of tracks */}
                  <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
                    {simTracks.map((song) => renderHorizontalTrackCard(song, simTracks))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 7. VIRAL ON TIKTOK (Horizontal Square Cards seperti di foto 5) */}
        {sectionsData?.viralTikTok && sectionsData.viralTikTok.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Viral On Tiktok
              </h2>
            </div>

            <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
              {(sectionsData.viralTikTok || []).map((song) =>
                renderHorizontalTrackCard(song, sectionsData.viralTikTok || [])
              )}
            </div>
          </div>
        )}

        {/* 8. FEEL-GOOD ROCK (Horizontal Square Cards seperti di foto 5) */}
        {sectionsData?.feelGoodRock && sectionsData.feelGoodRock.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Feel-good rock
              </h2>
            </div>

            <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
              {(sectionsData.feelGoodRock || []).map((song) =>
                renderHorizontalTrackCard(song, sectionsData.feelGoodRock || [])
              )}
            </div>
          </div>
        )}

        {/* 9. ACOUSTIC CHILL (Horizontal Square Cards seperti di foto 6) */}
        {sectionsData?.acousticChill && sectionsData.acousticChill.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Acoustic Chill
              </h2>
            </div>

            <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
              {(sectionsData.acousticChill || []).map((song) =>
                renderHorizontalTrackCard(song, sectionsData.acousticChill || [])
              )}
            </div>
          </div>
        )}

        {/* 10. FOR EID GETAWAYS (Horizontal Square Cards seperti di foto 6) */}
        {sectionsData?.eidGetaways && sectionsData.eidGetaways.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                For Eid Getaways
              </h2>
            </div>

            <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
              {(sectionsData.eidGetaways || []).map((song) =>
                renderHorizontalTrackCard(song, sectionsData.eidGetaways || [])
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
