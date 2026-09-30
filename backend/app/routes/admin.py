from flask import Blueprint, request, jsonify
from sqlalchemy import func
from extensions import db
from app.models.user import User
from app.models.property import Property
from app.models.inquiry import Inquiry
from app.models.visit import PropertyVisit
from app.models.transaction import PropertyTransaction
from app.middleware.auth import role_required, get_current_user
from app.utils.helpers import create_notification

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@role_required('admin')
def get_dashboard_stats():
    total_users = User.query.count()
    total_buyers = User.query.filter_by(role='buyer').count()
    total_agents = User.query.filter_by(role='agent').count()
    
    total_properties = Property.query.count()
    pending_properties = Property.query.filter_by(listing_status='pending').count()
    approved_properties = Property.query.filter_by(listing_status='approved').count()
    rejected_properties = Property.query.filter_by(listing_status='rejected').count()
    
    total_inquiries = Inquiry.query.count()
    pending_inquiries = Inquiry.query.filter_by(status='pending').count()
    
    total_visits = PropertyVisit.query.count()
    pending_visits = PropertyVisit.query.filter_by(status='pending').count()
    
    total_transactions = PropertyTransaction.query.count()
    total_transaction_volume = db.session.query(func.sum(PropertyTransaction.amount)).scalar() or 0.0
    
    # Recent activities
    recent_properties = Property.query.order_by(Property.created_at.desc()).limit(5).all()
    recent_transactions = PropertyTransaction.query.order_by(PropertyTransaction.created_at.desc()).limit(5).all()
    recent_inquiries = Inquiry.query.order_by(Inquiry.created_at.desc()).limit(5).all()
    
    return jsonify({
        'success': True,
        'stats': {
            'total_users': total_users,
            'total_buyers': total_buyers,
            'total_agents': total_agents,
            'total_properties': total_properties,
            'pending_properties': pending_properties,
            'approved_properties': approved_properties,
            'rejected_properties': rejected_properties,
            'total_inquiries': total_inquiries,
            'pending_inquiries': pending_inquiries,
            'total_visits': total_visits,
            'pending_visits': pending_visits,
            'total_transactions': total_transactions,
            'total_transaction_volume': total_transaction_volume
        },
        'recent_properties': [p.to_dict(include_agent=True) for p in recent_properties],
        'recent_transactions': [t.to_dict() for t in recent_transactions],
        'recent_inquiries': [i.to_dict() for i in recent_inquiries]
    }), 200


@admin_bp.route('/users', methods=['GET'])
@role_required('admin')
def get_users():
    role_filter = request.args.get('role', '').strip()
    status_filter = request.args.get('status', '').strip()
    search = request.args.get('search', '').strip()
    
    query = User.query
    
    if role_filter:
        query = query.filter_by(role=role_filter)
    if status_filter:
        query = query.filter_by(account_status=status_filter)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_filter)) |
            (User.email.ilike(search_filter)) |
            (User.phone.ilike(search_filter))
        )
        
    users = query.order_by(User.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users]
    }), 200


@admin_bp.route('/users/<int:user_id>/status', methods=['PATCH'])
@role_required('admin')
def update_user_status(user_id):
    current_user = get_current_user()
    if current_user.id == user_id:
        return jsonify({'success': False, 'message': 'Admin cannot modify their own account status'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    data = request.get_json() or {}
    new_status = data.get('status')
    
    if new_status not in ['active', 'inactive', 'suspended']:
        return jsonify({'success': False, 'message': 'Invalid status. Allowed: active, inactive, suspended'}), 400
        
    user.account_status = new_status
    db.session.commit()
    
    # Notify user
    create_notification(
        user_id=user.id,
        title='Account Status Updated',
        message=f"Your account status has been updated to '{new_status}' by administrator.",
        link='/profile',
        notif_type='system'
    )
    
    return jsonify({
        'success': True,
        'message': f"User account updated to {new_status}",
        'user': user.to_dict()
    }), 200


@admin_bp.route('/properties', methods=['GET'])
@role_required('admin')
def get_all_properties():
    status = request.args.get('status', '').strip()
    city = request.args.get('city', '').strip()
    search = request.args.get('search', '').strip()
    
    query = Property.query
    
    if status:
        query = query.filter_by(listing_status=status)
    if city:
        query = query.filter_by(city=city)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Property.title.ilike(search_filter)) |
            (Property.location.ilike(search_filter))
        )
        
    properties = query.order_by(Property.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'properties': [p.to_dict(include_agent=True) for p in properties]
    }), 200


@admin_bp.route('/properties/<int:property_id>/approve', methods=['PATCH'])
@role_required('admin')
def approve_property(property_id):
    property_obj = Property.query.get(property_id)
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    property_obj.listing_status = 'approved'
    property_obj.rejection_reason = None
    db.session.commit()
    
    # Notify agent
    create_notification(
        user_id=property_obj.agent_id,
        title='Property Approved!',
        message=f"Your listing '{property_obj.title}' was approved by admin and is now live to buyers!",
        link=f'/properties/{property_obj.id}',
        notif_type='listing'
    )
    
    return jsonify({
        'success': True,
        'message': 'Property approved successfully',
        'property': property_obj.to_dict(include_agent=True)
    }), 200


@admin_bp.route('/properties/<int:property_id>/reject', methods=['PATCH'])
@role_required('admin')
def reject_property(property_id):
    property_obj = Property.query.get(property_id)
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    data = request.get_json() or {}
    reason = data.get('reason', 'Listing details do not meet platform guidelines.').strip()
    
    property_obj.listing_status = 'rejected'
    property_obj.rejection_reason = reason
    db.session.commit()
    
    # Notify agent
    create_notification(
        user_id=property_obj.agent_id,
        title='Property Rejected',
        message=f"Your listing '{property_obj.title}' was rejected. Reason: {reason}",
        link='/agent/properties',
        notif_type='listing'
    )
    
    return jsonify({
        'success': True,
        'message': 'Property rejected',
        'property': property_obj.to_dict(include_agent=True)
    }), 200


@admin_bp.route('/inquiries', methods=['GET'])
@role_required('admin')
def get_all_inquiries():
    inquiries = Inquiry.query.order_by(Inquiry.created_at.desc()).all()
    return jsonify({
        'success': True,
        'inquiries': [i.to_dict() for i in inquiries]
    }), 200


@admin_bp.route('/visits', methods=['GET'])
@role_required('admin')
def get_all_visits():
    visits = PropertyVisit.query.order_by(PropertyVisit.visit_date.desc()).all()
    return jsonify({
        'success': True,
        'visits': [v.to_dict() for v in visits]
    }), 200


@admin_bp.route('/reports', methods=['GET'])
@role_required('admin')
def get_reports():
    # Properties by city
    cities_query = db.session.query(
        Property.city, func.count(Property.id)
    ).group_by(Property.city).all()
    properties_by_city = [{'city': c[0], 'count': c[1]} for c in cities_query]
    
    # Properties by type
    types_query = db.session.query(
        Property.property_type, func.count(Property.id)
    ).group_by(Property.property_type).all()
    properties_by_type = [{'type': t[0], 'count': t[1]} for t in types_query]
    
    # Purpose breakdown
    purpose_query = db.session.query(
        Property.purpose, func.count(Property.id)
    ).group_by(Property.purpose).all()
    purpose_breakdown = [{'purpose': p[0], 'count': p[1]} for p in purpose_query]
    
    # Inquiries status
    inquiries_status_query = db.session.query(
        Inquiry.status, func.count(Inquiry.id)
    ).group_by(Inquiry.status).all()
    inquiries_by_status = [{'status': s[0], 'count': s[1]} for s in inquiries_status_query]
    
    # Visits status
    visits_status_query = db.session.query(
        PropertyVisit.status, func.count(PropertyVisit.id)
    ).group_by(PropertyVisit.status).all()
    visits_by_status = [{'status': s[0], 'count': s[1]} for s in visits_status_query]
    
    # Transactions log
    transactions = PropertyTransaction.query.order_by(PropertyTransaction.created_at.desc()).limit(20).all()
    
    return jsonify({
        'success': True,
        'reports': {
            'properties_by_city': properties_by_city,
            'properties_by_type': properties_by_type,
            'purpose_breakdown': purpose_breakdown,
            'inquiries_by_status': inquiries_by_status,
            'visits_by_status': visits_by_status,
            'transactions': [t.to_dict() for t in transactions]
        }
    }), 200
