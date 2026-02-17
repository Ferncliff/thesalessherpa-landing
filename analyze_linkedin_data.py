#!/usr/bin/env python3
"""
THESALESSHERPA: LinkedIn Data Analysis Engine
Process Matt's LinkedIn connections for relationship mapping
"""
import pandas as pd
import json
from datetime import datetime
import re

def analyze_linkedin_network():
    """Analyze Matt's LinkedIn network for TheSalesSherpa"""
    
    print("🚀 THESALESSHERPA: LinkedIn Network Analysis")
    print("=" * 60)
    
    # Load connections data
    connections = pd.read_csv('/Users/ferncliffadmin/clawd/projects/thesalessherpa/linkedin_data/Connections.csv')
    
    print(f"📊 NETWORK SIZE: {len(connections):,} connections")
    print()
    
    # Company analysis
    print("🏢 TOP COMPANIES IN NETWORK:")
    company_counts = connections['Company'].value_counts().head(15)
    for company, count in company_counts.items():
        if pd.notna(company):
            print(f"   • {company}: {count} connections")
    
    print()
    
    # Recent connections (last 6 months)
    connections['Connected On'] = pd.to_datetime(connections['Connected On'], format='%d %b %Y')
    recent_cutoff = datetime(2025, 8, 1)  # Aug 1, 2025
    recent_connections = connections[connections['Connected On'] >= recent_cutoff]
    
    print(f"🔥 RECENT CONNECTIONS (Since Aug 2025): {len(recent_connections)}")
    print("Recent high-value connections:")
    
    for _, conn in recent_connections.head(10).iterrows():
        company = conn['Company'] if pd.notna(conn['Company']) else 'Unknown'
        position = conn['Position'] if pd.notna(conn['Position']) else 'Unknown'
        print(f"   • {conn['First Name']} {conn['Last Name']}: {position} at {company}")
    
    print()
    
    # Target company connections (from FA Sales strategy)
    target_companies = [
        'WPP', 'Battelle', 'Uber', 'Maximus', 'Tetra Tech',
        'Microsoft', 'Google', 'Amazon', 'Salesforce', 'Oracle',
        'JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Goldman Sachs',
        'McKinsey', 'Deloitte', 'Accenture', 'PwC', 'EY'
    ]
    
    print("🎯 TARGET COMPANY CONNECTIONS:")
    target_matches = []
    
    for target in target_companies:
        matches = connections[connections['Company'].str.contains(target, case=False, na=False)]
        if len(matches) > 0:
            target_matches.extend(matches.to_dict('records'))
            print(f"   🔥 {target}: {len(matches)} connections")
            for _, match in matches.head(3).iterrows():
                print(f"      → {match['First Name']} {match['Last Name']}: {match['Position']}")
    
    print()
    
    # Sales/Executive connections
    sales_keywords = ['sales', 'business development', 'revenue', 'VP', 'director', 'president', 'CEO', 'CMO', 'CTO']
    
    print("💼 SALES & EXECUTIVE CONNECTIONS:")
    sales_connections = []
    
    for keyword in sales_keywords:
        keyword_matches = connections[
            connections['Position'].str.contains(keyword, case=False, na=False)
        ]
        sales_connections.extend(keyword_matches.to_dict('records'))
    
    # Remove duplicates
    unique_sales = {(conn['First Name'], conn['Last Name']): conn for conn in sales_connections}
    sales_connections = list(unique_sales.values())
    
    print(f"   📊 Total sales/exec connections: {len(sales_connections)}")
    
    # High-value positions
    high_value_titles = ['CEO', 'President', 'VP', 'SVP', 'Chief', 'Head of', 'Director']
    high_value_connections = []
    
    for title in high_value_titles:
        matches = connections[connections['Position'].str.contains(title, case=False, na=False)]
        high_value_connections.extend(matches.to_dict('records'))
    
    # Remove duplicates
    unique_high_value = {(conn['First Name'], conn['Last Name']): conn for conn in high_value_connections}
    high_value_connections = list(unique_high_value.values())
    
    print(f"   🏆 C-level/VP connections: {len(high_value_connections)}")
    
    # Sample high-value connections
    print("   Top executive connections:")
    for conn in high_value_connections[:8]:
        company = conn['Company'] if pd.notna(conn['Company']) else 'Unknown'
        print(f"      → {conn['First Name']} {conn['Last Name']}: {conn['Position']} at {company}")
    
    print()
    
    # Generate relationship mapping insights
    print("🕸️ RELATIONSHIP MAPPING INSIGHTS:")
    
    # Company clustering
    fa_connections = connections[connections['Company'].str.contains('First Advantage', case=False, na=False)]
    print(f"   • First Advantage internal network: {len(fa_connections)} colleagues")
    
    # Industry analysis
    healthcare_keywords = ['health', 'medical', 'hospital', 'clinic', 'pharmaceutical']
    tech_keywords = ['technology', 'software', 'AI', 'data', 'tech']
    finance_keywords = ['bank', 'financial', 'investment', 'capital', 'finance']
    
    healthcare_count = sum(1 for conn in connections.to_dict('records') 
                          if any(keyword in str(conn.get('Company', '')).lower() 
                                for keyword in healthcare_keywords))
    
    tech_count = sum(1 for conn in connections.to_dict('records') 
                    if any(keyword in str(conn.get('Company', '')).lower() 
                          for keyword in tech_keywords))
    
    finance_count = sum(1 for conn in connections.to_dict('records') 
                       if any(keyword in str(conn.get('Company', '')).lower() 
                             for keyword in finance_keywords))
    
    print(f"   • Healthcare industry: ~{healthcare_count} connections")
    print(f"   • Technology industry: ~{tech_count} connections")  
    print(f"   • Financial services: ~{finance_count} connections")
    
    print()
    print("🎯 THESALESSHERPA OPPORTUNITY ANALYSIS:")
    print(f"   ✅ Network size: {len(connections):,} (EXCELLENT for warm intros)")
    print(f"   ✅ Recent growth: {len(recent_connections)} new connections (ACTIVE networker)")
    print(f"   ✅ Executive access: {len(high_value_connections)} C-level/VP contacts")
    print(f"   ✅ Target company coverage: {len(target_matches)} potential warm paths")
    print(f"   ✅ Industry diversity: Healthcare, Tech, Finance expertise")
    
    print()
    print("💡 STRATEGIC RECOMMENDATIONS:")
    print("   1. Map 2nd-degree connections through high-value contacts")
    print("   2. Leverage FA colleagues for enterprise introductions")
    print("   3. Activate healthcare network for CaringCall validation")
    print("   4. Use recent connections for TheSalesSherpa testimonials")
    print("   5. Target tech executives for SaaS platform feedback")
    
    return {
        'total_connections': len(connections),
        'recent_connections': len(recent_connections),
        'target_company_matches': len(target_matches),
        'high_value_connections': len(high_value_connections),
        'fa_colleagues': len(fa_connections)
    }

if __name__ == "__main__":
    analysis = analyze_linkedin_network()