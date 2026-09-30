import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, Heart, ArrowUpRight } from 'lucide-react';
import { formatCurrencyINR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './PropertyCard.css';

const defaultFallbackImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

const PropertyCard = ({ property, onFavoriteChange }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isFav, setIsFav] = useState(property.is_favorited || false);
  const [favLoading, setFavLoading] = useState(false);

  const displayImage = property.featured_image || 
    (property.images && property.images.length > 0 ? property.images[0].image_url : defaultFallbackImage);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please log in as a buyer to save favorite properties', 'warning');
      navigate('/login');
      return;
    }

    if (user.role !== 'buyer') {
      showToast('Only buyer accounts can save favorite properties', 'warning');
      return;
    }

    try {
      setFavLoading(true);
      if (isFav) {
        await api.delete(`/api/favorites/${property.id}`);
        setIsFav(false);
        showToast('Property removed from favorites', 'info');
        if (onFavoriteChange) onFavoriteChange(property.id, false);
      } else {
        await api.post(`/api/favorites/${property.id}`);
        setIsFav(true);
        showToast('Property added to your favorites!', 'success');
        if (onFavoriteChange) onFavoriteChange(property.id, true);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update favorites', 'error');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="property-card">
      {/* Property Image & Badges */}
      <div className="property-card-image-wrapper">
        <img 
          src={displayImage} 
          alt={property.title} 
          className="property-card-image"
          loading="lazy"
          onError={(e) => { e.target.src = defaultFallbackImage; }}
        />
        
        <div className="property-card-badges">
          <span className={`badge ${property.purpose === 'Buy' ? 'badge-navy' : 'badge-blue'}`}>
            For {property.purpose}
          </span>
          <span className="badge badge-available">
            {property.property_type}
          </span>
          {property.availability_status !== 'available' && (
            <span className={`badge badge-${property.availability_status}`}>
              {property.availability_status}
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button 
          className={`property-card-fav-btn ${isFav ? 'active' : ''}`}
          onClick={handleToggleFavorite}
          disabled={favLoading}
          title={isFav ? 'Remove from saved' : 'Save property'}
        >
          <Heart size={18} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'currentColor'} />
        </button>
      </div>

      {/* Property Information */}
      <div className="property-card-content">
        <div className="property-card-price">
          {formatCurrencyINR(property.price, property.purpose)}
        </div>

        <Link to={`/properties/${property.id}`}>
          <h3 className="property-card-title" title={property.title}>
            {property.title}
          </h3>
        </Link>

        <div className="property-card-location">
          <MapPin size={14} color="var(--brand-blue)" />
          <span>{property.location}, {property.city}</span>
        </div>

        {/* Specs Pill List */}
        <div className="property-card-specs">
          {property.bedrooms > 0 && (
            <div className="spec-item" title={`${property.bedrooms} Bedrooms`}>
              <Bed size={15} color="var(--text-muted)" />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="spec-item" title={`${property.bathrooms} Bathrooms`}>
              <Bath size={15} color="var(--text-muted)" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          <div className="spec-item" title={`${property.area_sqft} Square Feet`}>
            <Maximize2 size={15} color="var(--text-muted)" />
            <span>{property.area_sqft} sq.ft</span>
          </div>
        </div>

        {/* Agent Info & View Action */}
        <div className="property-card-footer">
          {property.agent ? (
            <div className="property-card-agent">
              <div className="agent-mini-avatar">
                {property.agent.full_name ? property.agent.full_name.charAt(0) : 'A'}
              </div>
              <div className="agent-mini-info">
                <span className="agent-mini-name">{property.agent.full_name}</span>
                <span className="agent-mini-agency">{property.agent.agency_name || 'Verified Agent'}</span>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Property</span>
          )}

          <Link to={`/properties/${property.id}`} className="btn btn-outline btn-sm">
            <span>Details</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
