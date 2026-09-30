from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def role_required(*allowed_roles):
    """
    Decorator to protect routes and enforce role-based access.
    Allowed roles can be 'buyer', 'agent', 'admin'.
    Also checks if the user's account is active.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 404
            
            if user.account_status != 'active':
                return jsonify({
                    'success': False, 
                    'message': f'Your account is currently {user.account_status}. Please contact administrator.'
                }), 403
            
            if allowed_roles and user.role not in allowed_roles:
                return jsonify({
                    'success': False, 
                    'message': f'Access forbidden: requires one of {list(allowed_roles)} roles'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user():
    """Helper function to get current authenticated user object."""
    try:
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
        return User.query.get(user_id)
    except Exception:
        return None
