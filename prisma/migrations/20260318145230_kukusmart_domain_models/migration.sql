-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'CONSULTANT', 'SUPPLIER', 'FARMER', 'EXTENSION_OFFICER', 'COOPERATIVE_MANAGER');

-- CreateEnum
CREATE TYPE "FlockType" AS ENUM ('BROILER', 'LAYER', 'KIENYEJI');

-- CreateEnum
CREATE TYPE "MetricSource" AS ENUM ('MANUAL', 'AUTO_TRIGGER', 'SENSOR', 'VOICE');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('WATER_LOW', 'HEAT_STRESS', 'MORTALITY_SPIKE', 'FEED_RISK', 'DISEASE_RISK', 'EGG_DROP');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AgentCycleStep" AS ENUM ('PERCEIVE', 'REASON', 'ACT', 'EXPLAIN');

-- CreateEnum
CREATE TYPE "DecisionActionStatus" AS ENUM ('PENDING', 'EXECUTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "VoiceSource" AS ENUM ('WEB_SPEECH', 'MOBILE_UPLOAD');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('ACTIVE', 'APPLIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('PEST', 'DISEASE');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "pests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "images" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diseases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "images" TEXT[],
    "text" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location_text" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "farmer_id" TEXT NOT NULL,
    "cooperative_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flocks" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FlockType" NOT NULL,
    "initial_bird_count" INTEGER NOT NULL,
    "current_bird_count" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_metrics" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "flock_id" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feed_kg" DOUBLE PRECISION,
    "water_liters" DOUBLE PRECISION,
    "eggs_collected" INTEGER,
    "mortality_count" INTEGER,
    "temperature_c" DOUBLE PRECISION,
    "humidity_pct" DOUBLE PRECISION,
    "avg_weight_kg" DOUBLE PRECISION,
    "notes" TEXT,
    "source" "MetricSource" NOT NULL DEFAULT 'MANUAL',

    CONSTRAINT "farm_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_alerts" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "flock_id" TEXT,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auto_triggered" BOOLEAN NOT NULL DEFAULT false,
    "trigger_metric" TEXT,
    "threshold_value" DOUBLE PRECISION,
    "current_value" DOUBLE PRECISION,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "farm_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_decisions" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "flock_id" TEXT,
    "alert_id" TEXT,
    "cycle_step" "AgentCycleStep" NOT NULL DEFAULT 'PERCEIVE',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "decision_title" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "recommended_action" TEXT NOT NULL,
    "action_status" "DecisionActionStatus" NOT NULL DEFAULT 'PENDING',
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_logs" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "flock_id" TEXT,
    "input_text" TEXT NOT NULL,
    "normalized_text" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en-KE',
    "source" "VoiceSource" NOT NULL DEFAULT 'WEB_SPEECH',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voice_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_recommendations" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "flock_id" TEXT NOT NULL,
    "recommended_date" TIMESTAMP(3) NOT NULL,
    "recommended_window_days" INTEGER,
    "expected_price_per_kg" DOUBLE PRECISION,
    "confidence_score" DOUBLE PRECISION,
    "rationale" TEXT NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_events" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "flock_id" TEXT NOT NULL,
    "condition_name" TEXT NOT NULL,
    "suspected" BOOLEAN NOT NULL DEFAULT true,
    "severity" "AlertSeverity",
    "recommended_treatment" TEXT,
    "notes" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmers" (
    "farmer_id" TEXT NOT NULL,
    "phone" TEXT,
    "county" TEXT,
    "sub_county" TEXT,
    "preferred_language" TEXT DEFAULT 'en-KE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("farmer_id")
);

-- CreateTable
CREATE TABLE "extension_officers" (
    "extension_officer_id" TEXT NOT NULL,
    "organization" TEXT,
    "county" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extension_officers_pkey" PRIMARY KEY ("extension_officer_id")
);

-- CreateTable
CREATE TABLE "cooperative_managers" (
    "cooperative_manager_id" TEXT NOT NULL,
    "cooperative_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cooperative_managers_pkey" PRIMARY KEY ("cooperative_manager_id")
);

-- CreateTable
CREATE TABLE "cooperatives" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "county" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cooperatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_officers" (
    "farm_id" TEXT NOT NULL,
    "officer_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farm_officers_pkey" PRIMARY KEY ("farm_id","officer_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "Role",

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tag" TEXT,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" TEXT NOT NULL,
    "type" "ScanType" NOT NULL,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultants" (
    "consultant_id" TEXT NOT NULL,
    "is_verified" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "SupplierStatus",
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "admin_id" TEXT NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","provider_account_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_suppliers" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "productId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_suppliers_pkey" PRIMARY KEY ("country","city","region","productId","supplierId")
);

-- CreateIndex
CREATE UNIQUE INDEX "pests_name_key" ON "pests"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pests_slug_key" ON "pests"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_name_key" ON "diseases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_slug_key" ON "diseases"("slug");

-- CreateIndex
CREATE INDEX "farms_farmer_id_idx" ON "farms"("farmer_id");

-- CreateIndex
CREATE INDEX "farms_cooperative_id_idx" ON "farms"("cooperative_id");

-- CreateIndex
CREATE INDEX "flocks_farm_id_idx" ON "flocks"("farm_id");

-- CreateIndex
CREATE INDEX "farm_metrics_farm_id_recorded_at_idx" ON "farm_metrics"("farm_id", "recorded_at");

-- CreateIndex
CREATE INDEX "farm_metrics_flock_id_recorded_at_idx" ON "farm_metrics"("flock_id", "recorded_at");

-- CreateIndex
CREATE INDEX "farm_alerts_farm_id_status_triggered_at_idx" ON "farm_alerts"("farm_id", "status", "triggered_at");

-- CreateIndex
CREATE INDEX "farm_alerts_flock_id_status_idx" ON "farm_alerts"("flock_id", "status");

-- CreateIndex
CREATE INDEX "agent_decisions_farm_id_created_at_idx" ON "agent_decisions"("farm_id", "created_at");

-- CreateIndex
CREATE INDEX "agent_decisions_flock_id_created_at_idx" ON "agent_decisions"("flock_id", "created_at");

-- CreateIndex
CREATE INDEX "agent_decisions_alert_id_idx" ON "agent_decisions"("alert_id");

-- CreateIndex
CREATE INDEX "voice_logs_farm_id_created_at_idx" ON "voice_logs"("farm_id", "created_at");

-- CreateIndex
CREATE INDEX "voice_logs_flock_id_created_at_idx" ON "voice_logs"("flock_id", "created_at");

-- CreateIndex
CREATE INDEX "sale_recommendations_farm_id_recommended_date_idx" ON "sale_recommendations"("farm_id", "recommended_date");

-- CreateIndex
CREATE INDEX "sale_recommendations_flock_id_recommended_date_idx" ON "sale_recommendations"("flock_id", "recommended_date");

-- CreateIndex
CREATE INDEX "health_events_farm_id_created_at_idx" ON "health_events"("farm_id", "created_at");

-- CreateIndex
CREATE INDEX "health_events_flock_id_created_at_idx" ON "health_events"("flock_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cooperatives_name_key" ON "cooperatives"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_id_key" ON "customers"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "scans_url_key" ON "scans"("url");

-- CreateIndex
CREATE UNIQUE INDEX "consultants_consultant_id_key" ON "consultants"("consultant_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_name_key" ON "suppliers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admins_admin_id_key" ON "admins"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_id_key" ON "product_suppliers"("id");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("farmer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_cooperative_id_fkey" FOREIGN KEY ("cooperative_id") REFERENCES "cooperatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flocks" ADD CONSTRAINT "flocks_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_metrics" ADD CONSTRAINT "farm_metrics_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_metrics" ADD CONSTRAINT "farm_metrics_flock_id_fkey" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_alerts" ADD CONSTRAINT "farm_alerts_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_alerts" ADD CONSTRAINT "farm_alerts_flock_id_fkey" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_decisions" ADD CONSTRAINT "agent_decisions_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_decisions" ADD CONSTRAINT "agent_decisions_flock_id_fkey" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_decisions" ADD CONSTRAINT "agent_decisions_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "farm_alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_logs" ADD CONSTRAINT "voice_logs_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_logs" ADD CONSTRAINT "voice_logs_flock_id_fkey" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_recommendations" ADD CONSTRAINT "sale_recommendations_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_recommendations" ADD CONSTRAINT "sale_recommendations_flock_id_fkey" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_events" ADD CONSTRAINT "health_events_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_events" ADD CONSTRAINT "health_events_flock_id_fkey" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extension_officers" ADD CONSTRAINT "extension_officers_extension_officer_id_fkey" FOREIGN KEY ("extension_officer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooperative_managers" ADD CONSTRAINT "cooperative_managers_cooperative_manager_id_fkey" FOREIGN KEY ("cooperative_manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooperative_managers" ADD CONSTRAINT "cooperative_managers_cooperative_id_fkey" FOREIGN KEY ("cooperative_id") REFERENCES "cooperatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_officers" ADD CONSTRAINT "farm_officers_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_officers" ADD CONSTRAINT "farm_officers_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "extension_officers"("extension_officer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
