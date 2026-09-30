from datetime import datetime
from extensions import db

class PropertyVisit(db.Model):
    __tablename__ = 'property_visits'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False, index=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    visit_date = db.Column(db.String(20), nullable=False)   # YYYY-MM-DD
    visit_time = db.Column(db.String(50), nullable=False)   # e.g. "10:00 AM - 11:00 AM"
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='pending', index=True)  # pending, confirmed, rejected, completed, cancelled
    agent_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('buyer_id', 'property_id', 'visit_date', 'visit_time', name='uq_buyer_property_visit_slot'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'buyer_id': self.buyer_id,
            'agent_id': self.agent_id,
            'visit_date': self.visit_date,
            'visit_time': self.visit_time,
            'notes': self.notes,
            'status': self.status,
            'agent_notes': self.agent_notes,
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
