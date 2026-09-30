from datetime import datetime
from extensions import db

class PropertyTransaction(db.Model):
    __tablename__ = 'property_transactions'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False, index=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    transaction_type = db.Column(db.String(20), nullable=False)  # sold, rented, reserved
    amount = db.Column(db.Float, nullable=False)
    transaction_date = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to user
    agent = db.relationship('User', foreign_keys=[agent_id])
    buyer = db.relationship('User', foreign_keys=[buyer_id])

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'property_title': self.property.title if self.property else 'Unknown Property',
            'agent_id': self.agent_id,
            'agent_name': self.agent.full_name if self.agent else None,
            'buyer_id': self.buyer_id,
            'buyer_name': self.buyer.full_name if self.buyer else None,
            'transaction_type': self.transaction_type,
            'amount': self.amount,
            'transaction_date': self.transaction_date,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
