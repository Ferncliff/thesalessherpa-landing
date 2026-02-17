import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const scrollToSignup = () => {
    document.getElementById('signup').scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDemo = () => {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDashboardAccess = () => {
    navigate('/fa/mattedwards');
  };

  const toggleMobileMenu = () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="nav">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <div className="sherpa-icon">🧭</div>
              <span className="logo-text">TheSalesSherpa</span>
            </div>
            <div className="nav-links">
              <a href="#benefits">Benefits</a>
              <a href="#demo">Demo</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <button className="cta-button-small" onClick={scrollToSignup}>Get Started</button>
            </div>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Strategic Account <span className="highlight">Orchestration</span>
              </h1>
              <p className="hero-subtitle">
                We guide strategic account orchestration so you can focus your efforts on truly adding value to your prospects. 
                We write the music, you play with passion.
              </p>
              <div className="hero-cta">
                <button className="cta-button-large" onClick={scrollToSignup}>
                  Start Your Free Trial
                </button>
                <button className="demo-button" onClick={scrollToDemo}>
                  <span className="play-icon">▶</span> Watch Demo
                </button>
              </div>
              <div className="social-proof-mini">
                <div className="rating">
                  <span className="stars">★★★★★</span>
                  <span>Trusted by 2,500+ sales professionals</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="sherpa-mascot">
                <div className="sherpa-character">
                  <div className="sherpa-hat">🧭</div>
                  <div className="sherpa-face">
                    <div className="eyes">👀</div>
                    <div className="beard">🧔‍♂️</div>
                  </div>
                  <div className="sherpa-body">
                    <div className="backpack">🎒</div>
                    <div className="map">🗺️</div>
                  </div>
                </div>
                <div className="floating-icons">
                  <div className="icon icon-1">💼</div>
                  <div className="icon icon-2">📊</div>
                  <div className="icon icon-3">🤝</div>
                  <div className="icon icon-4">🎯</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section id="benefits" className="benefits">
        <div className="container">
          <div className="section-header">
            <h2>Strategic Account Orchestration - Guided</h2>
            <p>We handle the coordination, you focus on adding value. Three capabilities that harmonize your prospecting efforts.</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🧠</div>
              <h3>Relationship Intelligence</h3>
              <p>Map complex B2B relationships and identify warm introduction paths to your dream prospects.</p>
              <ul>
                <li>LinkedIn network mapping</li>
                <li>Mutual connection discovery</li>
                <li>Introduction path optimization</li>
                <li>Relationship strength scoring</li>
              </ul>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Territory Optimization</h3>
              <p>AI-powered territory analysis that reveals hidden opportunities and prioritizes your outreach.</p>
              <ul>
                <li>Account prioritization algorithms</li>
                <li>Competitive intelligence</li>
                <li>Market penetration analysis</li>
                <li>Revenue opportunity mapping</li>
              </ul>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🤝</div>
              <h3>Seamless Handoffs</h3>
              <p>Turn cold outreach into warm conversations with intelligent introduction request automation.</p>
              <ul>
                <li>Automated introduction requests</li>
                <li>Personalized message templates</li>
                <li>Follow-up sequence management</li>
                <li>Response tracking & analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="demo-section">
        <div className="container">
          <div className="section-header">
            <h2>See TheSalesSherpa In Action</h2>
            <p>Watch how leading sales professionals navigate their territories with AI guidance</p>
          </div>
          <div className="demo-content">
            <div className="demo-video">
              <div className="video-placeholder">
                <div className="play-button">
                  <span>▶</span>
                </div>
                <div className="video-overlay">
                  <h4>Territory Mapping Demo</h4>
                  <p>3:45 • Watch Matt Edwards navigate his First Advantage territory</p>
                </div>
              </div>
            </div>
            <div className="demo-stats">
              <div className="stat">
                <div className="stat-number">847%</div>
                <div className="stat-label">ROI Increase</div>
              </div>
              <div className="stat">
                <div className="stat-number">23min</div>
                <div className="stat-label">Avg. Setup Time</div>
              </div>
              <div className="stat">
                <div className="stat-number">89%</div>
                <div className="stat-label">Response Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Strategic Account Orchestration</h2>
            <p>Professional-grade tools at human-scale pricing. Built by practitioners, for practitioners.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Sherpa Starter</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">49</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features">
                <li>✓ Basic relationship mapping</li>
                <li>✓ 100 LinkedIn connections</li>
                <li>✓ Territory insights</li>
                <li>✓ Email support</li>
              </ul>
              <button className="pricing-button secondary">Start Free Trial</button>
            </div>
            <div className="pricing-card featured">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Sherpa Professional</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">149</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features">
                <li>✓ Advanced relationship intelligence</li>
                <li>✓ Unlimited LinkedIn connections</li>
                <li>✓ AI-powered territory optimization</li>
                <li>✓ Automated introduction requests</li>
                <li>✓ CRM integrations</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="pricing-button primary">Start Free Trial</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Sherpa Enterprise</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">399</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features">
                <li>✓ Everything in Professional</li>
                <li>✓ Multi-territory management</li>
                <li>✓ Team collaboration tools</li>
                <li>✓ Advanced analytics & reporting</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated success manager</li>
              </ul>
              <button className="pricing-button secondary">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about navigating sales with TheSalesSherpa</p>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How does relationship mapping work?</h4>
              <p>TheSalesSherpa analyzes your LinkedIn network and identifies mutual connections with your target prospects, then suggests the optimal introduction path based on relationship strength and relevance.</p>
            </div>
            <div className="faq-item">
              <h4>What CRM systems do you integrate with?</h4>
              <p>We integrate with Salesforce, HubSpot, Pipedrive, and most major CRM platforms. Custom integrations available for Enterprise customers.</p>
            </div>
            <div className="faq-item">
              <h4>Is my data secure?</h4>
              <p>Yes. We use enterprise-grade encryption, SOC 2 compliance, and never share your relationship data. Your network intelligence stays private.</p>
            </div>
            <div className="faq-item">
              <h4>How quickly can I see results?</h4>
              <p>Most users see improved response rates within the first week. Full territory optimization typically delivers measurable results within 30 days.</p>
            </div>
            <div className="faq-item">
              <h4>Do you offer training and support?</h4>
              <p>Yes! All plans include onboarding, video tutorials, and ongoing support. Enterprise customers get dedicated success management.</p>
            </div>
            <div className="faq-item">
              <h4>Can I cancel anytime?</h4>
              <p>Absolutely. No long-term contracts required. Cancel your subscription anytime from your account dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="signup" className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Sales Territory?</h2>
            <p>Join 2,500+ sales professionals who've already discovered their path to success</p>
            <div className="cta-form">
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Enter your work email" 
                  className="email-input"
                />
                <button className="cta-button-large">Start Free Trial</button>
              </div>
              <p className="cta-disclaimer">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
            <div className="trust-indicators">
              <div className="security-badge">🔒 SOC 2 Compliant</div>
              <div className="privacy-badge">🛡️ GDPR Compliant</div>
              <div className="support-badge">💬 24/7 Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <div className="sherpa-icon">🧭</div>
                <span className="logo-text">TheSalesSherpa</span>
              </div>
              <p>Your AI guide through the sales wilderness</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#benefits">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#demo">Demo</a>
                <a href="/fa/mattedwards">Dashboard</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
                <a href="#blog">Blog</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#docs">Documentation</a>
                <a href="#api">API</a>
                <a href="#status">Status</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#security">Security</a>
                <a href="#compliance">Compliance</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Ferncliff Partners. All rights reserved.</p>
            <div className="social-links">
              <a href="#linkedin">LinkedIn</a>
              <a href="#twitter">Twitter</a>
              <a href="#github">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;