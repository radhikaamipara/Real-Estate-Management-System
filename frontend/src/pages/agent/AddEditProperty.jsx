import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Building, 
  Upload, 
  X, 
  Plus, 
  ArrowLeft, 
  Save, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import '../buyer/Dashboard.css';

const availableAmenitiesList = [
  'Swimming Pool',
  'Clubhouse',
  'Gymnasium',
  '24x7 Security',
  'CCTV Surveillance',
  'Power Backup',
  'High Speed Elevators',
  'Piped Gas Line',
  'Children Play Area',
  'EV Charging Station',
  'Reserved Parking',
  'Private Garden',
  'Jogging Track',
  'Solar Water Heating',
  'Rainwater Harvesting',
  'Cafeteria'
];

const AddEditProperty = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'Apartment',
    purpose: 'Buy',
    price: '',
    location: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    area_sqft: '',
    bedrooms: 2,
    bathrooms: 2,
    furnishing: 'Furnished',
    parking: 'Covered',
  });

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchProperty = async () => {
        try {
          setLoadingInitial(true);
          const res = await api.get(`/api/properties/${id}`);
          if (res.data.success) {
            const p = res.data.property;
            setFormData({
              title: p.title || '',
              description: p.description || '',
              property_type: p.property_type || 'Apartment',
              purpose: p.purpose || 'Buy',
              price: p.price || '',
              location: p.location || '',
              city: p.city || 'Ahmedabad',
              state: p.state || 'Gujarat',
              area_sqft: p.area_sqft || '',
              bedrooms: p.bedrooms || 1,
              bathrooms: p.bathrooms || 1,
              furnishing: p.furnishing || 'Unfurnished',
              parking: p.parking || 'Open',
            });
            setSelectedAmenities(p.amenities || []);
            const existingImages = p.images?.map(img => img.image_url) || [];
            setImages(existingImages);
          }
        } catch (error) {
          showToast(error.response?.data?.message || 'Error fetching property details', 'error');
        } finally {
          setLoadingInitial(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditing, showToast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/api/properties/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        showToast('Image uploaded successfully', 'success');
        setImages((prev) => [...prev, res.data.image_url]);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.location || !formData.area_sqft) {
      showToast('Please fill in all mandatory property fields', 'warning');
      return;
    }

    if (images.length === 0) {
      showToast('Please upload or provide at least one property image', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        area_sqft: parseFloat(formData.area_sqft),
        bedrooms: parseInt(formData.bedrooms, 10),
        bathrooms: parseInt(formData.bathrooms, 10),
        amenities: selectedAmenities,
        images: images
      };

      if (isEditing) {
        const res = await api.put(`/api/properties/${id}`, payload);
        if (res.data.success) {
          showToast('Property updated successfully!', 'success');
          navigate('/agent/properties');
        }
      } else {
        const res = await api.post('/api/properties', payload);
        if (res.data.success) {
          showToast('Property submitted! It is now pending admin review.', 'success');
          navigate('/agent/properties');
        }
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save property', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />
        <main className="dashboard-content">
          <LoadingSpinner message="Loading property details..." />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/agent/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <ArrowLeft size={15} />
            <span>Back to Listings</span>
          </Link>
          <h1 className="page-title">{isEditing ? 'Edit Property Listing' : 'Add New Property Listing'}</h1>
          <p className="page-subtitle">
            {isEditing 
              ? 'Update the specifications and images for your property listing.' 
              : 'Submit a new residential or commercial property in Gujarat for administrative approval.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Basic Details Card */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 className="dashboard-section-title">1. Basic Information</h2>

            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input 
                type="text" 
                name="title"
                className="form-control" 
                placeholder="e.g. Luxurious 3 BHK Penthouse with Terrace Garden"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea 
                name="description"
                className="form-control" 
                rows={5}
                placeholder="Describe layout, interior finishes, ceiling height, natural lighting, and proximity to landmarks..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <select 
                  name="property_type"
                  className="form-control form-select"
                  value={formData.property_type}
                  onChange={handleChange}
                  required
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Flat">Flat</option>
                  <option value="Villa">Villa</option>
                  <option value="House">Bungalow / House</option>
                  <option value="Office">Corporate Office</option>
                  <option value="Commercial">Commercial Shop</option>
                  <option value="Plot">Plot / Land</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose *</label>
                <select 
                  name="purpose"
                  className="form-control form-select"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                >
                  <option value="Buy">For Sale (Buy)</option>
                  <option value="Rent">For Rent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Price (in ₹ INR) * {formData.purpose === 'Rent' && '(Monthly)'}
                </label>
                <input 
                  type="number" 
                  name="price"
                  className="form-control" 
                  placeholder={formData.purpose === 'Rent' ? 'e.g. 35000' : 'e.g. 18500000'}
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Location Card */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 className="dashboard-section-title">2. Location Details</h2>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <select 
                  name="city"
                  className="form-control form-select"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Gandhinagar">Gandhinagar</option>
                  <option value="Surat">Surat</option>
                  <option value="Vadodara">Vadodara</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input 
                  type="text" 
                  name="state"
                  className="form-control" 
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Area / Locality / Street Address *</label>
                <input 
                  type="text" 
                  name="location"
                  className="form-control" 
                  placeholder="e.g. Judges Bungalow Road, Bodakdev"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Specs & Layout Card */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 className="dashboard-section-title">3. Specifications & Architecture</h2>

            <div className="grid-4">
              <div className="form-group">
                <label className="form-label">Super Built-up Area (Sq.Ft) *</label>
                <input 
                  type="number" 
                  name="area_sqft"
                  className="form-control" 
                  placeholder="e.g. 2450"
                  value={formData.area_sqft}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <select 
                  name="bedrooms"
                  className="form-control form-select"
                  value={formData.bedrooms}
                  onChange={handleChange}
                >
                  <option value={0}>0 (Commercial/Studio)</option>
                  <option value={1}>1 Bedroom</option>
                  <option value={2}>2 Bedrooms</option>
                  <option value={3}>3 Bedrooms</option>
                  <option value={4}>4 Bedrooms</option>
                  <option value={5}>5+ Bedrooms</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <select 
                  name="bathrooms"
                  className="form-control form-select"
                  value={formData.bathrooms}
                  onChange={handleChange}
                >
                  <option value={1}>1 Bathroom</option>
                  <option value={2}>2 Bathrooms</option>
                  <option value={3}>3 Bathrooms</option>
                  <option value={4}>4 Bathrooms</option>
                  <option value={5}>5+ Bathrooms</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Furnishing Status</label>
                <select 
                  name="furnishing"
                  className="form-control form-select"
                  value={formData.furnishing}
                  onChange={handleChange}
                >
                  <option value="Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Parking Facility</label>
                <select 
                  name="parking"
                  className="form-control form-select"
                  value={formData.parking}
                  onChange={handleChange}
                >
                  <option value="Covered">Covered Parking</option>
                  <option value="Open">Open Parking</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Amenities Selection */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 className="dashboard-section-title">4. Society Amenities & Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {availableAmenitiesList.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--brand-blue)' : 'var(--border-light)'}`,
                      backgroundColor: isSelected ? 'var(--brand-blue-light)' : '#ffffff',
                      color: isSelected ? 'var(--brand-blue)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `1.5px solid ${isSelected ? 'var(--brand-blue)' : 'var(--border-hover)'}`,
                      backgroundColor: isSelected ? 'var(--brand-blue)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Property Images Upload */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h2 className="dashboard-section-title">5. Property Photos & Gallery</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Upload local image files or enter external image URLs. First image will be used as the featured cover photo.
            </p>

            {/* Upload File and Add URL Row */}
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <div style={{
                border: '2px dashed var(--border-hover)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)'
              }}>
                <Upload size={28} color="var(--brand-blue)" style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  {uploadingImage ? 'Uploading image...' : 'Upload Image File'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  PNG, JPG, JPEG, WEBP up to 16MB
                </div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <span>Choose Local File</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <label className="form-label">Or Add Image URL (Unsplash / Web):</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={handleAddImageUrl}
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Images Preview Grid */}
            {images.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-navy)' }}>
                  Selected Photos ({images.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        position: 'relative',
                        height: '110px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: idx === 0 ? '2px solid var(--brand-blue)' : '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <img src={img} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {idx === 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(37, 99, 235, 0.9)',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          padding: '0.15rem'
                        }}>
                          Cover Photo
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '22px',
                          height: '22px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(0, 0, 0, 0.65)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove Photo"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/agent/properties" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              <Save size={18} />
              <span>{saving ? 'Saving Property...' : (isEditing ? 'Save Changes' : 'Submit Property for Approval')}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddEditProperty;
