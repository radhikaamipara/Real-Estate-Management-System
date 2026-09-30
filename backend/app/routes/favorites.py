from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from app.models.favorite import Favorite
from app.models.property import Property
from app.models.user import User
from app.middleware.auth import role_required, get_current_user

favorites_bp = Blueprint('favorites', __name__, url_prefix='/api/favorites')

@favorites_bp.route('', methods=['GET'])
@role_required('buyer')
def get_user_favorites():
    current_user = get_current_user()
    
    favorites = Favorite.query.filter_by(user_id=current_user.id).order_by(Favorite.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'favorites': [f.to_dict() for f in favorites]
    }), 200


@favorites_bp.route('/<int:property_id>', methods=['POST'])
@role_required('buyer')
def add_favorite(property_id):
    current_user = get_current_user()
    
    property_obj = Property.query.get(property_id)
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    existing = Favorite.query.filter_by(user_id=current_user.id, property_id=property_id).first()
    if existing:
        return jsonify({'success': True, 'message': 'Property is already in your favorites', 'favorited': True}), 200
        
    favorite = Favorite(user_id=current_user.id, property_id=property_id)
    db.session.add(favorite)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Property added to favorites',
        'favorited': True,
        'favorite': favorite.to_dict()
    }), 201


@favorites_bp.route('/<int:property_id>', methods=['DELETE'])
@role_required('buyer')
def remove_favorite(property_id):
    current_user = get_current_user()
    
    favorite = Favorite.query.filter_by(user_id=current_user.id, property_id=property_id).first()
    if not favorite:
        return jsonify({'success': False, 'message': 'Property not in favorites'}), 404
        
    db.session.delete(favorite)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Property removed from favorites',
        'favorited': False
    }), 200


@favorites_bp.route('/check/<int:property_id>', methods=['GET'])
@jwt_required()
def check_favorite(property_id):
    user_id = int(get_jwt_identity())
    favorite = Favorite.query.filter_by(user_id=user_id, property_id=property_id).first()
    return jsonify({
        'success': True,
        'favorited': favorite is not None
    }), 200
