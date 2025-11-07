import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table with role (Client or Agent)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'client' or 'agent'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Shipments table
export const shipments = sqliteTable('shipments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: integer('client_id').notNull().references(() => users.id),
  serviceType: text('service_type').notNull(), // 'transport', 'customs', 'storage', 'shipping'
  description: text('description').notNull(),
  weight: real('weight').notNull(),
  dimensions: text('dimensions').notNull(), // JSON string: {length, width, height}
  pickupAddress: text('pickup_address').notNull(),
  pickupDate: integer('pickup_date', { mode: 'timestamp' }).notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryDate: integer('delivery_date', { mode: 'timestamp' }).notNull(),
  requiredDocuments: text('required_documents'), // JSON string array
  notes: text('notes'),
  status: text('status').notNull().default('pending'), // 'pending', 'offers_received', 'offer_accepted', 'in_progress', 'completed'
  acceptedOfferId: integer('accepted_offer_id'), // Reference to accepted offer
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Offers table
export const offers = sqliteTable('offers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: integer('agent_id').notNull().references(() => users.id),
  shipmentId: integer('shipment_id').notNull().references(() => shipments.id),
  price: real('price').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'accepted', 'rejected'
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'new_offer', 'offer_accepted', 'offer_rejected'
  title: text('title').notNull(),
  message: text('message').notNull(),
  shipmentId: integer('shipment_id').references(() => shipments.id),
  offerId: integer('offer_id').references(() => offers.id),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  shipments: many(shipments),
  offers: many(offers),
  notifications: many(notifications),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  client: one(users, {
    fields: [shipments.clientId],
    references: [users.id],
  }),
  offers: many(offers),
  acceptedOffer: one(offers, {
    fields: [shipments.acceptedOfferId],
    references: [offers.id],
  }),
  notifications: many(notifications),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  agent: one(users, {
    fields: [offers.agentId],
    references: [users.id],
  }),
  shipment: one(shipments, {
    fields: [offers.shipmentId],
    references: [shipments.id],
  }),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  shipment: one(shipments, {
    fields: [notifications.shipmentId],
    references: [shipments.id],
  }),
  offer: one(offers, {
    fields: [notifications.offerId],
    references: [offers.id],
  }),
}));



