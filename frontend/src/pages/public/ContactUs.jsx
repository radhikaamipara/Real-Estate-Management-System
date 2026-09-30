import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import './ContactUs.css';

const ContactUs = () => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/contact', formData);
      if (res.data.success) {
        showToast(res.data.message || 'Message sent successfully!', 'success');
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit contact message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
          <span className="section-tag">Get In Touch</span>
          <h1 className="page-title">We're Here to Help You Move Forward</h1>
          <p className="page-subtitle">
            Have questions about a property listing, scheduling a physical visit, or listing your assets as an agent? Reach out to our Gujarat headquarters.
          </p>
        </div>

        <div className="contact-layout">
          {/* Left Gujarat Offices Card */}
          <div className="contact-info-card">
            <h2 className="contact-info-title">Regional Offices</h2>
            <p className="contact-info-desc">
              Our specialized regional representatives are available across major commercial and residential hubs in Gujarat.
            </p>

            <div className="office-item">
              <div className="office-icon"><MapPin size={20} /></div>
              <div>
                <div className="office-city">Gandhinagar HQ (GIFT City)</div>
                <div className="office-address">Level 14, Tower 3, GIFT SEZ, Gandhinagar - 382355</div>
              </div>
            </div>

            <div className="office-item">
              <div className="office-icon"><MapPin size={20} /></div>
              <div>
                <div className="office-city">Ahmedabad Branch</div>
                <div className="office-address">Mondeal Heights, Near Wide Angle, SG Highway, Ahmedabad - 380015</div>
              </div>
            </div>

            <div className="office-item">
              <div className="office-icon"><MapPin size={20} /></div>
              <div>
                <div className="office-city">Surat Branch</div>
                <div className="office-address">International Business Center (IBC), Piplod, Surat - 395007</div>
              </div>
            </div>

            <div className="office-item">
              <div className="office-icon"><MapPin size={20} /></div>
              <div>
                <div className="office-city">Vadodara Branch</div>
                <div className="office-address">Alkapuri Plaza, RC Dutt Road, Alkapuri, Vadodara - 390007</div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                <Phone size={18} color="#60a5fa" />
                <span style={{ fontSize: '0.95rem' }}>+91 (079) 4900-2026 / +91 98250 00111</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={18} color="#60a5fa" />
                <span style={{ fontSize: '0.95rem' }}>support@estatenexus.in</span>
              </div>
            </div>
          </div>

          {/* Right Message Form */}
          <div className="contact-form-card">
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--status-approved-bg)', color: 'var(--status-approved-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                  Message Sent Successfully!
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  Thank you for reaching out. One of our regional property coordinators will review your message and respond within 24 hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="btn btn-outline"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1.5rem' }}>
                  Send an Inquiry
                </h3>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    className="form-control" 
                    placeholder="e.g. Dhaval Patel"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      name="email"
                      className="form-control" 
                      placeholder="e.g. dhaval@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className="form-control" 
                      placeholder="e.g. +91 98250 12345"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input 
                    type="text" 
                    name="subject"
                    className="form-control" 
                    placeholder="e.g. Inquiring about commercial space in GIFT City"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea 
                    name="message"
                    className="form-control" 
                    rows={5}
                    placeholder="Provide details about your query or requirement..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg btn-full"
                  disabled={submitting}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Submitting...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
