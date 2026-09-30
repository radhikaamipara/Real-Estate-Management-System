from app.routes.auth import auth_bp
from app.routes.properties import properties_bp
from app.routes.favorites import favorites_bp
from app.routes.inquiries import inquiries_bp
from app.routes.visits import visits_bp
from app.routes.notifications import notifications_bp
from app.routes.admin import admin_bp
from app.routes.contact import contact_bp

__all__ = [
    'auth_bp',
    'properties_bp',
    'favorites_bp',
    'inquiries_bp',
    'visits_bp',
    'notifications_bp',
    'admin_bp',
    'contact_bp'
]
