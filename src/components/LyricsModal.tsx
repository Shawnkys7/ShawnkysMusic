import React, { useMemo, useEffect, useRef } from 'react';
import { X, Mic2, Music, Loader2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { SyncedLine } from '../types';

function parseSyncedLyrics(lrcText: string): SyncedLine[] {
  const lines = lrcText.split('\n');
  const result: SyncedLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time: totalSeconds, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

export const LyricsModal: React.FC = () => {
  const {
    currentSong,
    currentTime,
    seekTo,
    isLyricsOpen,
    setIsLyricsOpen,
    lyricsData,
    isLoadingLyrics,
  } = useMusic();

  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  const syncedLines = useMemo(() => {
    if (!lyricsData?.syncedLyrics) return [];
    return parseSyncedLyrics(lyricsData.syncedLyrics);
  }, [lyricsData?.syncedLyrics]);

  // Find index of current active line
  const activeLineIndex = useMemo(() => {
    if (syncedLines.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < syncedLines.length; i++) {
      if (currentTime >= syncedLines[i].time - 0.2) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [currentTime, syncedLines]);

  // Auto-scroll to active line smoothly
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  if (!isLyricsOpen || !currentSong) return null;

  return (
    <div
      id="spotify-lyrics-view"
      className="fixed inset-0 z-50 bg-[#121212]/95 backdrop-blur-2xl flex flex-col p-4 sm:p-8 select-none text-white animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img
            src={currentSong.image}
            alt={currentSong.title}
            className="w-12 h-12 rounded-md object-cover shadow-md bg-zinc-900"
          />
          <div className="overflow-hidden">
            <h2 className="text-base sm:text-lg font-extrabold truncate text-white">{currentSong.title}</h2>
            <p className="text-xs sm:text-sm text-zinc-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLyricsOpen(false)}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Tutup Lirik"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto py-8 sm:py-12 max-w-3xl mx-auto w-full scroll-smooth">
        {isLoadingLyrics ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 text-zinc-400">
            <Loader2 className="w-10 h-10 text-[#1ED760] animate-spin" />
            <p className="text-base font-semibold">Mengambil lirik lagu...</p>
          </div>
        ) : lyricsData?.instrumental ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 text-zinc-400">
            <Music className="w-16 h-16 text-zinc-600" />
            <p className="text-xl font-bold text-white">Lagu Instrumental</p>
            <p className="text-sm text-zinc-400">Trek ini tidak memiliki lirik vokal.</p>
          </div>
        ) : syncedLines.length > 0 ? (
          /* Synced Lyrics with interactive time jumping */
          <div className="space-y-6 sm:space-y-8 text-center sm:text-left px-4">
            {syncedLines.map((line, idx) => {
              const isActive = idx === activeLineIndex;
              const isPast = idx < activeLineIndex;
              return (
                <p
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seekTo(line.time)}
                  className={`text-xl sm:text-3xl lg:text-4xl font-extrabold cursor-pointer transition-all duration-300 leading-snug ${
                    isActive
                      ? 'text-white scale-[1.03] origin-left drop-shadow-md'
                      : isPast
                      ? 'text-zinc-500 hover:text-zinc-300'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        ) : lyricsData?.plainLyrics ? (
          /* Plain Lyrics fallback */
          <div className="space-y-4 text-center sm:text-left px-4">
            <span className="text-xs uppercase font-bold text-[#1ED760] tracking-wider mb-2 block">
              Teks Lirik Lengkap
            </span>
            <div className="text-lg sm:text-2xl font-bold text-zinc-300 whitespace-pre-line leading-relaxed">
              {lyricsData.plainLyrics}
            </div>
          </div>
        ) : (
          /* No Lyrics Found */
          <div className="h-full flex flex-col items-center justify-center space-y-3 text-zinc-400">
            <Mic2 className="w-16 h-16 text-zinc-600" />
            <p className="text-xl font-bold text-white">Lirik Belum Tersedia</p>
            <p className="text-sm text-zinc-400 max-w-sm text-center">
              Lirik untuk lagu "{currentSong.title}" sedang dalam pembaruan database publik.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
