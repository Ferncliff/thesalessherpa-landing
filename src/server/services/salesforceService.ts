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

import * as jsforce from 'jsforce';

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
  // Custom fields for Sherpa data
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
  // Custom fields for Sherpa data
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
  // Custom fields
  Sherpa_Source__c?: string;
  Sherpa_Relationship_Path__c?: string;
  Sherpa_Intelligence_Notes__c?: string;
}

export interface SalesforceTask {
  Id?: string;
  Subject: string;
  Description?: string;
  WhoId?: string;  // Contact ID
  WhatId?: string; // Account or Opportunity ID
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

export class SalesforceService {
  private connection: jsforce.Connection | null = null;
  private config: SalesforceConfig;
  private tenantId: string;

  constructor(config: SalesforceConfig, tenantId: string) {
    this.config = config;
    this.tenantId = tenantId;
  }

  /**
   * Initialize OAuth connection
   */
  async initConnection(accessToken: string, refreshToken: string, instanceUrl: string): Promise<void> {
    this.connection = new jsforce.Connection({
      oauth2: {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        redirectUri: this.config.redirectUri
      },
      instanceUrl,
      accessToken,
      refreshToken
    });

    // Set up token refresh handler
    this.connection.on('refresh', (newAccessToken: string) => {
      console.log(`[Salesforce] Token refreshed for tenant ${this.tenantId}`);
      // In production, persist new token to database
    });
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    const oauth2 = new jsforce.OAuth2({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri
    });

    return oauth2.getAuthorizationUrl({
      scope: 'api refresh_token offline_access',
      state: state || this.tenantId
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async handleOAuthCallback(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    instanceUrl: string;
    userId: string;
    orgId: string;
  }> {
    const oauth2 = new jsforce.OAuth2({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri
    });

    const conn = new jsforce.Connection({ oauth2 });
    const userInfo = await conn.authorize(code);

    return {
      accessToken: conn.accessToken!,
      refreshToken: conn.refreshToken!,
      instanceUrl: conn.instanceUrl,
      userId: userInfo.id,
      orgId: userInfo.organizationId
    };
  }

  /**
   * Test connection and get org info
   */
  async testConnection(): Promise<{
    connected: boolean;
    orgId?: string;
    orgName?: string;
    username?: string;
    error?: string;
  }> {
    if (!this.connection) {
      return { connected: false, error: 'No connection established' };
    }

    try {
      const identity = await this.connection.identity();
      const orgInfo = await this.connection.query(
        `SELECT Id, Name FROM Organization LIMIT 1`
      );

      return {
        connected: true,
        orgId: identity.organization_id,
        orgName: (orgInfo.records[0] as any)?.Name,
        username: identity.username
      };
    } catch (error: any) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Sync account to Salesforce
   */
  async syncAccount(account: SalesforceAccount): Promise<SyncResult> {
    if (!this.connection) {
      return { success: false, action: 'skipped', error: 'No connection' };
    }

    try {
      // Check if account already exists (by name or website)
      let existingAccount = null;
      if (account.Website) {
        const query = await this.connection.query<{ Id: string }>(
          `SELECT Id FROM Account WHERE Website = '${account.Website}' LIMIT 1`
        );
        existingAccount = query.records[0];
      }

      if (!existingAccount) {
        const nameQuery = await this.connection.query<{ Id: string }>(
          `SELECT Id FROM Account WHERE Name = '${account.Name.replace(/'/g, "\\'")}' LIMIT 1`
        );
        existingAccount = nameQuery.records[0];
      }

      if (existingAccount) {
        // Update existing
        await this.connection.sobject('Account').update({
          Id: existingAccount.Id,
          ...account
        });
        return {
          success: true,
          salesforceId: existingAccount.Id,
          action: 'updated'
        };
      } else {
        // Create new
        const result = await this.connection.sobject('Account').create(account);
        if (result.success) {
          return {
            success: true,
            salesforceId: result.id,
            action: 'created'
          };
        } else {
          return {
            success: false,
            action: 'skipped',
            error: (result as any).errors?.join(', ')
          };
        }
      }
    } catch (error: any) {
      return {
        success: false,
        action: 'skipped',
        error: error.message
      };
    }
  }

  /**
   * Sync contact to Salesforce
   */
  async syncContact(contact: SalesforceContact): Promise<SyncResult> {
    if (!this.connection) {
      return { success: false, action: 'skipped', error: 'No connection' };
    }

    try {
      // Check if contact exists by email
      let existingContact = null;
      if (contact.Email) {
        const query = await this.connection.query<{ Id: string }>(
          `SELECT Id FROM Contact WHERE Email = '${contact.Email}' LIMIT 1`
        );
        existingContact = query.records[0];
      }

      if (existingContact) {
        await this.connection.sobject('Contact').update({
          Id: existingContact.Id,
          ...contact
        });
        return {
          success: true,
          salesforceId: existingContact.Id,
          action: 'updated'
        };
      } else {
        const result = await this.connection.sobject('Contact').create(contact);
        if (result.success) {
          return {
            success: true,
            salesforceId: result.id,
            action: 'created'
          };
        } else {
          return {
            success: false,
            action: 'skipped',
            error: (result as any).errors?.join(', ')
          };
        }
      }
    } catch (error: any) {
      return {
        success: false,
        action: 'skipped',
        error: error.message
      };
    }
  }

  /**
   * Create opportunity in Salesforce
   */
  async createOpportunity(opportunity: SalesforceOpportunity): Promise<SyncResult> {
    if (!this.connection) {
      return { success: false, action: 'skipped', error: 'No connection' };
    }

    try {
      const result = await this.connection.sobject('Opportunity').create(opportunity);
      if (result.success) {
        return {
          success: true,
          salesforceId: result.id,
          action: 'created'
        };
      } else {
        return {
          success: false,
          action: 'skipped',
          error: (result as any).errors?.join(', ')
        };
      }
    } catch (error: any) {
      return {
        success: false,
        action: 'skipped',
        error: error.message
      };
    }
  }

  /**
   * Create task in Salesforce
   */
  async createTask(task: SalesforceTask): Promise<SyncResult> {
    if (!this.connection) {
      return { success: false, action: 'skipped', error: 'No connection' };
    }

    try {
      const result = await this.connection.sobject('Task').create(task);
      if (result.success) {
        return {
          success: true,
          salesforceId: result.id,
          action: 'created'
        };
      } else {
        return {
          success: false,
          action: 'skipped',
          error: (result as any).errors?.join(', ')
        };
      }
    } catch (error: any) {
      return {
        success: false,
        action: 'skipped',
        error: error.message
      };
    }
  }

  /**
   * ONE-CLICK EXPORT - Export complete Sherpa account package to Salesforce
   */
  async exportAccountPackage(pkg: ExportPackage): Promise<{
    success: boolean;
    results: {
      account?: SyncResult;
      contacts: SyncResult[];
      opportunity?: SyncResult;
      tasks: SyncResult[];
    };
    salesforceUrl?: string;
    error?: string;
  }> {
    if (!this.connection) {
      return {
        success: false,
        results: { contacts: [], tasks: [] },
        error: 'No Salesforce connection'
      };
    }

    const results = {
      account: undefined as SyncResult | undefined,
      contacts: [] as SyncResult[],
      opportunity: undefined as SyncResult | undefined,
      tasks: [] as SyncResult[]
    };

    try {
      // 1. Sync Account first
      const accountWithSherpa: SalesforceAccount = {
        ...pkg.account,
        Sherpa_Sync_Date__c: new Date().toISOString(),
        Description: pkg.intelligenceNotes 
          ? `${pkg.account.Description || ''}\n\n--- Sherpa Intelligence ---\n${pkg.intelligenceNotes}`
          : pkg.account.Description
      };
      
      results.account = await this.syncAccount(accountWithSherpa);
      
      if (!results.account.success || !results.account.salesforceId) {
        return {
          success: false,
          results,
          error: `Failed to sync account: ${results.account.error}`
        };
      }

      const accountId = results.account.salesforceId;

      // 2. Sync Contacts
      for (const contact of pkg.contacts) {
        const contactWithSherpa: SalesforceContact = {
          ...contact,
          AccountId: accountId,
          Sherpa_Sync_Date__c: new Date().toISOString()
        };
        
        const contactResult = await this.syncContact(contactWithSherpa);
        results.contacts.push(contactResult);
      }

      // 3. Create Opportunity if provided
      if (pkg.opportunity) {
        const oppWithSherpa: SalesforceOpportunity = {
          ...pkg.opportunity,
          AccountId: accountId,
          Sherpa_Source__c: 'TheSalesSherpa',
          Sherpa_Intelligence_Notes__c: pkg.intelligenceNotes,
          Sherpa_Relationship_Path__c: pkg.relationshipMap 
            ? JSON.stringify(pkg.relationshipMap)
            : undefined
        };
        
        results.opportunity = await this.createOpportunity(oppWithSherpa);
      }

      // 4. Create Tasks if provided
      if (pkg.tasks) {
        for (const task of pkg.tasks) {
          const taskWithAccount: SalesforceTask = {
            ...task,
            WhatId: results.opportunity?.salesforceId || accountId
          };
          
          const taskResult = await this.createTask(taskWithAccount);
          results.tasks.push(taskResult);
        }
      }

      // Generate Salesforce URL
      const salesforceUrl = `${this.connection.instanceUrl}/${accountId}`;

      return {
        success: true,
        results,
        salesforceUrl
      };

    } catch (error: any) {
      return {
        success: false,
        results,
        error: error.message
      };
    }
  }

  /**
   * Import accounts from Salesforce to Sherpa
   */
  async importAccounts(query?: string): Promise<{
    success: boolean;
    accounts: SalesforceAccount[];
    totalRecords: number;
    error?: string;
  }> {
    if (!this.connection) {
      return { success: false, accounts: [], totalRecords: 0, error: 'No connection' };
    }

    try {
      const defaultQuery = `
        SELECT Id, Name, Website, Industry, NumberOfEmployees, 
               AnnualRevenue, Description, BillingCity, BillingState, 
               BillingCountry, Phone
        FROM Account
        WHERE IsDeleted = false
        ORDER BY LastModifiedDate DESC
        LIMIT 1000
      `;

      const result = await this.connection.query<SalesforceAccount>(query || defaultQuery);

      return {
        success: true,
        accounts: result.records,
        totalRecords: result.totalSize
      };
    } catch (error: any) {
      return {
        success: false,
        accounts: [],
        totalRecords: 0,
        error: error.message
      };
    }
  }

  /**
   * Import contacts for an account
   */
  async importContactsForAccount(accountId: string): Promise<{
    success: boolean;
    contacts: SalesforceContact[];
    error?: string;
  }> {
    if (!this.connection) {
      return { success: false, contacts: [], error: 'No connection' };
    }

    try {
      const result = await this.connection.query<SalesforceContact>(`
        SELECT Id, AccountId, FirstName, LastName, Email, Phone, 
               MobilePhone, Title, Department
        FROM Contact
        WHERE AccountId = '${accountId}'
        AND IsDeleted = false
        ORDER BY LastModifiedDate DESC
      `);

      return {
        success: true,
        contacts: result.records
      };
    } catch (error: any) {
      return {
        success: false,
        contacts: [],
        error: error.message
      };
    }
  }

  /**
   * Set up real-time streaming for account updates
   */
  async subscribeToAccountChanges(
    callback: (change: { type: string; data: any }) => void
  ): Promise<() => void> {
    if (!this.connection) {
      throw new Error('No connection established');
    }

    // Subscribe to Account changes via Streaming API
    const channel = '/data/AccountChangeEvent';
    
    const subscription = this.connection.streaming.topic(channel).subscribe((message: any) => {
      callback({
        type: message.event.type,
        data: message.payload
      });
    });

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Get Salesforce field metadata for custom field setup
   */
  async getFieldMetadata(objectName: string): Promise<{
    fields: Array<{
      name: string;
      label: string;
      type: string;
      custom: boolean;
    }>;
    error?: string;
  }> {
    if (!this.connection) {
      return { fields: [], error: 'No connection' };
    }

    try {
      const describe = await this.connection.describe(objectName);
      
      return {
        fields: describe.fields.map((f: any) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          custom: f.custom
        }))
      };
    } catch (error: any) {
      return {
        fields: [],
        error: error.message
      };
    }
  }

  /**
   * Check if Sherpa custom fields exist, provide setup instructions if not
   */
  async checkCustomFields(): Promise<{
    allFieldsExist: boolean;
    missingFields: string[];
    setupInstructions?: string;
  }> {
    const requiredFields = [
      { object: 'Account', field: 'Sherpa_Urgency_Score__c' },
      { object: 'Account', field: 'Sherpa_Fit_Score__c' },
      { object: 'Account', field: 'Sherpa_Last_Signal__c' },
      { object: 'Account', field: 'Sherpa_Sync_Date__c' },
      { object: 'Contact', field: 'Sherpa_Connection_Degree__c' },
      { object: 'Contact', field: 'Sherpa_Influence_Score__c' },
      { object: 'Contact', field: 'Sherpa_Best_Intro_Path__c' },
      { object: 'Contact', field: 'Sherpa_Sync_Date__c' },
      { object: 'Opportunity', field: 'Sherpa_Source__c' },
      { object: 'Opportunity', field: 'Sherpa_Relationship_Path__c' },
      { object: 'Opportunity', field: 'Sherpa_Intelligence_Notes__c' }
    ];

    const missingFields: string[] = [];

    for (const { object, field } of requiredFields) {
      try {
        const metadata = await this.getFieldMetadata(object);
        const fieldExists = metadata.fields.some(f => f.name === field);
        
        if (!fieldExists) {
          missingFields.push(`${object}.${field}`);
        }
      } catch (error) {
        missingFields.push(`${object}.${field}`);
      }
    }

    const allFieldsExist = missingFields.length === 0;

    let setupInstructions: string | undefined;
    if (!allFieldsExist) {
      setupInstructions = `
To enable full TheSalesSherpa integration, create these custom fields in Salesforce:

Account Object:
- Sherpa_Urgency_Score__c (Number, 0 decimal places)
- Sherpa_Fit_Score__c (Number, 0 decimal places)
- Sherpa_Last_Signal__c (Text, 255 characters)
- Sherpa_Sync_Date__c (Date/Time)

Contact Object:
- Sherpa_Connection_Degree__c (Number, 0 decimal places)
- Sherpa_Influence_Score__c (Number, 0 decimal places)
- Sherpa_Best_Intro_Path__c (Long Text Area, 5000 characters)
- Sherpa_Sync_Date__c (Date/Time)

Opportunity Object:
- Sherpa_Source__c (Text, 100 characters)
- Sherpa_Relationship_Path__c (Long Text Area, 10000 characters)
- Sherpa_Intelligence_Notes__c (Long Text Area, 10000 characters)

You can create these via Setup → Object Manager → [Object] → Fields & Relationships → New
      `.trim();
    }

    return {
      allFieldsExist,
      missingFields,
      setupInstructions
    };
  }

  /**
   * Disconnect and clear connection
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.logout();
      } catch (error) {
        // Ignore logout errors
      }
      this.connection = null;
    }
  }
}

/**
 * Create Salesforce service instance
 */
export function createSalesforceService(
  config: SalesforceConfig,
  tenantId: string
): SalesforceService {
  return new SalesforceService(config, tenantId);
}

export default SalesforceService;
