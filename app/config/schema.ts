import { pgTable, serial, text, varchar, date, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";

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
  role: text('role', { enum: ["admin", "superuser", "user"] })
    .notNull()
    .default("user"),
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



export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  Supplier: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 100 }).notNull(),
});


export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').notNull().references(() => suppliers.id),
  poNumber: varchar('po_number', { length: 50 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(), // ✅ moved here
  poValue: numeric('po_value').notNull(),
  poValueWithVAT: numeric('po_value_with_vat').notNull(),
});


export const currencyRates = pgTable('currency_rates', {
  currency: varchar('currency', { length: 10 }).primaryKey(),
  rate: numeric('rate').notNull(), // Rate to SAR
});


export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  admissionNumber: varchar('admission_number', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  nationality: varchar('nationality', { length: 50 }),
  religion: varchar('religion', { length: 50 }),
  category: varchar('category', { length: 50 }),
  bloodGroup: varchar('blood_group', { length: 5 }),
  motherTongue: varchar('mother_tongue', { length: 50 }),
  photoUrl: text('photo_url'),
  admissionDate: date('admission_date').notNull(),
  classEnrolled: varchar('class_enrolled', { length: 20 }).notNull(),
  section: varchar('section', { length: 10 }),
  previousSchool: varchar('previous_school', { length: 100 }),
  transferCertificateNo: varchar('transfer_certificate_no', { length: 50 }),
  fatherName: varchar('father_name', { length: 100 }),
  fatherOccupation: varchar('father_occupation', { length: 100 }),
  motherName: varchar('mother_name', { length: 100 }),
  motherOccupation: varchar('mother_occupation', { length: 100 }),
  guardianName: varchar('guardian_name', { length: 100 }),
  guardianRelation: varchar('guardian_relation', { length: 50 }),
  contactPhonePrimary: varchar('contact_phone_primary', { length: 20 }).notNull(),
  contactPhoneSecondary: varchar('contact_phone_secondary', { length: 20 }),
  email: varchar('email', { length: 100 }),
  addressLine1: varchar('address_line1', { length: 200 }),
  addressLine2: varchar('address_line2', { length: 200 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  aadharNumber: varchar('aadhar_number', { length: 20 }),
  healthIssues: text('health_issues'),
  specialNeeds: text('special_needs'),
  transportMode: varchar('transport_mode', { length: 50 }),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),

  certified_date: date("certified_date").notNull(),
  invoice_no: varchar("invoice_no", { length: 50 }).notNull(),
  invoice_date: date("invoice_date").notNull(),
  payment_type: varchar("payment_type", { length: 50 }).notNull(),
  payment_due_date: date("payment_due_date").notNull(),
  invoice_amount: numeric("invoice_amount", { precision: 12, scale: 2 }).notNull(),
  payable: numeric("payable", { precision: 12, scale: 2 }).notNull(),
  supplier_id: integer("supplier_id").references(() => suppliers.id).notNull(), // assumes suppliers table exists
  po_number: varchar("po_number", { length: 50 }).notNull(),
  contract_type: varchar("contract_type", { length: 50 }).notNull(),
  certified: boolean("certified").default(false).notNull(),
  created_at: date("created_at").defaultNow(), // or timestamp("created_at", { withTimezone: true }).defaultNow()
});


export type User = typeof users.$inferSelect;
