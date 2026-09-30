from datetime import datetime
from extensions import db

class Inquiry(db.Model):
    __tablename__ = 'inquiries'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False, index=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    preferred_time = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='pending', index=True)  # pending, responded, closed
    response_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'buyer_id': self.buyer_id,
            'agent_id': self.agent_id,
            'message': self.message,
            'phone': self.phone,
            'preferred_time': self.preferred_time,
            'status': self.status,
            'response_message': self.response_message,
            'property': {
                'id': self.property.id,
                'title': self.property.title,
                'price': self.property.price,
                'city': self.property.city,
                'location': self.property.location,
                'purpose': self.property.purpose,
                'property_type': self.property.property_type,
                'featured_image': self.property.images[0].image_url if self.property.images else None
            } if self.property else None,
            'buyer': {
                'id': self.buyer.id,
                'full_name': self.buyer.full_name,
                'email': self.buyer.email,
                'phone': self.buyer.phone
            } if self.buyer else None,
            'agent': {
                'id': self.agent.id,
                'full_name': self.agent.full_name,
                'email': self.agent.email,
                'phone': self.agent.phone,
                'agency_name': self.agent.agency_name
            } if self.agent else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
