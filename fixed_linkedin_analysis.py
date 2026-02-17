#!/usr/bin/env python3
"""
Fixed LinkedIn Network Analysis for TheSalesSherpa
"""
import csv
from collections import Counter, defaultdict

def analyze_network():
    """Analyze Matt's LinkedIn network with proper CSV parsing"""
    
    print("🚀 THESALESSHERPA: LinkedIn Network Analysis (FIXED)")
    print("=" * 60)
    
    connections = []
    
    # Read CSV file, skip the notes at the beginning
    with open('/Users/ferncliffadmin/clawd/projects/thesalessherpa/linkedin_data/Connections.csv', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
        # Find the header line (starts with "First Name")
        header_index = -1
        for i, line in enumerate(lines):
            if line.startswith('First Name'):
                header_index = i
                break
        
        if header_index >= 0:
            # Parse from the header line onwards
            csv_data = lines[header_index:]
            reader = csv.DictReader(csv_data)
            connections = list(reader)
    
    print(f"📊 NETWORK SIZE: {len(connections):,} connections")
    print()
    
    # Company analysis
    companies = Counter()
    for conn in connections:
        company = conn.get('Company', '').strip()
        if company and company != '':
            companies[company] += 1
    
    print("🏢 TOP COMPANIES IN NETWORK:")
    for company, count in companies.most_common(15):
        print(f"   • {company}: {count} connections")
    print()
    
    # Recent connections (2025-2026)
    recent_connections = []
    for conn in connections:
        connected_date = conn.get('Connected On', '')
        if '2025' in connected_date or '2026' in connected_date:
            recent_connections.append(conn)
    
    print(f"🔥 RECENT CONNECTIONS (2025-2026): {len(recent_connections)}")
    print("Recent high-value connections:")
    for i, conn in enumerate(recent_connections[:10]):
        company = conn.get('Company', 'Unknown')
        position = conn.get('Position', 'Unknown')
        name = f"{conn.get('First Name', '')} {conn.get('Last Name', '')}"
        connected = conn.get('Connected On', '')
        print(f"   • {name}: {position} at {company} ({connected})")
    print()
    
    # Target company analysis  
    target_companies = [
        'WPP', 'Battelle', 'Uber', 'Maximus', 'Tetra Tech',
        'Microsoft', 'Google', 'Amazon', 'Salesforce', 'Oracle',
        'JPMorgan', 'Bank of America', 'Wells Fargo', 'Goldman'
    ]
    
    print("🎯 TARGET COMPANY CONNECTIONS:")
    target_matches = []
    
    for target in target_companies:
        matches = []
        for conn in connections:
            company = conn.get('Company', '').lower()
            if target.lower() in company and company != '':
                matches.append(conn)
                target_matches.append(conn)
        
        if matches:
            print(f"   🔥 {target}: {len(matches)} connections")
            for match in matches[:3]:  # Show top 3
                name = f"{match.get('First Name', '')} {match.get('Last Name', '')}"
                print(f"      → {name}: {match.get('Position', 'Unknown')}")
    print()
    
    # First Advantage network
    fa_connections = []
    for conn in connections:
        company = conn.get('Company', '').lower()
        if 'first advantage' in company:
            fa_connections.append(conn)
    
    print(f"🏢 FIRST ADVANTAGE COLLEAGUES: {len(fa_connections)}")
    print("Internal network (perfect for testimonials):")
    for conn in fa_connections[:8]:
        name = f"{conn.get('First Name', '')} {conn.get('Last Name', '')}"
        print(f"   • {name}: {conn.get('Position', 'Unknown')}")
    print()
    
    # Executive-level connections
    exec_keywords = ['CEO', 'President', 'VP', 'Vice President', 'SVP', 'Senior Vice President', 'Chief', 'Head of', 'Director']
    exec_connections = []
    
    for conn in connections:
        position = conn.get('Position', '').lower()
        if any(keyword.lower() in position for keyword in exec_keywords):
            exec_connections.append(conn)
    
    print(f"💼 EXECUTIVE CONNECTIONS: {len(exec_connections)}")
    print("C-level/VP connections (perfect warm intro sources):")
    for i, conn in enumerate(exec_connections[:10]):
        name = f"{conn.get('First Name', '')} {conn.get('Last Name', '')}"
        company = conn.get('Company', 'Unknown')
        position = conn.get('Position', 'Unknown')
        print(f"   • {name}: {position} at {company}")
    print()
    
    # AI industry connections
    ai_connections = []
    for conn in connections:
        company = conn.get('Company', '').lower()
        if any(ai_term in company for ai_term in ['openai', 'anthropic', 'ai', 'artificial intelligence']):
            ai_connections.append(conn)
    
    if ai_connections:
        print("🤖 AI INDUSTRY CONNECTIONS:")
        for conn in ai_connections:
            name = f"{conn.get('First Name', '')} {conn.get('Last Name', '')}"
            print(f"   🔥 {name}: {conn.get('Position', 'Unknown')} at {conn.get('Company', 'Unknown')}")
        print()
    
    # Sales connections
    sales_connections = []
    for conn in connections:
        position = conn.get('Position', '').lower()
        if any(term in position for term in ['sales', 'business development', 'revenue', 'account']):
            sales_connections.append(conn)
    
    print(f"💰 SALES PROFESSIONALS: {len(sales_connections)}")
    print("Fellow sales professionals (TheSalesSherpa early adopters):")
    for conn in sales_connections[:6]:
        name = f"{conn.get('First Name', '')} {conn.get('Last Name', '')}"
        company = conn.get('Company', 'Unknown')
        print(f"   • {name}: {conn.get('Position', 'Unknown')} at {company}")
    print()
    
    print("🎯 THESALESSHERPA GOLDMINE ANALYSIS:")
    print("=" * 60)
    print(f"🔥 Network Size: {len(connections):,} (MASSIVE relationship database)")
    print(f"🔥 Recent Growth: {len(recent_connections)} connections in 2025-2026")
    print(f"🔥 Executive Access: {len(exec_connections)} C-level/VP decision makers")
    print(f"🔥 Target Coverage: {len(target_matches)} connections at priority accounts")
    print(f"🔥 Internal Support: {len(fa_connections)} FA colleagues for validation")
    print(f"🔥 Sales Network: {len(sales_connections)} fellow sales pros")
    print(f"🔥 AI Connections: {len(ai_connections)} AI industry contacts")
    print()
    
    print("🚀 THESALESSHERPA VP DEMO POWER:")
    print("   ✅ REAL relationship data from 1,040 connections")
    print("   ✅ Live demonstration of warm intro pathways")
    print("   ✅ Actual executive contacts for credibility")
    print("   ✅ Internal FA network for immediate validation")
    print("   ✅ AI industry connections for technical credibility")
    print()
    
    print("💡 VP INTERVIEW DEMO SCRIPT:")
    print("   1. 'Here's my actual LinkedIn network of 1,040 professionals'")
    print("   2. 'TheSalesSherpa maps warm paths to any target company'")
    print("   3. 'Watch me find connections to [demo target company]'")
    print("   4. 'This is how we turn cold prospects into warm introductions'")
    print("   5. 'Every FA rep could have this intelligence advantage'")
    
    return {
        'total': len(connections),
        'recent': len(recent_connections),
        'executives': len(exec_connections),
        'fa_colleagues': len(fa_connections),
        'target_companies': len(target_matches),
        'sales_pros': len(sales_connections)
    }

if __name__ == "__main__":
    stats = analyze_network()
    print()
    print("📊 SUMMARY STATS:")
    for key, value in stats.items():
        print(f"   {key}: {value}")