export interface EventAlbum {
  id: string; // 6-digit unique code
  name: string;
  description?: string;
  eventDate: Date;
  marinationEndDate: Date; // When photos become visible
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  creatorDisplayName: string;
  
  // Member management
  memberIds: string[]; // Array of user IDs who joined
  memberDetails: AlbumMember[]; // Detailed member info
  
  // Photo management
  photoCount: number;
  photos: string[]; // Array of photo IDs (for future use)
  
  // Settings
  isPrivate: boolean; // Whether album requires approval to join
  allowGuestUploads: boolean; // Whether non-registered users can upload
  maxPhotosPerUser?: number; // Optional limit
  
  // Status
  status: 'active' | 'marinated' | 'archived';
  isMarinated: boolean; // Computed field for easy querying
  
  // Notifications
  notificationSettings: {
    notifyOnNewMembers: boolean;
    notifyOnNewPhotos: boolean;
    notifyOnMarination: boolean;
  };
}

export interface AlbumMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  joinedAt: Date;
  role: 'creator' | 'member';
  photoCount: number; // How many photos they've contributed
}

export interface CreateAlbumData {
  name: string;
  description?: string;
  eventDate: Date;
  marinationEndDate: Date;
  isPrivate?: boolean;
  allowGuestUploads?: boolean;
  maxPhotosPerUser?: number;
}