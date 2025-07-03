import { 
  users, 
  biometricProfiles, 
  conversations, 
  systemCommands, 
  userPreferences,
  type User, 
  type InsertUser,
  type BiometricProfile,
  type InsertBiometricProfile,
  type Conversation,
  type InsertConversation,
  type SystemCommand,
  type InsertSystemCommand,
  type UserPreferences,
  type InsertUserPreferences
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Biometric profiles
  getBiometricProfile(userId: number): Promise<BiometricProfile | undefined>;
  getAllBiometricProfiles(): Promise<BiometricProfile[]>;
  createBiometricProfile(profile: InsertBiometricProfile): Promise<BiometricProfile>;
  
  // Conversations
  getConversationHistory(userId: number, limit?: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // System commands
  createSystemCommand(command: InsertSystemCommand): Promise<SystemCommand>;
  getSystemCommands(userId: number): Promise<SystemCommand[]>;
  
  // User preferences
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: number, preferences: any): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private biometricProfiles: Map<number, BiometricProfile>;
  private conversations: Map<number, Conversation>;
  private systemCommands: Map<number, SystemCommand>;
  private userPreferences: Map<number, UserPreferences>;
  private currentUserId: number;
  private currentBiometricId: number;
  private currentConversationId: number;
  private currentCommandId: number;
  private currentPreferencesId: number;

  constructor() {
    this.users = new Map();
    this.biometricProfiles = new Map();
    this.conversations = new Map();
    this.systemCommands = new Map();
    this.userPreferences = new Map();
    this.currentUserId = 1;
    this.currentBiometricId = 1;
    this.currentConversationId = 1;
    this.currentCommandId = 1;
    this.currentPreferencesId = 1;
    
    // Create default creator user
    this.createUser({
      username: "creator",
      password: "nexus_creator_2024",
      fullName: "N.E.X.U.S. Creator"
    }).then(user => {
      // Mark as creator
      this.users.set(user.id, { ...user, isCreator: true });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isCreator: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getBiometricProfile(userId: number): Promise<BiometricProfile | undefined> {
    return Array.from(this.biometricProfiles.values()).find(
      profile => profile.userId === userId
    );
  }

  async getAllBiometricProfiles(): Promise<BiometricProfile[]> {
    return Array.from(this.biometricProfiles.values()).filter(
      profile => profile.isActive
    );
  }

  async createBiometricProfile(profile: InsertBiometricProfile): Promise<BiometricProfile> {
    const id = this.currentBiometricId++;
    const biometricProfile: BiometricProfile = {
      ...profile,
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.biometricProfiles.set(id, biometricProfile);
    return biometricProfile;
  }

  async getConversationHistory(userId: number, limit = 10): Promise<Conversation[]> {
    const userConversations = Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
    
    return userConversations.reverse(); // Return in chronological order
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conv: Conversation = {
      ...conversation,
      id,
      createdAt: new Date()
    };
    this.conversations.set(id, conv);
    return conv;
  }

  async createSystemCommand(command: InsertSystemCommand): Promise<SystemCommand> {
    const id = this.currentCommandId++;
    const systemCommand: SystemCommand = {
      ...command,
      id,
      executed: false,
      result: null,
      createdAt: new Date()
    };
    this.systemCommands.set(id, systemCommand);
    return systemCommand;
  }

  async getSystemCommands(userId: number): Promise<SystemCommand[]> {
    return Array.from(this.systemCommands.values())
      .filter(cmd => cmd.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      prefs => prefs.userId === userId
    );
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const updated: UserPreferences = {
        ...existing,
        preferences,
        updatedAt: new Date()
      };
      this.userPreferences.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentPreferencesId++;
      const newPrefs: UserPreferences = {
        id,
        userId,
        preferences,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.userPreferences.set(id, newPrefs);
      return newPrefs;
    }
  }
}

export const storage = new MemStorage();
