import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import './Properties.css';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [furnishing, setFurnishing] = useState(searchParams.get('furnishing') || '');
  const [parking, setParking] = useState(searchParams.get('parking') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Count active filters
  const activeCount = [searchTerm, purpose, propertyType, city, minPrice, maxPrice, bedrooms, furnishing, parking].filter(Boolean).length;

  // Sync state to URL and fetch properties
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.set('search', searchTerm);
      if (purpose) params.set('purpose', purpose);
      if (propertyType) params.set('property_type', propertyType);
      if (city) params.set('city', city);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (bedrooms) params.set('bedrooms', bedrooms);
      if (furnishing) params.set('furnishing', furnishing);
      if (parking) params.set('parking', parking);
      if (sortBy) params.set('sort', sortBy);
      params.set('page', page);
      params.set('limit', 9);

      setSearchParams(params, { replace: true });

      const response = await api.get(`/api/properties?${params.toString()}`);
      if (response.data.success) {
        setProperties(response.data.properties);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, purpose, propertyType, city, minPrice, maxPrice, bedrooms, furnishing, parking, sortBy, page, setSearchParams]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setPurpose('');
    setPropertyType('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setFurnishing('');
    setParking('');
    setSortBy('newest');
    setPage(1);
    setMobileFiltersOpen(false);
  };

  return (
    <div className="properties-page">
      <div className="container">
        {/* Top Header */}
        <div className="page-header" style={{ marginBottom: '1.25rem' }}>
          <h1 className="page-title">Explore Verified Properties</h1>
          <p className="page-subtitle">
            Browse premium residential and commercial real estate available across Gujarat.
          </p>
        </div>

        {/* Mobile Filter Toggle Bar */}
        <div className="mobile-filter-bar">
          <button 
            type="button" 
            className="mobile-filter-toggle-btn"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <SlidersHorizontal size={16} />
            <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filter Properties'}</span>
            {activeCount > 0 && <span className="filter-badge-pill">{activeCount}</span>}
          </button>
          {activeCount > 0 && (
            <button type="button" onClick={handleResetFilters} className="mobile-filter-clear-btn">
              Clear All ({activeCount})
            </button>
          )}
        </div>

        <div className="properties-layout">
          {/* Left Filter Sidebar */}
          <aside className={`filter-card ${mobileFiltersOpen ? 'mobile-open' : 'mobile-closed'}`}>
            <div className="filter-header">
              <h3>
                <Filter size={18} color="var(--brand-blue)" />
                <span>Filters {activeCount > 0 && `(${activeCount})`}</span>
              </h3>
              <button onClick={handleResetFilters} className="filter-reset-btn">
                Reset All
              </button>
            </div>

            {/* Keyword Search */}
            <div className="filter-group">
              <label className="filter-label">Keyword / Landmark</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Title, society, road..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  style={{ paddingRight: '2rem' }}
                />
                {searchTerm && (
                  <button 
                    onClick={() => { setSearchTerm(''); setPage(1); }}
                    style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Purpose */}
            <div className="filter-group">
              <label className="filter-label">Purpose</label>
              <div className="pill-group">
                <button 
                  type="button" 
                  className={`pill-btn ${purpose === '' ? 'active' : ''}`}
                  onClick={() => { setPurpose(''); setPage(1); }}
                >
                  All
                </button>
                <button 
                  type="button" 
                  className={`pill-btn ${purpose === 'Buy' ? 'active' : ''}`}
                  onClick={() => { setPurpose('Buy'); setPage(1); }}
                >
                  Buy
                </button>
                <button 
                  type="button" 
                  className={`pill-btn ${purpose === 'Rent' ? 'active' : ''}`}
                  onClick={() => { setPurpose('Rent'); setPage(1); }}
                >
                  Rent
                </button>
              </div>
            </div>

            {/* City */}
            <div className="filter-group">
              <label className="filter-label">City</label>
              <select 
                className="form-control form-select"
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
              >
                <option value="">All Gujarat Cities</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Gandhinagar">Gandhinagar</option>
                <option value="Surat">Surat</option>
                <option value="Vadodara">Vadodara</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="filter-group">
              <label className="filter-label">Property Type</label>
              <select 
                className="form-control form-select"
                value={propertyType}
                onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
              >
                <option value="">All Categories</option>
                <option value="Apartment">Apartment</option>
                <option value="Flat">Flat</option>
                <option value="Villa">Villa</option>
                <option value="House">Bungalow / House</option>
                <option value="Office">Office Space</option>
                <option value="Commercial">Commercial Shop</option>
                <option value="Plot">Plot / Land</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label className="filter-label">Price Range (₹)</label>
              <div className="price-inputs-row">
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                />
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="filter-group">
              <label className="filter-label">Bedrooms (BHK)</label>
              <div className="pill-group">
                <button 
                  type="button" 
                  className={`pill-btn ${bedrooms === '' ? 'active' : ''}`}
                  onClick={() => { setBedrooms(''); setPage(1); }}
                >
                  Any
                </button>
                {['1', '2', '3', '4'].map((b) => (
                  <button 
                    key={b}
                    type="button" 
                    className={`pill-btn ${bedrooms === b ? 'active' : ''}`}
                    onClick={() => { setBedrooms(b); setPage(1); }}
                  >
                    {b === '4' ? '4+ BHK' : `${b} BHK`}
                  </button>
                ))}
              </div>
            </div>

            {/* Furnishing */}
            <div className="filter-group">
              <label className="filter-label">Furnishing Status</label>
              <select 
                className="form-control form-select"
                value={furnishing}
                onChange={(e) => { setFurnishing(e.target.value); setPage(1); }}
              >
                <option value="">Any Furnishing</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Parking */}
            <div className="filter-group">
              <label className="filter-label">Parking Type</label>
              <select 
                className="form-control form-select"
                value={parking}
                onChange={(e) => { setParking(e.target.value); setPage(1); }}
              >
                <option value="">Any Parking</option>
                <option value="Covered">Covered</option>
                <option value="Open">Open</option>
              </select>
            </div>
          </aside>

          {/* Right Properties List */}
          <main>
            {/* Results Header with Sorting */}
            <div className="properties-header">
              <div className="properties-count">
                <span>{pagination.total} Properties Found</span>
                {city && <span className="properties-count-sub">in {city}</span>}
              </div>

              <div className="sort-wrapper">
                <span className="sort-label">Sort by:</span>
                <select 
                  className="form-control form-select sort-select"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                >
                  <option value="newest">Newest Listed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="area_desc">Area: High to Low</option>
                </select>
              </div>
            </div>

            {/* Loading or Properties Grid */}
            {loading ? (
              <LoadingSpinner message="Searching properties..." />
            ) : properties.length === 0 ? (
              <EmptyState 
                title="No properties match your filters" 
                message="Try adjusting your budget range, changing the selected city, or resetting the filters to view more listings."
                action={
                  <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                    Reset All Filters
                  </button>
                }
              />
            ) : (
              <>
                <div className="grid-3">
                  {properties.map((prop) => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button 
                      className="page-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {[...Array(pagination.pages)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button 
                          key={pageNum}
                          className={`page-btn ${page === pageNum ? 'active' : ''}`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button 
                      className="page-btn"
                      disabled={page >= pagination.pages}
                      onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Properties;
