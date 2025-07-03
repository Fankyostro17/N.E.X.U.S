import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isCreator: boolean("is_creator").default(false),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const biometricProfiles = pgTable("biometric_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  voiceprint: text("voiceprint"), // Encoded voice characteristics
  faceEncoding: text("face_encoding"), // Encoded facial features
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  isVoiceActivated: boolean("is_voice_activated").default(false),
  context: jsonb("context"), // Additional conversation context
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemCommands = pgTable("system_commands", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  command: text("command").notNull(),
  executed: boolean("executed").default(false),
  result: text("result"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  preferences: jsonb("preferences").notNull(), // User-specific AI personality and settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
});

export const insertBiometricProfileSchema = createInsertSchema(biometricProfiles).pick({
  userId: true,
  voiceprint: true,
  faceEncoding: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  userId: true,
  message: true,
  response: true,
  isVoiceActivated: true,
  context: true,
});

export const insertSystemCommandSchema = createInsertSchema(systemCommands).pick({
  userId: true,
  command: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  preferences: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BiometricProfile = typeof biometricProfiles.$inferSelect;
export type InsertBiometricProfile = z.infer<typeof insertBiometricProfileSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type SystemCommand = typeof systemCommands.$inferSelect;
export type InsertSystemCommand = z.infer<typeof insertSystemCommandSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
