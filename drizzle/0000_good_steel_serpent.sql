CREATE TABLE IF NOT EXISTS "mocs" (
	"id" serial PRIMARY KEY NOT NULL,
	"moc_no" text NOT NULL,
	"cwo" text NOT NULL,
	"po" text NOT NULL,
	"proposal" text NOT NULL,
	"contract_value" numeric(12, 2) NOT NULL,
	"description" text,
	"short_description" varchar(255),
	"type" text NOT NULL,
	"category" text NOT NULL,
	"issued_date" date NOT NULL,
	"signed_date" date NOT NULL,
	"pssr_status" text,
	"prb_status" text,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partial_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"moc_id" integer NOT NULL,
	"invoice_no" text NOT NULL,
	"invoice_date" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"vat" numeric(12, 2) NOT NULL,
	"retention" numeric(12, 2) NOT NULL,
	"payable" numeric(12, 2) NOT NULL,
	"invoice_status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(100) NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partial_invoices" ADD CONSTRAINT "partial_invoices_moc_id_mocs_id_fk" FOREIGN KEY ("moc_id") REFERENCES "public"."mocs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
