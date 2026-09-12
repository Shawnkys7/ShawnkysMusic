import React, { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon,
  ArrowLeft,
  X,
  Play,
  Pause,
  Heart,
  MoreVertical,
  PlusCircle,
  ListPlus,
  User,
  Music2,
  Check,
  Loader2,
  Disc3,
  Video as VideoIcon,
  ListMusic,
  ExternalLink,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Song } from '../types';

// Filters without 'Semua', defaulting to 'Lagu'
const SEARCH_FILTERS = ['Lagu', 'Video', 'Album', 'Artis', 'Daftar putar'];

const POPULAR_SUGGESTIONS = [
  'XXXTentacion',
  'Bernadya Satu Bulan',
  'Sal Priadi Gala Bunga Matahari',
  'Juicy Luicy Lampu Kuning',
  'Hindia Rumah Ke Rumah',
  'Tulus Hati-Hati di Jalan',
  'Mahalini Sial',
  'Billie Eilish Birds of a Feather',
];

const FILTER_TYPE_MAP: Record<string, string> = {
  Lagu: 'song',
  Video: 'video',
  Album: 'album',
  Artis: 'artist',
  'Daftar putar': 'playlist',
};

export const SearchView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    toggleLike,
    isLiked,
    addToQueue,
    setCurrentView,
    openArtist,
    setTrackToAddToPlaylist,
  } = useMusic();

  // Default to 'Lagu' as requested
  const [activeFilter, setActiveFilter] = useState('Lagu');
  const [results, setResults] = useState<Song[]>([]);
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [albumResults, setAlbumResults] = useState<any[]>([]);
  const [playlistResults, setPlaylistResults] = useState<any[]>([]);
  const [topMatchedArtist, setTopMatchedArtist] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const executeSearch = async (queryText: string, filterName: string = activeFilter) => {
    const q = queryText.trim();
    if (!q) {
      setResults([]);
      setArtistResults([]);
      setAlbumResults([]);
      setPlaylistResults([]);
      setTopMatchedArtist(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const filterParam = FILTER_TYPE_MAP[filterName] || 'song';

    try {
      if (filterName === 'Artis') {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&type=artist`
        );
        const data = res.ok ? await res.json() : [];
        setArtistResults(Array.isArray(data) ? data : []);
        setResults([]);
        setAlbumResults([]);
        setPlaylistResults([]);
        setTopMatchedArtist(null);
      } else if (filterName === 'Album') {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&type=album`
        );
        const data = res.ok ? await res.json() : [];
        setAlbumResults(Array.isArray(data) ? data : []);
        setResults([]);
        setArtistResults([]);
        setPlaylistResults([]);
        setTopMatchedArtist(null);
      } else if (filterName === 'Daftar putar') {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&type=playlist`
        );
        const data = res.ok ? await res.json() : [];
        setPlaylistResults(Array.isArray(data) ? data : []);
        setResults([]);
        setArtistResults([]);
        setAlbumResults([]);
        setTopMatchedArtist(null);
      } else {
        // 'Lagu' or 'Video'
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(filterParam)}`
        );
        const data = res.ok ? await res.json() : [];

        setArtistResults([]);
        setAlbumResults([]);
        setPlaylistResults([]);

        if (Array.isArray(data)) {
          const seenIds = new Set<string>();
          const mapped: Song[] = [];

          for (const item of data) {
            const videoId =
              item.videoId || (item.type === 'SONG' || item.type === 'VIDEO' ? item.id : null);
            const uniqueId = videoId
              ? `yt_${videoId}`
              : item.id || `track_${Date.now()}_${Math.random()}`;

            if (seenIds.has(uniqueId)) continue;
            seenIds.add(uniqueId);

            let cover =
              item.thumbnail ||
              item.thumbnails?.[item.thumbnails.length - 1]?.url ||
              item.thumbnails?.[0]?.url;

            if (cover && cover.includes('googleusercontent.com')) {
              cover = cover.replace(/=w\d+-h\d+.*$/, '=w600-h600-l90-rj');
            }
            if (!cover && videoId) {
              cover = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }

            mapped.push({
              id: uniqueId,
              videoId: videoId || undefined,
              title: item.title || item.name || 'Lagu',
              name: item.title || item.name || 'Lagu',
              artist:
                typeof item.artist === 'string'
                  ? item.artist
                  : item.artist?.name || item.artists || 'Artis',
              album: item.album?.name || (typeof item.album === 'string' ? item.album : 'Single'),
              duration: typeof item.duration === 'number' ? item.duration : 200,
              image: cover || 'https://i.ytimg.com/vi/D47mUu1b_54/hqdefault.jpg',
              source: 'youtube',
            });
          }
          setResults(mapped);

          // If searching in 'Lagu', also check for a top matching artist (e.g. XXXTentacion)
          if (filterName === 'Lagu') {
            fetch(`/api/search?q=${encodeURIComponent(q)}&type=artist`)
              .then((r) => (r.ok ? r.json() : []))
              .then((artList) => {
                if (Array.isArray(artList) && artList.length > 0) {
                  // If artist name closely matches query
                  const first = artList[0];
                  if (
                    first.name.toLowerCase().includes(q.toLowerCase()) ||
                    q.toLowerCase().includes(first.name.toLowerCase())
                  ) {
                    setTopMatchedArtist(first);
                  } else {
                    setTopMatchedArtist(null);
                  }
                } else {
                  setTopMatchedArtist(null);
                }
              })
              .catch(() => setTopMatchedArtist(null));
          }
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      setArtistResults([]);
      setAlbumResults([]);
      setPlaylistResults([]);
      setTopMatchedArtist(null);
      setIsSearching(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(searchQuery, activeFilter);
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, activeFilter]);

  const handleFilterClick = (filterName: string) => {
    setActiveFilter(filterName);
    if (searchQuery.trim()) {
      executeSearch(searchQuery, filterName);
    }
  };

  const handleSuggestionClick = (tag: string) => {
    setSearchQuery(tag);
    executeSearch(tag, activeFilter);
  };

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '3:20';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="search-view-container" className="pb-36 min-h-screen text-white select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Search Header */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/5 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('home')}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Capsule Search Bar (radius 40px, bg #242426) */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              id="search-input-field"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lagu, artis, atau album..."
              autoFocus
              className="w-full pl-10 pr-9 py-2.5 bg-[#242426] text-white placeholder-white/40 rounded-full border border-white/10 focus:outline-none focus:border-white/30 text-xs sm:text-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setResults([]);
                  setArtistResults([]);
                  setAlbumResults([]);
                  setPlaylistResults([]);
                  setTopMatchedArtist(null);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Bar: Lagu, Video, Album, Artis, Daftar putar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {SEARCH_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-[#242426] text-white/70 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4 max-w-2xl mx-auto space-y-4">
        {/* Empty Query State: Suggestions */}
        {!searchQuery && (
          <div className="py-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40 px-1">
              Pencarian Populer
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSuggestionClick(tag)}
                  className="px-4 py-2 rounded-full bg-[#1C1C1E] hover:bg-[#26262A] text-xs text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isSearching && (
          <div className="py-20 flex flex-col items-center justify-center text-white/40 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-white/70" />
          </div>
        )}

        {/* Top Matched Artist Card (when searching in 'Lagu') */}
        {!isSearching && topMatchedArtist && activeFilter === 'Lagu' && (
          <div
            onClick={() =>
              openArtist({
                name: topMatchedArtist.name,
                artistId: topMatchedArtist.artistId,
                image:
                  topMatchedArtist.thumbnail ||
                  topMatchedArtist.thumbnails?.[topMatchedArtist.thumbnails.length - 1]?.url,
              })
            }
            className="p-4 rounded-[28px] bg-gradient-to-r from-[#202024] to-[#161618] border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between shadow-xl group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/20 bg-neutral-900 shadow-md">
                <img
                  src={
                    topMatchedArtist.thumbnail ||
                    topMatchedArtist.thumbnails?.[topMatchedArtist.thumbnails.length - 1]?.url ||
                    'https://yt3.googleusercontent.com/No3I8pA9ows2dy6NElEr9mCXLzYxgjVvsQr7h69C03palsH1u8Q8iw-sAAUxav599Wmi64up8lbDGbI=w300-h300-p-l90-rj'
                  }
                  alt={topMatchedArtist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  Hasil Artis Teratas
                </span>
                <h3 className="text-base font-bold text-white truncate">
                  {topMatchedArtist.name}
                </h3>
                <p className="text-xs text-white/50">
                  Ketuk untuk lihat Album, Detail & Lagu
                </p>
              </div>
            </div>

            <button className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold shrink-0 flex items-center gap-1 group-hover:scale-105 transition-transform shadow-md">
              <span>Buka</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ARTIS Filter Results List */}
        {!isSearching && searchQuery && activeFilter === 'Artis' && artistResults.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40 px-1">
              Hasil Artis ({artistResults.length})
            </span>
            {artistResults.map((art, idx) => (
              <div
                key={art.artistId || idx}
                onClick={() =>
                  openArtist({
                    name: art.name,
                    artistId: art.artistId,
                    image:
                      art.thumbnail ||
                      art.thumbnails?.[art.thumbnails.length - 1]?.url,
                  })
                }
                className="flex items-center justify-between p-3.5 rounded-[24px] bg-[#1C1C1E] hover:bg-[#26262A] transition-all cursor-pointer border border-white/5 shadow-md group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/10 bg-neutral-900 shadow-sm">
                    <img
                      src={
                        art.thumbnail ||
                        art.thumbnails?.[art.thumbnails.length - 1]?.url ||
                        'https://yt3.googleusercontent.com/No3I8pA9ows2dy6NElEr9mCXLzYxgjVvsQr7h69C03palsH1u8Q8iw-sAAUxav599Wmi64up8lbDGbI=w300-h300-p-l90-rj'
                      }
                      alt={art.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{art.name}</h4>
                    <p className="text-xs text-white/50">
                      {art.subscribers || 'Artis Resmi'}
                    </p>
                  </div>
                </div>

                <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0 group-hover:bg-white group-hover:text-black transition-all">
                  Lihat Profil
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ALBUM Filter Results */}
        {!isSearching && searchQuery && activeFilter === 'Album' && albumResults.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40 px-1">
              Hasil Album ({albumResults.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {albumResults.map((alb, idx) => (
                <div
                  key={alb.albumId || idx}
                  onClick={() => {
                    if (alb.artist) {
                      openArtist({ name: alb.artist });
                    }
                  }}
                  className="bg-[#1C1C1E] border border-white/5 rounded-[28px] p-3 hover:bg-[#26262A] transition-all cursor-pointer group shadow-lg"
                >
                  <div className="aspect-square rounded-[22px] overflow-hidden bg-black/40 mb-2.5 shadow-md relative">
                    <img
                      src={alb.thumbnail || alb.thumbnails?.[0]?.url}
                      alt={alb.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h5 className="text-xs font-bold text-white truncate px-1">
                    {alb.name}
                  </h5>
                  <p className="text-[11px] text-white/50 px-1 truncate mt-0.5">
                    {alb.artist || 'Artis'} {alb.year ? `• ${alb.year}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYLIST Filter Results */}
        {!isSearching && searchQuery && activeFilter === 'Daftar putar' && playlistResults.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40 px-1">
              Daftar Putar ({playlistResults.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {playlistResults.map((pl, idx) => (
                <div
                  key={pl.playlistId || idx}
                  className="bg-[#1C1C1E] border border-white/5 rounded-[28px] p-3 hover:bg-[#26262A] transition-all cursor-pointer group shadow-lg"
                >
                  <div className="aspect-square rounded-[22px] overflow-hidden bg-black/40 mb-2.5 shadow-md relative">
                    <img
                      src={pl.thumbnail || pl.thumbnails?.[0]?.url}
                      alt={pl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h5 className="text-xs font-bold text-white truncate px-1">
                    {pl.name}
                  </h5>
                  <p className="text-[11px] text-white/50 px-1 truncate mt-0.5">
                    Playlist
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SONG & VIDEO Results List */}
        {!isSearching && searchQuery && results.length > 0 && (activeFilter === 'Lagu' || activeFilter === 'Video') && (
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40 px-1 block mb-2">
              {activeFilter === 'Video' ? 'Video Musik' : 'Lagu'} ({results.length})
            </span>
            {results.map((song, idx) => {
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
                      playSong(song, results);
                    }
                  }}
                >
                  {/* Square Cover Art (rounded-xl) */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5 shadow-md">
                    <img
                      src={song.image}
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
                            playSong(song, results);
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
            })}
          </div>
        )}

        {/* No Results */}
        {!isSearching &&
          searchQuery &&
          results.length === 0 &&
          artistResults.length === 0 &&
          albumResults.length === 0 &&
          playlistResults.length === 0 && (
            <div className="py-20 text-center text-white/40 space-y-2">
              <Music2 className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-semibold text-white">Tidak ada hasil ditemukan</p>
            </div>
          )}
      </div>
    </div>
  );
};
