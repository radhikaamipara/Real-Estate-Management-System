import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import PropertyCard from '../../components/PropertyCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import './Dashboard.css';

const BuyerFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/favorites');
      if (res.data.success) {
        setFavorites(res.data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteChange = (propertyId, isFavorited) => {
    if (!isFavorited) {
      setFavorites((prev) => prev.filter((f) => f.property_id !== propertyId));
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div className="dashboard-page-header">
          <div>
            <h1 className="page-title">Saved Properties ({favorites.length})</h1>
            <p className="page-subtitle">Your bookmarked residences and commercial investments.</p>
          </div>
          <Link to="/properties" className="btn btn-outline btn-sm">
            <Search size={16} />
            <span>Find More</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your saved properties..." />
        ) : favorites.length === 0 ? (
          <EmptyState 
            icon={Heart}
            title="No saved properties yet" 
            message="When you browse properties, click the heart icon on any card to save it to your wishlist."
            action={
              <Link to="/properties" className="btn btn-primary btn-sm">
                Browse Properties
              </Link>
            }
          />
        ) : (
          <div className="grid-3">
            {favorites.map((fav) => (
              fav.property ? (
                <PropertyCard 
                  key={fav.id} 
                  property={{ ...fav.property, is_favorited: true }} 
                  onFavoriteChange={handleFavoriteChange}
                />
              ) : null
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerFavorites;
