import React from 'react';
import { Building2, ShieldCheck, Cpu, Database, Users, Award, CheckCircle } from 'lucide-react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div>
      {/* Hero Header */}
      <section className="about-hero">
        <div className="container">
          <h1 className="about-hero-title">About EstateNexus</h1>
          <p className="about-hero-desc">
            Revolutionizing property discovery, visit scheduling, and digital real estate management across Gujarat with modern technology and full transparency.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-story-grid">
            <div>
              <span className="section-tag">Our Vision & Mission</span>
              <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
                Connecting Gujarat's Property Buyers, Renters & Agents
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                EstateNexus was engineered to solve traditional real estate fragmentation. In fast-growing Gujarat hubs like Ahmedabad, Gandhinagar's GIFT City, Surat, and Vadodara, home buyers and commercial tenants often face outdated listings, unverified broker claims, and inefficient manual scheduling.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                Our platform provides a centralized, role-based ecosystem where every single property is verified by administrators, site visits are scheduled with calendar slots, and inquiries are managed directly between clients and licensed agents.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 600 }}>
                  <CheckCircle size={18} color="var(--brand-blue)" />
                  <span>100% Verified Listings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 600 }}>
                  <CheckCircle size={18} color="var(--brand-blue)" />
                  <span>Integrated Visit Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 600 }}>
                  <CheckCircle size={18} color="var(--brand-blue)" />
                  <span>Role-Based Dashboards</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 600 }}>
                  <CheckCircle size={18} color="var(--brand-blue)" />
                  <span>Full Audit History</span>
                </div>
              </div>
            </div>

            <div>
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80" 
                alt="Corporate Architecture" 
                className="about-story-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Technology Architecture Section */}
      <section className="about-section" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">System Architecture</span>
            <h2 className="section-title">Built with Real-World Engineering</h2>
            <p className="section-subtitle">
              Engineered as an MCA Full-Stack Project demonstrating best practices in scalable architecture.
            </p>
          </div>

          <div className="tech-stack-grid">
            <div className="tech-card">
              <div className="tech-icon-box"><Cpu size={26} /></div>
              <h3 className="tech-title">React.js & Vite</h3>
              <p className="tech-desc">
                High-performance Single Page Application with React Router DOM, Axios HTTP client, and modular CSS design tokens.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon-box"><ServerIcon size={26} /></div>
              <h3 className="tech-title">Python Flask</h3>
              <p className="tech-desc">
                Clean RESTful API architecture with Flask blueprints, CORS middleware, safe file handling, and request validation.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon-box"><Database size={26} /></div>
              <h3 className="tech-title">SQLite & SQLAlchemy</h3>
              <p className="tech-desc">
                Relational database schema with foreign key constraints, cascading deletes, unique visit slots, and ORM abstractions.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon-box"><ShieldCheck size={26} /></div>
              <h3 className="tech-title">JWT Authentication</h3>
              <p className="tech-desc">
                Secure Werkzeug password hashing, stateless JWT tokens, and strict role-based access control (RBAC).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Simple ServerIcon component
const ServerIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
    <line x1="6" x2="6.01" y1="6" y2="6"/>
    <line x1="6" x2="6.01" y1="18" y2="18"/>
  </svg>
);

export default AboutUs;
