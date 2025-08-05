import { AlbumMember, CreateAlbumData, EventAlbum } from '@/types/albums';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { LaterGramUser } from './authSevice';

class AlbumService {
  private readonly albumsCollection = 'albums';
  private readonly usersCollection = 'users';

  // Generate a unique 6-digit album code
  private generateAlbumCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Check if album code already exists
  private async isCodeUnique(code: string): Promise<boolean> {
    const albumQuery = query(
      collection(db, this.albumsCollection),
      where('id', '==', code)
    );
    const snapshot = await getDocs(albumQuery);
    return snapshot.empty;
  }

  // Generate a unique album code (retry if duplicate)
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateAlbumCode();
      isUnique = await this.isCodeUnique(code);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique album code after maximum attempts');
      }
    } while (!isUnique);

    return code;
  }

  // Create a new event album
  async createAlbum(albumData: CreateAlbumData, creator: LaterGramUser): Promise<EventAlbum> {
    try {
      const albumId = await this.generateUniqueCode();
      
      const creatorMember: AlbumMember = {
        userId: creator.uid,
        displayName: creator.displayName || 'Unknown User',
        photoURL: creator.photoURL || undefined,
        joinedAt: new Date(),
        role: 'creator',
        photoCount: 0
      };

      const album: Omit<EventAlbum, 'createdAt' | 'updatedAt'> = {
        id: albumId,
        name: albumData.name.trim(),
        description: albumData.description?.trim(),
        eventDate: albumData.eventDate,
        marinationEndDate: albumData.marinationEndDate,
        creatorId: creator.uid,
        creatorDisplayName: creator.displayName || 'Unknown User',
        
        memberIds: [creator.uid],
        memberDetails: [creatorMember],
        
        photoCount: 0,
        photos: [],
        
        isPrivate: albumData.isPrivate || false,
        allowGuestUploads: albumData.allowGuestUploads || true,
        
        status: 'active',
        isMarinated: albumData.marinationEndDate <= new Date(),
        
        notificationSettings: {
          notifyOnNewMembers: true,
          notifyOnNewPhotos: true,
          notifyOnMarination: true
        }
      };

      // Use transaction to ensure data consistency
      const result = await runTransaction(db, async (transaction) => {
        // Create album document with the code as document ID
        const albumRef = doc(db, this.albumsCollection, albumId);
        const albumWithTimestamps = {
          ...album,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        transaction.set(albumRef, albumWithTimestamps);

        // Update user's ownedAlbums array
        const userRef = doc(db, this.usersCollection, creator.uid);
        transaction.update(userRef, {
          ownedAlbums: arrayUnion(albumId)
        });

        return { ...albumWithTimestamps, createdAt: new Date(), updatedAt: new Date() } as EventAlbum;
      });

      console.log('Album created successfully:', albumId);
      return result;
    } catch (error) {
      console.error('Error creating album:', error);
      throw new Error('Failed to create album. Please try again.');
    }
  }

  // Get album by ID
  async getAlbumById(albumId: string): Promise<EventAlbum | null> {
    try {
      const albumRef = doc(db, this.albumsCollection, albumId);
      const albumDoc = await getDoc(albumRef);
      
      if (!albumDoc.exists()) {
        return null;
      }

      const data = albumDoc.data();
      return {
        ...data,
        eventDate: data.eventDate.toDate(),
        marinationEndDate: data.marinationEndDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        memberDetails: data.memberDetails.map((member: any) => ({
          ...member,
          joinedAt: member.joinedAt.toDate()
        }))
      } as EventAlbum;
    } catch (error) {
      console.error('Error getting album:', error);
      throw new Error('Failed to fetch album');
    }
  }

  // Join an album with code
  async joinAlbum(albumId: string, user: LaterGramUser): Promise<EventAlbum> {
    try {
      return await runTransaction(db, async (transaction) => {
        const albumRef = doc(db, this.albumsCollection, albumId);
        const albumDoc = await transaction.get(albumRef);
        
        if (!albumDoc.exists()) {
          throw new Error('Album not found with this code');
        }

        const albumData = albumDoc.data() as any;
        
        // Check if user is already a member
        if (albumData.memberIds.includes(user.uid)) {
          throw new Error('You are already a member of this album');
        }

        const newMember: AlbumMember = {
          userId: user.uid,
          displayName: user.displayName || 'Unknown User',
          photoURL: user.photoURL || undefined,
          joinedAt: new Date(),
          role: 'member',
          photoCount: 0
        };

        // Update album with new member
        transaction.update(albumRef, {
          memberIds: arrayUnion(user.uid),
          memberDetails: arrayUnion({
            ...newMember,
            joinedAt: serverTimestamp()
          }),
          updatedAt: serverTimestamp()
        });

        // Update user's joinedAlbums
        const userRef = doc(db, this.usersCollection, user.uid);
        transaction.update(userRef, {
          joinedAlbums: arrayUnion(albumId)
        });

        // Return updated album data
        return {
          ...albumData,
          eventDate: albumData.eventDate.toDate(),
          marinationEndDate: albumData.marinationEndDate.toDate(),
          createdAt: albumData.createdAt.toDate(),
          updatedAt: new Date(),
          memberIds: [...albumData.memberIds, user.uid],
          memberDetails: [...albumData.memberDetails.map((member: any) => ({
            ...member,
            joinedAt: member.joinedAt.toDate()
          })), newMember]
        } as EventAlbum;
      });
    } catch (error) {
      console.error('Error joining album:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to join album. Please try again.');
    }
  }

  // Leave an album
  async leaveAlbum(albumId: string, userId: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const albumRef = doc(db, this.albumsCollection, albumId);
        const albumDoc = await transaction.get(albumRef);
        
        if (!albumDoc.exists()) {
          throw new Error('Album not found');
        }

        const albumData = albumDoc.data();
        
        // Can't leave if you're the creator
        if (albumData.creatorId === userId) {
          throw new Error('Album creator cannot leave the album');
        }

        // Remove from memberIds
        const updatedMemberIds = albumData.memberIds.filter((id: string) => id !== userId);
        
        // Remove from memberDetails
        const updatedMemberDetails = albumData.memberDetails.filter(
          (member: any) => member.userId !== userId
        );

        // Update album
        transaction.update(albumRef, {
          memberIds: updatedMemberIds,
          memberDetails: updatedMemberDetails,
          updatedAt: serverTimestamp()
        });

        // Update user's joinedAlbums
        const userRef = doc(db, this.usersCollection, userId);
        transaction.update(userRef, {
          joinedAlbums: arrayRemove(albumId)
        });
      });
    } catch (error) {
      console.error('Error leaving album:', error);
      throw error;
    }
  }

  // Get albums created by user
  async getUserOwnedAlbums(userId: string): Promise<EventAlbum[]> {
    try {
      const albumsQuery = query(
        collection(db, this.albumsCollection),
        where('creatorId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(albumsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          eventDate: data.eventDate.toDate(),
          marinationEndDate: data.marinationEndDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          memberDetails: data.memberDetails.map((member: any) => ({
            ...member,
            joinedAt: member.joinedAt.toDate()
          }))
        } as EventAlbum;
      });
    } catch (error) {
      console.error('Error getting user albums:', error);
      throw new Error('Failed to fetch user albums');
    }
  }

  // Get albums user has joined
  async getUserJoinedAlbums(userId: string): Promise<EventAlbum[]> {
    try {
      const albumsQuery = query(
        collection(db, this.albumsCollection),
        where('memberIds', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(albumsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          eventDate: data.eventDate.toDate(),
          marinationEndDate: data.marinationEndDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          memberDetails: data.memberDetails.map((member: any) => ({
            ...member,
            joinedAt: member.joinedAt.toDate()
          }))
        } as EventAlbum;
      });
    } catch (error) {
      console.error('Error getting joined albums:', error);
      throw new Error('Failed to fetch joined albums');
    }
  }

  // Update album marination status based on current time
  async updateMarinationStatus(albumId: string): Promise<void> {
    try {
      const albumRef = doc(db, this.albumsCollection, albumId);
      const albumDoc = await getDoc(albumRef);
      
      if (!albumDoc.exists()) {
        throw new Error('Album not found');
      }

      const albumData = albumDoc.data();
      const now = new Date();
      const marinationEndDate = albumData.marinationEndDate.toDate();
      const isMarinated = marinationEndDate <= now;

      if (albumData.isMarinated !== isMarinated) {
        await updateDoc(albumRef, {
          isMarinated,
          status: isMarinated ? 'marinated' : 'active',
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating marination status:', error);
      throw new Error('Failed to update album status');
    }
  }

  // Validate album code format
  isValidAlbumCode(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code);
  }

  // Delete album (only by creator)
  async deleteAlbum(albumId: string, userId: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const albumRef = doc(db, this.albumsCollection, albumId);
        const albumDoc = await transaction.get(albumRef);
        
        if (!albumDoc.exists()) {
          throw new Error('Album not found');
        }

        const albumData = albumDoc.data();
        
        // Only creator can delete
        if (albumData.creatorId !== userId) {
          throw new Error('Only the album creator can delete this album');
        }

        // Remove album from all members' arrays
        const batch = writeBatch(db);
        
        for (const memberId of albumData.memberIds) {
          const userRef = doc(db, this.usersCollection, memberId);
          if (memberId === userId) {
            // Remove from ownedAlbums for creator
            batch.update(userRef, {
              ownedAlbums: arrayRemove(albumId)
            });
          } else {
            // Remove from joinedAlbums for members
            batch.update(userRef, {
              joinedAlbums: arrayRemove(albumId)
            });
          }
        }

        // Delete the album document
        transaction.delete(albumRef);
        
        await batch.commit();
      });
    } catch (error) {
      console.error('Error deleting album:', error);
      throw error;
    }
  }

  // Get album member count
  async getAlbumMemberCount(albumId: string): Promise<number> {
    try {
      const album = await this.getAlbumById(albumId);
      return album ? album.memberIds.length : 0;
    } catch (error) {
      console.error('Error getting member count:', error);
      return 0;
    }
  }

  // Check if user is album member
  async isUserAlbumMember(albumId: string, userId: string): Promise<boolean> {
    try {
      const album = await this.getAlbumById(albumId);
      return album ? album.memberIds.includes(userId) : false;
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  }

  // Get user's role in album
  async getUserRoleInAlbum(albumId: string, userId: string): Promise<'creator' | 'member' | null> {
    try {
      const album = await this.getAlbumById(albumId);
      if (!album) return null;
      
      const member = album.memberDetails.find(m => m.userId === userId);
      return member ? member.role : null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }
}

export const albumService = new AlbumService();