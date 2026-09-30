import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Car, 
  Sofa, 
  Heart, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Send 
} from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrencyINR } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import './PropertyDetails.css';

const defaultFallbackImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [actionTab, setActionTab] = useState('inquiry'); // 'inquiry' or 'visit'

  // Inquiry Form State
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryTime, setInquiryTime] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  // Visit Form State
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00 AM - 11:00 AM');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/properties/${id}`);
        if (res.data.success) {
          setProperty(res.data.property);
          setIsFav(res.data.property.is_favorited);
          setActiveImageIndex(0);
          if (user?.phone) {
            setInquiryPhone(user.phone);
          }
        }
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load property details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user, showToast]);

  const handleToggleFavorite = async () => {
    if (!user) {
      showToast('Please log in to save favorite properties', 'warning');
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      showToast('Only buyers can save favorite properties', 'warning');
      return;
    }

    try {
      if (isFav) {
        await api.delete(`/api/favorites/${property.id}`);
        setIsFav(false);
        showToast('Property removed from favorites', 'info');
      } else {
        await api.post(`/api/favorites/${property.id}`);
        setIsFav(true);
        showToast('Property added to your favorites!', 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating favorites', 'error');
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in as a buyer to send an inquiry', 'warning');
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      showToast('Only buyers can send property inquiries', 'warning');
      return;
    }
    if (!inquiryMessage.trim()) {
      showToast('Please enter an inquiry message', 'warning');
      return;
    }

    try {
      setInquirySubmitting(true);
      const res = await api.post('/api/inquiries', {
        property_id: property.id,
        message: inquiryMessage.trim(),
        phone: inquiryPhone.trim(),
        preferred_time: inquiryTime.trim()
      });
      if (res.data.success) {
        showToast(res.data.message || 'Inquiry submitted successfully!', 'success');
        setInquiryMessage('');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit inquiry', 'error');
    } finally {
      setInquirySubmitting(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in as a buyer to schedule a property visit', 'warning');
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      showToast('Only buyers can schedule property visits', 'warning');
      return;
    }
    if (!visitDate) {
      showToast('Please select a visit date', 'warning');
      return;
    }

    try {
      setVisitSubmitting(true);
      const res = await api.post('/api/visits', {
        property_id: property.id,
        visit_date: visitDate,
        visit_time: visitTime,
        notes: visitNotes.trim()
      });
      if (res.data.success) {
        showToast(res.data.message || 'Visit scheduled successfully! The agent has been notified.', 'success');
        setVisitNotes('');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to schedule visit', 'error');
    } finally {
      setVisitSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading property details..." />;
  }

  if (!property) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Property not found</h2>
        <Link to="/properties" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Listings
        </Link>
      </div>
    );
  }

  const imagesList = property.images && property.images.length > 0 
    ? property.images.map(img => img.image_url) 
    : [defaultFallbackImage];

  const currentImage = imagesList[activeImageIndex] || defaultFallbackImage;

  // Minimum date for visit is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  return (
    <div className="property-details-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <Link to="/">Home</Link> / <Link to="/properties">Properties</Link> / <Link to={`/properties?city=${property.city}`}>{property.city}</Link> / <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{property.title}</span>
        </div>

        <div className="details-grid">
          {/* Main Left Details */}
          <div>
            {/* Gallery */}
            <div className="gallery-wrapper">
              <div className="main-image-container">
                <img 
                  src={currentImage} 
                  alt={property.title} 
                  className="main-image"
                  onError={(e) => { e.target.src = defaultFallbackImage; }}
                />
              </div>

              {imagesList.length > 1 && (
                <div className="thumbnail-strip">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`thumbnail-btn ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="thumbnail-img" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header: Title, Price, Location */}
            <div className="details-header">
              <div className="details-price-row">
                <div className="details-price">
                  {formatCurrencyINR(property.price, property.purpose)}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge ${property.purpose === 'Buy' ? 'badge-navy' : 'badge-blue'}`}>
                    For {property.purpose}
                  </span>
                  <span className="badge badge-available">
                    {property.availability_status}
                  </span>
                  <button 
                    onClick={handleToggleFavorite}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#ffffff',
                      color: isFav ? '#ef4444' : 'var(--text-muted)'
                    }}
                    title="Toggle Saved Property"
                  >
                    <Heart size={20} fill={isFav ? '#ef4444' : 'none'} />
                  </button>
                </div>
              </div>

              <h1 className="details-title">{property.title}</h1>
              <div className="details-location">
                <MapPin size={18} color="var(--brand-blue)" />
                <span>{property.location}, {property.city}, {property.state}</span>
              </div>
            </div>

            {/* Specs Overview Grid */}
            <div className="overview-specs-grid">
              <div className="overview-spec-box">
                <div className="overview-icon-box"><Bed size={20} /></div>
                <div>
                  <div className="overview-label">Bedrooms</div>
                  <div className="overview-value">{property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio'}</div>
                </div>
              </div>

              <div className="overview-spec-box">
                <div className="overview-icon-box"><Bath size={20} /></div>
                <div>
                  <div className="overview-label">Bathrooms</div>
                  <div className="overview-value">{property.bathrooms} Baths</div>
                </div>
              </div>

              <div className="overview-spec-box">
                <div className="overview-icon-box"><Maximize2 size={20} /></div>
                <div>
                  <div className="overview-label">Super Area</div>
                  <div className="overview-value">{property.area_sqft} sq.ft</div>
                </div>
              </div>

              <div className="overview-spec-box">
                <div className="overview-icon-box"><Sofa size={20} /></div>
                <div>
                  <div className="overview-label">Furnishing</div>
                  <div className="overview-value">{property.furnishing}</div>
                </div>
              </div>

              <div className="overview-spec-box">
                <div className="overview-icon-box"><Car size={20} /></div>
                <div>
                  <div className="overview-label">Parking</div>
                  <div className="overview-value">{property.parking}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="details-card">
              <h2 className="details-card-title">Property Description</h2>
              <p className="details-description" style={{ whiteSpace: 'pre-line' }}>
                {property.description}
              </p>
            </div>

            {/* Amenities Checklist */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="details-card">
                <h2 className="details-card-title">Features & Amenities</h2>
                <div className="amenities-grid">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <CheckCircle2 size={16} color="var(--brand-blue)" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Profile Card */}
            {property.agent && (
              <div className="details-card">
                <h2 className="details-card-title">Listing Agent Details</h2>
                <div className="agent-profile-box">
                  <div className="agent-profile-avatar">
                    {property.agent.full_name ? property.agent.full_name.charAt(0) : 'A'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="agent-profile-name">{property.agent.full_name}</div>
                    <div className="agent-profile-agency">{property.agent.agency_name || 'Gujarat Premier Realty'}</div>
                    <p className="agent-profile-bio">
                      {property.agent.bio || 'Experienced Gujarat property consultant dedicated to seamless property transactions and verified listings.'}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={15} color="var(--brand-blue)" />
                        <span>{property.agent.phone || '+91 98250 12345'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={15} color="var(--brand-blue)" />
                        <span>{property.agent.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Similar Properties */}
            {property.similar && property.similar.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                  Similar Properties in {property.city}
                </h2>
                <div className="grid-3">
                  {property.similar.map((simProp) => (
                    <PropertyCard key={simProp.id} property={simProp} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Right Action Box (Inquiry & Visit Scheduling) */}
          <aside className="action-card">
            <div className="action-card-tabs">
              <button 
                type="button" 
                className={`action-card-tab ${actionTab === 'inquiry' ? 'active' : ''}`}
                onClick={() => setActionTab('inquiry')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={16} />
                  <span>Send Inquiry</span>
                </div>
              </button>
              <button 
                type="button" 
                className={`action-card-tab ${actionTab === 'visit' ? 'active' : ''}`}
                onClick={() => setActionTab('visit')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} />
                  <span>Schedule Visit</span>
                </div>
              </button>
            </div>

            <div className="action-card-body">
              {actionTab === 'inquiry' ? (
                /* Inquiry Form */
                <form onSubmit={handleInquirySubmit}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                    Contact Agent
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Send an inquiry directly to {property.agent?.full_name || 'the listing agent'}.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Your Message *</label>
                    <textarea 
                      className="form-control" 
                      rows={4}
                      placeholder="Hi, I am interested in this property. Please let me know more details..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      placeholder="+91 98765 43210"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Callback Time</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Weekdays after 5 PM"
                      value={inquiryTime}
                      onChange={(e) => setInquiryTime(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-full"
                    disabled={inquirySubmitting}
                  >
                    <Send size={16} />
                    <span>{inquirySubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                  </button>
                </form>
              ) : (
                /* Visit Scheduling Form */
                <form onSubmit={handleVisitSubmit}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                    Schedule Site Visit
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Request an in-person walkthrough with the property agent.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Visit Date *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      min={minDateString}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Time Slot *</label>
                    <select 
                      className="form-control form-select"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      required
                    >
                      <option value="10:00 AM - 11:00 AM">Morning: 10:00 AM - 11:00 AM</option>
                      <option value="11:00 AM - 12:00 PM">Morning: 11:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 03:00 PM">Afternoon: 02:00 PM - 03:00 PM</option>
                      <option value="04:00 PM - 05:00 PM">Evening: 04:00 PM - 05:00 PM</option>
                      <option value="05:00 PM - 06:00 PM">Evening: 05:00 PM - 06:00 PM</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes for Agent (Optional)</label>
                    <textarea 
                      className="form-control" 
                      rows={3}
                      placeholder="e.g. Coming with family, interested in parking spaces..."
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-navy btn-full"
                    disabled={visitSubmitting}
                  >
                    <Calendar size={16} />
                    <span>{visitSubmitting ? 'Requesting...' : 'Request Visit'}</span>
                  </button>
                </form>
              )}

              {!user && (
                <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--brand-blue-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--brand-blue)', textAlign: 'center' }}>
                  Please <Link to="/login" style={{ fontWeight: 700, textDecoration: 'underline' }}>log in as a buyer</Link> to submit inquiries and book visits.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
