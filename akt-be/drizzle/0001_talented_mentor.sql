CREATE TABLE "plan_profiles" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"type" varchar(20) DEFAULT 'pppoe' NOT NULL,
	"billing_type" varchar(20) DEFAULT 'monthly' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"router_id" varchar(36) NOT NULL,
	"ip_pool_id" varchar(36),
	"parent_queue_id" varchar(100) DEFAULT '' NOT NULL,
	"parent_queue_name" varchar(255) DEFAULT '' NOT NULL,
	"local_address" varchar(45) DEFAULT '' NOT NULL,
	"download_mbps" double precision DEFAULT 0 NOT NULL,
	"upload_mbps" double precision DEFAULT 0 NOT NULL,
	"oversubscription" boolean DEFAULT true NOT NULL,
	"oversub_ratio" double precision DEFAULT 1 NOT NULL,
	"cir_download_mbps" double precision DEFAULT 0 NOT NULL,
	"cir_upload_mbps" double precision DEFAULT 0 NOT NULL,
	"mir_download_mbps" double precision DEFAULT 0 NOT NULL,
	"mir_upload_mbps" double precision DEFAULT 0 NOT NULL,
	"burst_download_mbps" double precision DEFAULT 0 NOT NULL,
	"burst_upload_mbps" double precision DEFAULT 0 NOT NULL,
	"rate_limit" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "router_ip_pools" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"router_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"range_start" varchar(45) NOT NULL,
	"range_end" varchar(45) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "router_ip_pools_router_name_unique" UNIQUE("router_id","name")
);
--> statement-breakpoint
ALTER TABLE "router_ip_pools" ADD CONSTRAINT "router_ip_pools_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_profiles" ADD CONSTRAINT "plan_profiles_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_profiles" ADD CONSTRAINT "plan_profiles_ip_pool_id_router_ip_pools_id_fk" FOREIGN KEY ("ip_pool_id") REFERENCES "public"."router_ip_pools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plan_profiles_router_id_idx" ON "plan_profiles" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "plan_profiles_ip_pool_id_idx" ON "plan_profiles" USING btree ("ip_pool_id");--> statement-breakpoint
CREATE INDEX "router_ip_pools_router_id_idx" ON "router_ip_pools" USING btree ("router_id");