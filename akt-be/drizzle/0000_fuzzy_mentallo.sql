CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'teknisi' NOT NULL,
	"branch_id" varchar(50) DEFAULT 'br-jkt' NOT NULL,
	"branch_name" varchar(100) DEFAULT 'Jakarta Pusat' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "routers" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"branch_id" varchar(50) DEFAULT 'br-jkt' NOT NULL,
	"host" varchar(255) NOT NULL,
	"api_port" integer DEFAULT 8728 NOT NULL,
	"username" varchar(100) DEFAULT 'admin' NOT NULL,
	"password" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"last_seen_at" timestamp with time zone,
	"last_test_result" varchar(50),
	"last_test_message" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) DEFAULT '' NOT NULL,
	"address" varchar(500) DEFAULT '' NOT NULL,
	"is_head_office" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"customer_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "monitoring_heartbeats" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" varchar(36) NOT NULL,
	"status" varchar(20) NOT NULL,
	"latency_ms" integer,
	"metadata" jsonb,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitoring_incidents" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" varchar(36) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"duration_seconds" integer,
	"status" varchar(20) DEFAULT 'ongoing' NOT NULL,
	"cause" text DEFAULT 'Netwatch probe unreachable',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitoring_targets" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"host" varchar(255) NOT NULL,
	"router_id" varchar(36) NOT NULL,
	"interval_seconds" integer DEFAULT 10 NOT NULL,
	"timeout_ms" integer DEFAULT 1000 NOT NULL,
	"type" varchar(50) DEFAULT 'gateway' NOT NULL,
	"current_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"last_seen_at" timestamp with time zone,
	"last_down_at" timestamp with time zone,
	"netwatch_comment" varchar(255),
	"netwatch_synced" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_channels" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"bot_token" text NOT NULL,
	"chat_id" varchar(100) NOT NULL,
	"thread_id" integer,
	"notify_down" boolean DEFAULT true NOT NULL,
	"notify_up" boolean DEFAULT true NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_notifications" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" varchar(36),
	"type" varchar(50) DEFAULT 'sla_down' NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
