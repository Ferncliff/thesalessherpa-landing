/**
 * TheSalesSherpa Salesforce Integration Service
 *
 * Provides full integration with Salesforce CRM including:
 * - OAuth 2.0 authentication
 * - Account/Contact/Opportunity sync
 * - One-click export from Sherpa to Salesforce
 * - Real-time streaming updates
 * - Bulk data import
 */
export interface SalesforceConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    instanceUrl?: string;
    accessToken?: string;
    refreshToken?: string;
}
export interface SalesforceAccount {
    Id?: string;
    Name: string;
    Website?: string;
    Industry?: string;
    NumberOfEmployees?: number;
    AnnualRevenue?: number;
    Description?: string;
    BillingCity?: string;
    BillingState?: string;
    BillingCountry?: string;
    Phone?: string;
    Sherpa_Urgency_Score__c?: number;
    Sherpa_Fit_Score__c?: number;
    Sherpa_Last_Signal__c?: string;
    Sherpa_Sync_Date__c?: string;
}
export interface SalesforceContact {
    Id?: string;
    AccountId?: string;
    FirstName: string;
    LastName: string;
    Email?: string;
    Phone?: string;
    MobilePhone?: string;
    Title?: string;
    Department?: string;
    LinkedIn_URL__c?: string;
    Sherpa_Connection_Degree__c?: number;
    Sherpa_Influence_Score__c?: number;
    Sherpa_Best_Intro_Path__c?: string;
    Sherpa_Sync_Date__c?: string;
}
export interface SalesforceOpportunity {
    Id?: string;
    AccountId: string;
    Name: string;
    StageName: string;
    Amount?: number;
    CloseDate: string;
    Description?: string;
    LeadSource?: string;
    Sherpa_Source__c?: string;
    Sherpa_Relationship_Path__c?: string;
    Sherpa_Intelligence_Notes__c?: string;
}
export interface SalesforceTask {
    Id?: string;
    Subject: string;
    Description?: string;
    WhoId?: string;
    WhatId?: string;
    ActivityDate?: string;
    Status: string;
    Priority: string;
    Type?: string;
}
export interface SyncResult {
    success: boolean;
    salesforceId?: string;
    action: 'created' | 'updated' | 'skipped';
    error?: string;
}
export interface ExportPackage {
    account: SalesforceAccount;
    contacts: SalesforceContact[];
    opportunity?: SalesforceOpportunity;
    tasks?: SalesforceTask[];
    intelligenceNotes?: string;
    relationshipMap?: object;
}
export declare class SalesforceService {
    private connection;
    private config;
    private tenantId;
    constructor(config: SalesforceConfig, tenantId: string);
    /**
     * Initialize OAuth connection
     */
    initConnection(accessToken: string, refreshToken: string, instanceUrl: string): Promise<void>;
    /**
     * Generate OAuth authorization URL
     */
    getAuthUrl(state?: string): string;
    /**
     * Exchange authorization code for tokens
     */
    handleOAuthCallback(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
        instanceUrl: string;
        userId: string;
        orgId: string;
    }>;
    /**
     * Test connection and get org info
     */
    testConnection(): Promise<{
        connected: boolean;
        orgId?: string;
        orgName?: string;
        username?: string;
        error?: string;
    }>;
    /**
     * Sync account to Salesforce
     */
    syncAccount(account: SalesforceAccount): Promise<SyncResult>;
    /**
     * Sync contact to Salesforce
     */
    syncContact(contact: SalesforceContact): Promise<SyncResult>;
    /**
     * Create opportunity in Salesforce
     */
    createOpportunity(opportunity: SalesforceOpportunity): Promise<SyncResult>;
    /**
     * Create task in Salesforce
     */
    createTask(task: SalesforceTask): Promise<SyncResult>;
    /**
     * ONE-CLICK EXPORT - Export complete Sherpa account package to Salesforce
     */
    exportAccountPackage(pkg: ExportPackage): Promise<{
        success: boolean;
        results: {
            account?: SyncResult;
            contacts: SyncResult[];
            opportunity?: SyncResult;
            tasks: SyncResult[];
        };
        salesforceUrl?: string;
        error?: string;
    }>;
    /**
     * Import accounts from Salesforce to Sherpa
     */
    importAccounts(query?: string): Promise<{
        success: boolean;
        accounts: SalesforceAccount[];
        totalRecords: number;
        error?: string;
    }>;
    /**
     * Import contacts for an account
     */
    importContactsForAccount(accountId: string): Promise<{
        success: boolean;
        contacts: SalesforceContact[];
        error?: string;
    }>;
    /**
     * Set up real-time streaming for account updates
     */
    subscribeToAccountChanges(callback: (change: {
        type: string;
        data: any;
    }) => void): Promise<() => void>;
    /**
     * Get Salesforce field metadata for custom field setup
     */
    getFieldMetadata(objectName: string): Promise<{
        fields: Array<{
            name: string;
            label: string;
            type: string;
            custom: boolean;
        }>;
        error?: string;
    }>;
    /**
     * Check if Sherpa custom fields exist, provide setup instructions if not
     */
    checkCustomFields(): Promise<{
        allFieldsExist: boolean;
        missingFields: string[];
        setupInstructions?: string;
    }>;
    /**
     * Disconnect and clear connection
     */
    disconnect(): Promise<void>;
}
/**
 * Create Salesforce service instance
 */
export declare function createSalesforceService(config: SalesforceConfig, tenantId: string): SalesforceService;
export default SalesforceService;
//# sourceMappingURL=salesforceService.d.ts.map