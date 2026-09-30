import json
from datetime import datetime
from extensions import db

class Property(db.Model):
    __tablename__ = 'properties'

    id = db.Column(db.Integer, primary_key=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    property_type = db.Column(db.String(50), nullable=False, index=True)  # Apartment, Flat, House, Villa, Plot, Commercial, Office
    purpose = db.Column(db.String(20), nullable=False, index=True)        # Buy, Rent
    price = db.Column(db.Float, nullable=False, index=True)
    location = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    state = db.Column(db.String(100), nullable=False, default='Gujarat')
    area_sqft = db.Column(db.Float, nullable=False)
    bedrooms = db.Column(db.Integer, nullable=False, default=1)
    bathrooms = db.Column(db.Integer, nullable=False, default=1)
    furnishing = db.Column(db.String(50), nullable=False, default='Unfurnished')  # Furnished, Semi-Furnished, Unfurnished
    parking = db.Column(db.String(50), nullable=False, default='Open')            # Yes, No, Covered, Open
    amenities = db.Column(db.Text, nullable=True, default='[]')                   # JSON list string
    listing_status = db.Column(db.String(20), nullable=False, default='pending', index=True)  # pending, approved, rejected
    availability_status = db.Column(db.String(20), nullable=False, default='available', index=True)  # available, reserved, sold, rented
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    images = db.relationship('PropertyImage', backref='property', lazy='joined', cascade='all, delete-orphan')
    inquiries = db.relationship('Inquiry', backref='property', lazy='dynamic', cascade='all, delete-orphan')
    visits = db.relationship('PropertyVisit', backref='property', lazy='dynamic', cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='property', lazy='dynamic', cascade='all, delete-orphan')
    transactions = db.relationship('PropertyTransaction', backref='property', lazy='dynamic')

    def get_amenities_list(self):
        try:
            return json.loads(self.amenities) if self.amenities else []
        except (ValueError, TypeError):
            return []

    def set_amenities_list(self, amenities_list):
        self.amenities = json.dumps(amenities_list) if amenities_list else '[]'

    def to_dict(self, include_agent=True, current_user_id=None):
        images_list = [img.to_dict() for img in self.images]
        featured_image = next((img['image_url'] for img in images_list if img['is_featured']), None)
        if not featured_image and images_list:
            featured_image = images_list[0]['image_url']

        is_favorited = False
        if current_user_id:
            from app.models.favorite import Favorite
            is_favorited = Favorite.query.filter_by(user_id=current_user_id, property_id=self.id).first() is not None

        data = {
            'id': self.id,
            'agent_id': self.agent_id,
            'title': self.title,
            'description': self.description,
            'property_type': self.property_type,
            'purpose': self.purpose,
            'price': self.price,
            'location': self.location,
            'city': self.city,
            'state': self.state,
            'area_sqft': self.area_sqft,
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'furnishing': self.furnishing,
            'parking': self.parking,
            'amenities': self.get_amenities_list(),
            'listing_status': self.listing_status,
            'availability_status': self.availability_status,
            'rejection_reason': self.rejection_reason,
            'images': images_list,
            'featured_image': featured_image,
            'is_favorited': is_favorited,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_agent and self.agent:
            data['agent'] = {
                'id': self.agent.id,
                'full_name': self.agent.full_name,
                'email': self.agent.email,
                'phone': self.agent.phone,
                'agency_name': self.agent.agency_name,
                'profile_image': self.agent.profile_image
            }

        return data


class PropertyImage(db.Model):
    __tablename__ = 'property_images'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False, index=True)
    image_url = db.Column(db.String(500), nullable=False)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'image_url': self.image_url,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
