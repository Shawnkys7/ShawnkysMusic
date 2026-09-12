import React, { useState } from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { BottomNav } from './components/BottomNav';
import { Player } from './components/Player';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { LikedSongsView } from './components/LikedSongsView';
import { PlaylistView } from './components/PlaylistView';
import { ArtistView } from './components/ArtistView';
import { TopIndonesiaView } from './components/TopIndonesiaView';
import { HistoryModal } from './components/HistoryModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';

const MainApp: React.FC = () => {
  const { currentView, activePlaylistId } = useMusic();
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  const renderCurrentView = () => {
    if (activePlaylistId) {
      return <PlaylistView />;
    }

    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'top':
        return <TopIndonesiaView />;
      case 'library':
        return <LibraryView onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)} />;
      case 'liked':
        return <LikedSongsView />;
      case 'playlist':
        return <PlaylistView />;
      case 'artist':
        return <ArtistView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="h-full w-full bg-[#0A0A0C] text-white flex flex-col font-sans antialiased relative selection:bg-white/20 overflow-hidden">
      {/* Solid Dark Background */}
      <div className="fixed inset-0 bg-[#0A0A0C] pointer-events-none -z-10" />

      {/* Main Content Area - Full vertical scrolling */}
      <main
        id="main-content-scroll"
        className="flex-1 w-full overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain"
      >
        {renderCurrentView()}
      </main>

      {/* Floating Mini Player & Full-Screen Player Modal */}
      <Player />

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav />

      {/* Modal Dialogs */}
      <HistoryModal />
      <AddToPlaylistModal />
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <MusicProvider>
      <MainApp />
    </MusicProvider>
  );
}
