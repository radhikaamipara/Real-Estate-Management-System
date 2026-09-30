import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="footer-brand">
              <div className="brand-icon-box">
                <Building2 size={22} />
              </div>
              <span>EstateNexus</span>
            </div>
            <p className="footer-desc">
              Next-generation real estate management platform connecting home buyers, tenants, verified property agents, and administrators across Gujarat with end-to-end transparency.
            </p>
            <div className="project-tag">
              MCA SEM 3 Full-Stack Capstone Project
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-title">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/properties" className="footer-link">Browse Properties</Link></li>
              <li><Link to="/properties?purpose=Buy" className="footer-link">Properties for Sale</Link></li>
              <li><Link to="/properties?purpose=Rent" className="footer-link">Properties for Rent</Link></li>
              <li><Link to="/about" className="footer-link">About EstateNexus</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Support</Link></li>
            </ul>
          </div>

          {/* Popular Gujarat Locations */}
          <div>
            <h4 className="footer-title">Top Locations</h4>
            <ul className="footer-links">
              <li><Link to="/properties?city=Ahmedabad" className="footer-link">Ahmedabad (Bodakdev, Bopal)</Link></li>
              <li><Link to="/properties?city=Gandhinagar" className="footer-link">Gandhinagar (GIFT City, Kudasan)</Link></li>
              <li><Link to="/properties?city=Surat" className="footer-link">Surat (Vesu, Adajan, Piplod)</Link></li>
              <li><Link to="/properties?city=Vadodara" className="footer-link">Vadodara (Alkapuri, Gotri)</Link></li>
            </ul>
          </div>

          {/* Head Office Contact */}
          <div>
            <h4 className="footer-title">Gujarat Regional Office</h4>
            <div className="footer-contact-item">
              <MapPin size={18} style={{ color: 'var(--brand-blue)', flexShrink: 0, marginTop: '2px' }} />
              <span>Tower 3, GIFT SEZ, Gandhinagar - 382355, Gujarat, India</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} />
              <span>+91 (079) 4900-2026</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} />
              <span>support@estatenexus.in</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EstateNexus Platform. Built with React.js, Python Flask & SQLite.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            College MCA Full-Stack Development Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
