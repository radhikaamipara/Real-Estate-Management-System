from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from app.models.user import User
from app.middleware.auth import role_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'buyer').strip().lower()
    agency_name = data.get('agency_name', '').strip() if role == 'agent' else None
    
    # Validation
    if not full_name or not email or not password:
        return jsonify({'success': False, 'message': 'Full name, email, and password are required'}), 400
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long'}), 400
        
    if role not in ['buyer', 'agent']:
        return jsonify({'success': False, 'message': 'Invalid role. Choose Buyer or Agent'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'An account with this email already exists'}), 409
        
    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        role=role,
        agency_name=agency_name,
        account_status='active'
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    # Create JWT token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': f'Account created successfully as {role.capitalize()}',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
        
    if user.account_status != 'active':
        return jsonify({
            'success': False, 
            'message': f'Your account is {user.account_status}. Please contact an administrator.'
        }), 403
        
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': 'Logged in successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    user_data = user.to_dict()
    
    # Add quick summary metrics based on role
    if user.role == 'buyer':
        user_data['favorites_count'] = user.favorites.count()
        user_data['inquiries_count'] = user.buyer_inquiries.count()
        user_data['visits_count'] = user.buyer_visits.count()
    elif user.role == 'agent':
        user_data['properties_count'] = user.properties.count()
        user_data['inquiries_count'] = user.agent_inquiries.count()
        user_data['visits_count'] = user.agent_visits.count()
        
    return jsonify({'success': True, 'user': user_data}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    data = request.get_json() or {}
    
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
        
    if 'phone' in data:
        user.phone = data['phone'].strip()
        
    if 'agency_name' in data and user.role == 'agent':
        user.agency_name = data['agency_name'].strip()
        
    if 'bio' in data:
        user.bio = data['bio'].strip()
        
    if 'profile_image' in data:
        user.profile_image = data['profile_image']
        
    # Password update
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    if new_password:
        if not current_password or not user.check_password(current_password):
            return jsonify({'success': False, 'message': 'Current password is incorrect'}), 400
        if len(new_password) < 6:
            return jsonify({'success': False, 'message': 'New password must be at least 6 characters'}), 400
        user.set_password(new_password)
        
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200
