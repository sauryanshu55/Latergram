// src/hooks/useAlbums.ts - Custom hook for album management
import { useAuth } from '@/contexts/AuthContext';
import { albumService } from '@/services/albumService';
import { EventAlbum } from '@/types/albums';
import { useCallback, useEffect, useState } from 'react';

export interface UseAlbumsReturn {
  // Data
  ownedAlbums: EventAlbum[];
  joinedAlbums: EventAlbum[];
  allUserAlbums: EventAlbum[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  refreshAlbums: () => Promise<void>;
  joinAlbum: (albumCode: string) => Promise<EventAlbum>;
  leaveAlbum: (albumId: string) => Promise<void>;
  deleteAlbum: (albumId: string) => Promise<void>;
  getAlbumById: (albumId: string) => Promise<EventAlbum | null>;
  
  // Utilities
  clearError: () => void;
}

export const useAlbums = (): UseAlbumsReturn => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [ownedAlbums, setOwnedAlbums] = useState<EventAlbum[]>([]);
  const [joinedAlbums, setJoinedAlbums] = useState<EventAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed value
  const allUserAlbums = [...ownedAlbums, ...joinedAlbums];

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load owned albums
  const loadOwnedAlbums = useCallback(async () => {
    if (!user) return;
    
    try {
      const albums = await albumService.getUserOwnedAlbums(user.uid);
      setOwnedAlbums(albums);
    } catch (err) {
      console.error('Error loading owned albums:', err);
      setError(err instanceof Error ? err.message : 'Failed to load owned albums');
    }
  }, [user]);

  // Load joined albums  
  const loadJoinedAlbums = useCallback(async () => {
    if (!user) return;
    
    try {
      const albums = await albumService.getUserJoinedAlbums(user.uid);
      // Filter out albums where user is also the creator (to avoid duplicates)
      const filteredAlbums = albums.filter(album => album.creatorId !== user.uid);
      setJoinedAlbums(filteredAlbums);
    } catch (err) {
      console.error('Error loading joined albums:', err);
      setError(err instanceof Error ? err.message : 'Failed to load joined albums');
    }
  }, [user]);

  // Refresh all albums
  const refreshAlbums = useCallback(async () => {
    if (!user) {
      setOwnedAlbums([]);
      setJoinedAlbums([]);
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      await Promise.all([loadOwnedAlbums(), loadJoinedAlbums()]);
    } catch (err) {
      console.error('Error refreshing albums:', err);
      setError('Failed to refresh albums');
    } finally {
      setIsRefreshing(false);
    }
  }, [user, loadOwnedAlbums, loadJoinedAlbums]);

  // Join album
  const joinAlbum = useCallback(async (albumCode: string): Promise<EventAlbum> => {
    if (!user) {
      throw new Error('User must be signed in to join albums');
    }

    setIsLoading(true);
    setError(null);

    try {
      const joinedAlbum = await albumService.joinAlbum(albumCode, user);
      
      // Refresh albums to get updated data
      await refreshAlbums();
      
      return joinedAlbum;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join album';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshAlbums]);

  // Leave album
  const leaveAlbum = useCallback(async (albumId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be signed in');
    }

    setIsLoading(true);
    setError(null);

    try {
      await albumService.leaveAlbum(albumId, user.uid);
      
      // Remove from local state immediately for better UX
      setJoinedAlbums(prev => prev.filter(album => album.id !== albumId));
      
      // Then refresh to ensure consistency
      await refreshAlbums();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave album';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshAlbums]);

  // Delete album
  const deleteAlbum = useCallback(async (albumId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be signed in');
    }

    setIsLoading(true);
    setError(null);

    try {
      await albumService.deleteAlbum(albumId, user.uid);
      
      // Remove from local state immediately
      setOwnedAlbums(prev => prev.filter(album => album.id !== albumId));
      
      // Refresh to ensure consistency
      await refreshAlbums();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete album';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshAlbums]);

  // Get album by ID
  const getAlbumById = useCallback(async (albumId: string): Promise<EventAlbum | null> => {
    setError(null);

    try {
      return await albumService.getAlbumById(albumId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch album';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Initial load and auth state changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        await refreshAlbums();
        setIsLoading(false);
      } else {
        setOwnedAlbums([]);
        setJoinedAlbums([]);
        setError(null);
      }
    };

    loadInitialData();
  }, [isAuthenticated, user, refreshAlbums]);

  return {
    // Data
    ownedAlbums,
    joinedAlbums,
    allUserAlbums,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error handling
    error,
    
    // Actions
    refreshAlbums,
    joinAlbum,
    leaveAlbum,
    deleteAlbum,
    getAlbumById,
    
    // Utilities
    clearError,
  };
};