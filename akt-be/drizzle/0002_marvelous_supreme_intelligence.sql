CREATE TABLE "customer_accounts" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"phone" varchar(50) DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_accounts_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"address_type" varchar(20) DEFAULT 'home' NOT NULL,
	"address_line" varchar(500) DEFAULT '' NOT NULL,
	"village" varchar(150) DEFAULT '' NOT NULL,
	"village_id" varchar(50),
	"district" varchar(150) DEFAULT '' NOT NULL,
	"district_id" varchar(50),
	"city" varchar(150) DEFAULT '' NOT NULL,
	"regency_id" varchar(50),
	"province" varchar(150) DEFAULT '' NOT NULL,
	"province_id" varchar(50),
	"postal_code" varchar(20) DEFAULT '' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_contacts" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"contact_type" varchar(20) DEFAULT 'phone' NOT NULL,
	"value" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_identities" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"identity_type" varchar(20) DEFAULT 'ktp' NOT NULL,
	"identity_number" varchar(100) NOT NULL,
	"file_id" varchar(255),
	"file_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_status_history" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"status" varchar(20) NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"changed_by" varchar(255) DEFAULT 'System' NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" varchar(36) NOT NULL,
	"sales_employee_id" varchar(36),
	"customer_number" varchar(20) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"customer_type" varchar(20) DEFAULT 'residential' NOT NULL,
	"registration_type" varchar(20) DEFAULT 'new' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"registered_at" date DEFAULT now() NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_customer_number_unique" UNIQUE("customer_number")
);
--> statement-breakpoint
CREATE TABLE "service_credentials" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" varchar(36) NOT NULL,
	"credential_type" varchar(20) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) DEFAULT '' NOT NULL,
	"secret_ref" varchar(255) DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_services" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar(36) NOT NULL,
	"service_type" varchar(20) DEFAULT 'pppoe' NOT NULL,
	"username" varchar(255) NOT NULL,
	"router_id" varchar(36),
	"olt_id" varchar(36),
	"passive_device_id" varchar(36),
	"plan_profile_id" varchar(36),
	"connection_type" varchar(20),
	"provision_method" varchar(20),
	"parent_queue_id" varchar(100),
	"parent_queue_name" varchar(255),
	"queue_name" varchar(255),
	"target_ip" varchar(45),
	"sync_source_id" varchar(100),
	"installation" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"installed_at" date,
	"terminated_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" varchar(50) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"plan_id" varchar(36) NOT NULL,
	"branch_id" varchar(36) NOT NULL,
	"discount_id" varchar(36),
	"sales_employee_id" varchar(36),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"start_date" date DEFAULT now() NOT NULL,
	"end_date" date,
	"due_day" integer DEFAULT 10 NOT NULL,
	"prorate_enabled" boolean DEFAULT false NOT NULL,
	"tax_enabled" boolean DEFAULT true NOT NULL,
	"price_snapshot" integer DEFAULT 0 NOT NULL,
	"incentive_method" varchar(20) DEFAULT 'none' NOT NULL,
	"incentive_value" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_number_unique" UNIQUE("number")
);
--> statement-breakpoint
ALTER TABLE "customer_accounts" ADD CONSTRAINT "customer_accounts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_identities" ADD CONSTRAINT "customer_identities_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_status_history" ADD CONSTRAINT "customer_status_history_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_credentials" ADD CONSTRAINT "service_credentials_service_id_subscription_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."subscription_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_services" ADD CONSTRAINT "subscription_services_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plan_profiles_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plan_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_services" ADD CONSTRAINT "subscription_services_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_services" ADD CONSTRAINT "subscription_services_plan_profile_id_plan_profiles_id_fk" FOREIGN KEY ("plan_profile_id") REFERENCES "public"."plan_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_contacts_customer_id_idx" ON "customer_contacts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_identities_customer_id_idx" ON "customer_identities" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_status_history_customer_id_idx" ON "customer_status_history" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customers_branch_id_idx" ON "customers" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "customers_status_idx" ON "customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "service_credentials_service_id_idx" ON "service_credentials" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "subscription_services_subscription_id_idx" ON "subscription_services" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_services_router_id_idx" ON "subscription_services" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "subscriptions_customer_id_idx" ON "subscriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions" USING btree ("plan_id");