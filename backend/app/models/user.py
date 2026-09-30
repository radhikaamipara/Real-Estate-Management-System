from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='buyer')  # 'buyer', 'agent', 'admin'
    account_status = db.Column(db.String(20), nullable=False, default='active')  # 'active', 'inactive', 'suspended'
    profile_image = db.Column(db.String(255), nullable=True)
    agency_name = db.Column(db.String(150), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    properties = db.relationship('Property', backref='agent', lazy='dynamic', cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    buyer_inquiries = db.relationship('Inquiry', foreign_keys='Inquiry.buyer_id', backref='buyer', lazy='dynamic')
    agent_inquiries = db.relationship('Inquiry', foreign_keys='Inquiry.agent_id', backref='agent', lazy='dynamic')
    buyer_visits = db.relationship('PropertyVisit', foreign_keys='PropertyVisit.buyer_id', backref='buyer', lazy='dynamic')
    agent_visits = db.relationship('PropertyVisit', foreign_keys='PropertyVisit.agent_id', backref='agent', lazy='dynamic')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'account_status': self.account_status,
            'profile_image': self.profile_image,
            'agency_name': self.agency_name,
            'bio': self.bio,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
