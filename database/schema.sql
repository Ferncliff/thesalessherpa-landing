-- TheSalesSherpa Enterprise Database Schema
-- Multi-tenant PostgreSQL with Row-Level Security
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy search

-- ============================================================================
-- TENANT MANAGEMENT
-- ============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    
    -- Subscription
    plan VARCHAR(50) DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'suspended')),
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    max_users INTEGER DEFAULT 5,
    max_accounts INTEGER DEFAULT 100,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identity
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),  -- Nullable for SSO users
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    title VARCHAR(200),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    linkedin_id VARCHAR(100),
    
    -- Auth
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    sso_provider VARCHAR(50),  -- 'okta', 'azure_ad', 'google', etc.
    sso_id VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_linkedin_id ON users(linkedin_id);

-- ============================================================================
-- ACCOUNTS (Target Companies)
-- ============================================================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    website VARCHAR(500),
    logo_url VARCHAR(500),
    
    -- Company Details
    industry VARCHAR(100),
    sub_industry VARCHAR(100),
    company_size VARCHAR(50) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+')),
    employee_count INTEGER,
    revenue_range VARCHAR(50),
    annual_revenue DECIMAL(15, 2),
    fiscal_year_end VARCHAR(20),
    
    -- Location
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(100),
    headquarters_country VARCHAR(100),
    headquarters_address TEXT,
    
    -- Description
    description TEXT,
    value_proposition TEXT,
    
    -- Scoring
    urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 100),
    fit_score INTEGER DEFAULT 0 CHECK (fit_score >= 0 AND fit_score <= 100),
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    overall_score INTEGER GENERATED ALWAYS AS (
        ROUND((urgency_score * 0.4 + fit_score * 0.3 + engagement_score * 0.3))
    ) STORED,
    
    -- Scoring Breakdown (JSON for detailed factors)
    scoring_breakdown JSONB DEFAULT '{}',
    
    -- Status & Stage
    status VARCHAR(50) DEFAULT 'researching' CHECK (status IN ('researching', 'target', 'engaged', 'opportunity', 'customer', 'churned', 'disqualified')),
    stage VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low', 'none')),
    
    -- External IDs
    salesforce_id VARCHAR(100),
    linkedin_company_id VARCHAR(100),
    crunchbase_id VARCHAR(100),
    
    -- Intelligence
    last_news_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    next_action_at TIMESTAMP WITH TIME ZONE,
    
    -- Tags & Categories
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_accounts_tenant ON accounts(tenant_id);
CREATE INDEX idx_accounts_owner ON accounts(owner_id);
CREATE INDEX idx_accounts_urgency ON accounts(tenant_id, urgency_score DESC);
CREATE INDEX idx_accounts_status ON accounts(tenant_id, status);
CREATE INDEX idx_accounts_salesforce ON accounts(salesforce_id);
CREATE INDEX idx_accounts_linkedin ON accounts(linkedin_company_id);
CREATE INDEX idx_accounts_name_search ON accounts USING gin(name gin_trgm_ops);
CREATE INDEX idx_accounts_tags ON accounts USING gin(tags);

-- ============================================================================
-- CONTACTS (People at Accounts)
-- ============================================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES users(id),
    
    -- Basic Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Professional
    title VARCHAR(200),
    department VARCHAR(100),
    seniority VARCHAR(50) CHECK (seniority IN ('c-level', 'vp', 'director', 'manager', 'individual')),
    
    -- Social
    linkedin_url VARCHAR(500),
    linkedin_id VARCHAR(100),
    twitter_handle VARCHAR(100),
    
    -- Location
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Influence Scoring
    budget_influence INTEGER DEFAULT 0 CHECK (budget_influence >= 0 AND budget_influence <= 100),
    technical_influence INTEGER DEFAULT 0 CHECK (technical_influence >= 0 AND technical_influence <= 100),
    relationship_influence INTEGER DEFAULT 0 CHECK (relationship_influence >= 0 AND relationship_influence <= 100),
    urgency_influence INTEGER DEFAULT 0 CHECK (urgency_influence >= 0 AND urgency_influence <= 100),
    overall_influence INTEGER GENERATED ALWAYS AS (
        ROUND((budget_influence * 0.35 + technical_influence * 0.25 + relationship_influence * 0.25 + urgency_influence * 0.15))
    ) STORED,
    
    -- Relationship Mapping
    separation_degree INTEGER,  -- Degrees from user (1-7, NULL = no path)
    best_connection_path JSONB,  -- Array of connection hops
    intro_success_probability DECIMAL(3, 2),  -- 0.00 - 1.00
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'stale', 'bounced', 'opted_out', 'left_company')),
    last_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- External IDs
    salesforce_id VARCHAR(100),
    
    -- Engagement
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    last_response_at TIMESTAMP WITH TIME ZONE,
    total_touchpoints INTEGER DEFAULT 0,
    
    -- Notes
    bio TEXT,
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_linkedin ON contacts(linkedin_id);
CREATE INDEX idx_contacts_salesforce ON contacts(salesforce_id);
CREATE INDEX idx_contacts_separation ON contacts(tenant_id, separation_degree);
CREATE INDEX idx_contacts_name_search ON contacts USING gin(full_name gin_trgm_ops);

-- ============================================================================
-- RELATIONSHIPS (Connection Network)
-- ============================================================================

CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Connection endpoints (can be user or contact)
    source_user_id UUID REFERENCES users(id),
    source_contact_id UUID REFERENCES contacts(id),
    target_user_id UUID REFERENCES users(id),
    target_contact_id UUID REFERENCES contacts(id),
    
    -- Relationship Details
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN (
        'colleague', 'former_colleague', 'classmate', 'friend', 
        'family', 'mentor', 'mentee', 'manager', 'direct_report',
        'vendor', 'customer', 'partner', 'acquaintance', 'other'
    )),
    context TEXT,  -- "Worked together at Microsoft 2019-2021"
    
    -- Strength Scoring
    strength DECIMAL(3, 2) DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
    interaction_frequency VARCHAR(20) CHECK (interaction_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'rarely')),
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification
    source VARCHAR(50) CHECK (source IN ('linkedin', 'manual', 'email', 'calendar', 'import')),
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure at least one source and one target
    CONSTRAINT valid_source CHECK (source_user_id IS NOT NULL OR source_contact_id IS NOT NULL),
    CONSTRAINT valid_target CHECK (target_user_id IS NOT NULL OR target_contact_id IS NOT NULL)
);

CREATE INDEX idx_relationships_tenant ON relationships(tenant_id);
CREATE INDEX idx_relationships_source_user ON relationships(source_user_id);
CREATE INDEX idx_relationships_source_contact ON relationships(source_contact_id);
CREATE INDEX idx_relationships_target_user ON relationships(target_user_id);
CREATE INDEX idx_relationships_target_contact ON relationships(target_contact_id);
CREATE INDEX idx_relationships_strength ON relationships(strength DESC);

-- ============================================================================
-- ACTIVITIES (Touchpoints & Actions)
-- ============================================================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Activity Details
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'email_sent', 'email_received', 'email_opened', 'email_clicked',
        'call_outbound', 'call_inbound', 'call_scheduled',
        'meeting_scheduled', 'meeting_completed', 'meeting_cancelled',
        'linkedin_message', 'linkedin_connection', 'linkedin_viewed',
        'note', 'task', 'reminder',
        'intro_requested', 'intro_made',
        'opportunity_created', 'opportunity_updated',
        'other'
    )),
    
    -- Content
    subject VARCHAR(500),
    body TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'failed')),
    outcome VARCHAR(50),
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Source
    source VARCHAR(50) CHECK (source IN ('manual', 'salesforce', 'email', 'calendar', 'linkedin', 'automated')),
    external_id VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_tenant ON activities(tenant_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_account ON activities(account_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-- ============================================================================
-- ALERTS & SIGNALS
-- ============================================================================

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'news', 'funding', 'hiring', 'executive_change', 'expansion',
        'contract', 'earnings', 'product_launch', 'partnership',
        'competitor_mention', 'technology_adoption',
        'overdue_followup', 'stale_account', 'score_change',
        'intro_opportunity', 'engagement_spike',
        'other'
    )),
    
    -- Content
    title VARCHAR(500) NOT NULL,
    message TEXT,
    source_url VARCHAR(1000),
    source VARCHAR(100),
    
    -- Urgency
    urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
    score_impact INTEGER DEFAULT 0,  -- Points added/removed from urgency
    
    -- Status
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'actioned', 'dismissed', 'expired')),
    viewed_at TIMESTAMP WITH TIME ZONE,
    actioned_at TIMESTAMP WITH TIME ZONE,
    actioned_by UUID REFERENCES users(id),
    
    -- AI Analysis
    ai_summary TEXT,
    ai_recommended_action TEXT,
    confidence DECIMAL(3, 2),
    
    -- Metadata
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX idx_alerts_account ON alerts(account_id);
CREATE INDEX idx_alerts_contact ON alerts(contact_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_urgency ON alerts(urgency);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- NULL for tenant-wide integrations
    
    -- Integration Details
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('salesforce', 'linkedin', 'hubspot', 'microsoft', 'google', 'slack', 'zapier')),
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('oauth', 'api_key', 'webhook')),
    
    -- Auth
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    api_key_hash VARCHAR(255),
    
    -- Provider Details
    instance_url VARCHAR(500),  -- For Salesforce
    external_user_id VARCHAR(255),
    external_org_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    sync_settings JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, user_id, provider)
);

CREATE INDEX idx_integrations_tenant ON integrations(tenant_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);

-- ============================================================================
-- OUTREACH TEMPLATES
-- ============================================================================

CREATE TABLE outreach_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    
    -- Template Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'linkedin', 'call_script', 'intro_request')),
    
    -- Content
    subject VARCHAR(500),  -- For emails
    body TEXT NOT NULL,
    
    -- Variables available: {{first_name}}, {{company}}, {{title}}, {{mutual_connection}}, etc.
    
    -- Usage Stats
    times_used INTEGER DEFAULT 0,
    response_rate DECIMAL(5, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    is_system BOOLEAN DEFAULT FALSE,  -- System-provided templates
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_tenant ON outreach_templates(tenant_id);
CREATE INDEX idx_templates_channel ON outreach_templates(channel);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    -- Event Details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    
    -- Change Details
    old_values JSONB,
    new_values JSONB,
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies (example for accounts - replicate for other tables)
CREATE POLICY tenant_isolation_accounts ON accounts
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_contacts ON contacts
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_relationships ON relationships
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_activities ON activities
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_alerts ON alerts
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_integrations ON integrations
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_templates ON outreach_templates
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_audit ON audit_log
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON outreach_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Demo Accounts for Feb 17)
-- ============================================================================

-- This will be populated by seed script
-- See: database/seeds/demo_data.sql

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES ('1.0.0');
