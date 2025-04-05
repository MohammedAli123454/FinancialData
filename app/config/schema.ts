import { pgTable, serial, text, varchar, date, integer, numeric } from "drizzle-orm/pg-core";

export const rolesEnum = ['admin', 'superuser', 'user'] as const;
export type UserRole = typeof rolesEnum[number];

import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'superuser', 'user']).default('user'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   username: varchar('username', { length: 50 }).unique().notNull(),
//   email: varchar("email", { length: 100 }).unique().notNull(),
//   password: varchar('password', { length: 100 }).notNull(),
//   role: varchar('role', { length: 20 }).notNull().default('user'),
// });

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  role: text('role', { enum: ["admin", "Super User", "User"] })
    .notNull()
    .default("User"),
});

export const mocs = pgTable("mocs", {
  id: serial("id").primaryKey(),
  mocNo: text("moc_no").notNull(),
  cwo: text("cwo").notNull(),
  po: text("po").notNull(),
  proposal: text("proposal").notNull(),
  contractValue: numeric("contract_value", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 255 }),
  type: text("type").notNull(),
  category: text("category").notNull(),
  issuedDate: date("issued_date").notNull(),
  signedDate: date("signed_date").notNull(),
  pssrStatus: text("pssr_status"),
  prbStatus: text("prb_status"),
  remarks: text("remarks"),
});

export const partialInvoices = pgTable("partial_invoices", {
  id: serial("id").primaryKey(),
  mocId: integer("moc_id").references(() => mocs.id).notNull(),
  invoiceNo: text("invoice_no").notNull(),
  invoiceDate: date("invoice_date").notNull(),
  receiptDate: date("receipt_date"), // Field is nullable by d
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  vat: numeric("vat", { precision: 12, scale: 2 }).notNull(),
  retention: numeric("retention", { precision: 12, scale: 2 }).notNull(),
  payable: numeric("payable", { precision: 12, scale: 2 }).notNull(),
  invoiceStatus: text("invoice_status").notNull(),
});


export type User = typeof users.$inferSelect;
