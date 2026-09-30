import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Building, 
  Home as HomeIcon, 
  Briefcase, 
  Layers, 
  Compass, 
  ShieldCheck, 
  CalendarCheck, 
  Headphones, 
  Star, 
  ArrowRight 
} from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  // Search state
  const [purposeTab, setPurposeTab] = useState('Buy');
  const [locationKeyword, setLocationKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Property data states
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [saleProperties, setSaleProperties] = useState([]);
  const [rentProperties, setRentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredRes, saleRes, rentRes] = await Promise.all([
          api.get('/api/properties/featured?limit=6'),
          api.get('/api/properties?purpose=Buy&limit=3'),
          api.get('/api/properties?purpose=Rent&limit=3')
        ]);

        if (featuredRes.data.success) setFeaturedProperties(featuredRes.data.properties);
        if (saleRes.data.success) setSaleProperties(saleRes.data.properties);
        if (rentRes.data.success) setRentProperties(rentRes.data.properties);
      } catch (error) {
        console.error('Error loading properties for home:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (purposeTab) queryParams.set('purpose', purposeTab);
    if (locationKeyword.trim()) queryParams.set('search', locationKeyword.trim());
    if (propertyType) queryParams.set('property_type', propertyType);
    if (maxPrice) queryParams.set('max_price', maxPrice);

    navigate(`/properties?${queryParams.toString()}`);
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Compass size={14} />
              <span>Gujarat's Premier Real Estate Portal</span>
            </div>
            <h1 className="hero-title">
              Discover Your Ideal Property in <span className="hero-title-gradient">Gujarat</span>
            </h1>
            <p className="hero-subtitle">
              Browse verified residential apartments, luxury villas, commercial office spaces, and retail outlets across Ahmedabad, Gandhinagar, Surat, and Vadodara.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Floating Search Form Card */}
      <div className="container">
        <div className="hero-search-card">
          <div className="hero-search-tabs">
            <button 
              type="button" 
              className={`hero-search-tab ${purposeTab === 'Buy' ? 'active' : ''}`}
              onClick={() => setPurposeTab('Buy')}
            >
              Buy Property
            </button>
            <button 
              type="button" 
              className={`hero-search-tab ${purposeTab === 'Rent' ? 'active' : ''}`}
              onClick={() => setPurposeTab('Rent')}
            >
              Rent Property
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <div className="search-field-wrapper">
              <label className="search-field-label">Location or Landmark</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Bodakdev, GIFT City, Vesu..."
                  value={locationKeyword}
                  onChange={(e) => setLocationKeyword(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
                <MapPin size={18} color="var(--brand-blue)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="search-field-wrapper">
              <label className="search-field-label">Property Type</label>
              <select 
                className="form-control form-select"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Apartment">Apartment</option>
                <option value="Flat">Flat</option>
                <option value="Villa">Villa / House</option>
                <option value="Office">Corporate Office</option>
                <option value="Commercial">Commercial Shop</option>
                <option value="Plot">Plot / Land</option>
              </select>
            </div>

            <div className="search-field-wrapper">
              <label className="search-field-label">Max Budget</label>
              <select 
                className="form-control form-select"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              >
                <option value="">Any Budget</option>
                {purposeTab === 'Buy' ? (
                  <>
                    <option value="5000000">Up to ₹50 Lakh</option>
                    <option value="10000000">Up to ₹1.00 Crore</option>
                    <option value="20000000">Up to ₹2.00 Crore</option>
                    <option value="35000000">Up to ₹3.50 Crore</option>
                    <option value="50000000">Up to ₹5.00 Crore</option>
                  </>
                ) : (
                  <>
                    <option value="20000">Up to ₹20,000 / mo</option>
                    <option value="35000">Up to ₹35,000 / mo</option>
                    <option value="50000">Up to ₹50,000 / mo</option>
                    <option value="100000">Up to ₹1,00,000 / mo</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ height: '46px', width: '100%' }}>
                <Search size={18} />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Platform Key Metrics Bar */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div>
              <div className="stat-number">1,250+</div>
              <div className="stat-label">Verified Listings in Gujarat</div>
            </div>
            <div>
              <div className="stat-number">450+</div>
              <div className="stat-label">Licensed Professional Agents</div>
            </div>
            <div>
              <div className="stat-number">98.5%</div>
              <div className="stat-label">Client Satisfaction Rating</div>
            </div>
            <div>
              <div className="stat-number">₹320+ Cr</div>
              <div className="stat-label">Demonstrated Real Estate Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Properties Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Curated Collections</span>
            <h2 className="section-title">Featured Premium Properties</h2>
            <p className="section-subtitle">
              Handpicked residences and prime commercial locations verified by our administrative team.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading featured properties..." />
          ) : (
            <div className="grid-3">
              {featuredProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/properties" className="btn btn-outline btn-lg">
              <span>Explore All Properties</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Popular Gujarat Locations */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">High-Demand Markets</span>
            <h2 className="section-title">Explore Top Gujarat Cities</h2>
            <p className="section-subtitle">
              Find prime residential neighborhoods and booming commercial hubs in Gujarat's leading cities.
            </p>
          </div>

          <div className="locations-grid">
            <div className="location-card" onClick={() => navigate('/properties?city=Ahmedabad')}>
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" 
                alt="Ahmedabad" 
                className="location-img" 
              />
              <div className="location-overlay">
                <div className="location-name">Ahmedabad</div>
                <div className="location-count">Bodakdev, Bopal, SG Highway, Prahlad Nagar</div>
              </div>
            </div>

            <div className="location-card" onClick={() => navigate('/properties?city=Gandhinagar')}>
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" 
                alt="Gandhinagar" 
                className="location-img" 
              />
              <div className="location-overlay">
                <div className="location-name">Gandhinagar</div>
                <div className="location-count">GIFT City, Kudasan, Infocity Corridor</div>
              </div>
            </div>

            <div className="location-card" onClick={() => navigate('/properties?city=Surat')}>
              <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" 
                alt="Surat" 
                className="location-img" 
              />
              <div className="location-overlay">
                <div className="location-name">Surat</div>
                <div className="location-count">Vesu, Adajan, Piplod, VIP Road</div>
              </div>
            </div>

            <div className="location-card" onClick={() => navigate('/properties?city=Vadodara')}>
              <img 
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" 
                alt="Vadodara" 
                className="location-img" 
              />
              <div className="location-overlay">
                <div className="location-name">Vadodara</div>
                <div className="location-count">Alkapuri, Gotri, Vasna Bhayli</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Properties for Sale & Rent Tabs */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <span className="section-tag">Ownership Opportunities</span>
              <h2 className="section-title" style={{ fontSize: '1.85rem' }}>Top Properties for Sale</h2>
            </div>
            <Link to="/properties?purpose=Buy" className="btn btn-outline btn-sm">
              <span>View All For Sale</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid-3" style={{ marginBottom: '4rem' }}>
            {saleProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <span className="section-tag">Rental Residences</span>
              <h2 className="section-title" style={{ fontSize: '1.85rem' }}>Top Properties for Rent</h2>
            </div>
            <Link to="/properties?purpose=Rent" className="btn btn-outline btn-sm">
              <span>View All For Rent</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid-3">
            {rentProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Property Categories Grid */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Varied Typologies</span>
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-subtitle">
              From compact urban flats to expansive royal bungalows and corporate suites.
            </p>
          </div>

          <div className="categories-grid">
            <div className="category-card" onClick={() => navigate('/properties?property_type=Apartment')} style={{ cursor: 'pointer' }}>
              <div className="category-icon"><Building size={24} /></div>
              <div className="category-title">Apartments</div>
            </div>
            <div className="category-card" onClick={() => navigate('/properties?property_type=Flat')} style={{ cursor: 'pointer' }}>
              <div className="category-icon"><Layers size={24} /></div>
              <div className="category-title">Flats</div>
            </div>
            <div className="category-card" onClick={() => navigate('/properties?property_type=Villa')} style={{ cursor: 'pointer' }}>
              <div className="category-icon"><HomeIcon size={24} /></div>
              <div className="category-title">Villas</div>
            </div>
            <div className="category-card" onClick={() => navigate('/properties?property_type=House')} style={{ cursor: 'pointer' }}>
              <div className="category-icon"><HomeIcon size={24} /></div>
              <div className="category-title">Bungalows</div>
            </div>
            <div className="category-card" onClick={() => navigate('/properties?property_type=Office')} style={{ cursor: 'pointer' }}>
              <div className="category-icon"><Briefcase size={24} /></div>
              <div className="category-title">Offices</div>
            </div>
            <div className="category-card" onClick={() => navigate('/properties?property_type=Commercial')} style={{ cursor: 'pointer' }}>
              <div className="category-icon"><Building size={24} /></div>
              <div className="category-title">Commercial</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Why Choose Us */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">The EstateNexus Difference</span>
            <h2 className="section-title">Why Buyers & Agents Trust Us</h2>
            <p className="section-subtitle">
              We eliminate traditional real estate headaches through modern digital verification and scheduled property visits.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-box"><ShieldCheck size={24} /></div>
              <h3 className="feature-title">100% Admin Verified</h3>
              <p className="feature-text">
                Every property submission undergoes rigorous admin scrutiny and verification before becoming visible publicly.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-box"><CalendarCheck size={24} /></div>
              <h3 className="feature-title">Online Visit Scheduling</h3>
              <p className="feature-text">
                Schedule property site visits with instant date and time slot confirmation directly from your buyer dashboard.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-box"><Compass size={24} /></div>
              <h3 className="feature-title">Transparent Workflow</h3>
              <p className="feature-text">
                Track inquiry responses, agent feedback, property reservation updates, and transaction milestones seamlessly.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-box"><Headphones size={24} /></div>
              <h3 className="feature-title">Direct Agent Messaging</h3>
              <p className="feature-text">
                Contact licensed Gujarat real estate brokers with tailored inquiries and receive answers right on your portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Customer Testimonials */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">User Experiences</span>
            <h2 className="section-title">What Our Community Says</h2>
            <p className="section-subtitle">
              Real feedback from homeowners, tenants, and licensed brokers using EstateNexus.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "Finding a spacious 3 BHK apartment in Bodakdev, Ahmedabad was effortless. Scheduling a site visit through the portal took less than two minutes and the agent Rajesh was extremely professional."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div>
                  <div className="author-name">Amit Shah</div>
                  <div className="author-role">Buyer, Ahmedabad</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "As a real estate agent operating in Surat and Vadodara, having an intuitive dashboard where I can track inquiries and schedule visits in one organized place increased my client conversions significantly."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">P</div>
                <div>
                  <div className="author-name">Priya Sharma</div>
                  <div className="author-role">Certified Broker, Metro Landmarks Surat</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "Secured a corporate office for our technology company in GIFT City, Gandhinagar. Clear pricing, high-definition images, and responsive communication gave us peace of mind."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">R</div>
                <div>
                  <div className="author-name">Rohit Mehta</div>
                  <div className="author-role">Commercial Tenant, Gandhinagar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Call to Action Banner */}
      <div className="container">
        <div className="cta-banner">
          <h2 className="cta-title">Are You an Agent or Property Owner?</h2>
          <p className="cta-desc">
            Reach thousands of active home buyers and commercial tenants across Gujarat. Register your agent profile today and start listing properties with zero hassle.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ backgroundColor: '#ffffff', color: 'var(--primary-navy)' }}>
              <span>Join as an Agent</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff' }}>
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
