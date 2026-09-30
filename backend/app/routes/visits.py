from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from app.models.visit import PropertyVisit
from app.models.property import Property
from app.models.user import User
from app.middleware.auth import role_required, get_current_user
from app.utils.helpers import create_notification

visits_bp = Blueprint('visits', __name__, url_prefix='/api/visits')

@visits_bp.route('', methods=['POST'])
@role_required('buyer')
def create_visit():
    current_user = get_current_user()
    data = request.get_json() or {}
    
    property_id = data.get('property_id')
    visit_date = data.get('visit_date', '').strip()
    visit_time = data.get('visit_time', '').strip()
    notes = data.get('notes', '').strip()
    
    if not property_id or not visit_date or not visit_time:
        return jsonify({'success': False, 'message': 'Property ID, visit date, and visit time slot are required'}), 400
        
    property_obj = Property.query.get(property_id)
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    # Prevent duplicate visit requests for same user, property, and time slot
    existing = PropertyVisit.query.filter_by(
        buyer_id=current_user.id,
        property_id=property_id,
        visit_date=visit_date,
        visit_time=visit_time
    ).first()
    
    if existing:
        return jsonify({
            'success': False, 
            'message': 'You already have a visit scheduled for this property at the selected date and time.'
        }), 400
        
    visit = PropertyVisit(
        property_id=property_id,
        buyer_id=current_user.id,
        agent_id=property_obj.agent_id,
        visit_date=visit_date,
        visit_time=visit_time,
        notes=notes,
        status='pending'
    )
    
    db.session.add(visit)
    db.session.commit()
    
    # Notify agent
    create_notification(
        user_id=property_obj.agent_id,
        title='New Visit Requested',
        message=f"{current_user.full_name} requested a site visit for '{property_obj.title}' on {visit_date} at {visit_time}.",
        link='/agent/visits',
        notif_type='visit'
    )
    
    return jsonify({
        'success': True,
        'message': 'Visit request scheduled! Awaiting agent confirmation.',
        'visit': visit.to_dict()
    }), 201


@visits_bp.route('/buyer', methods=['GET'])
@role_required('buyer')
def get_buyer_visits():
    current_user = get_current_user()
    visits = PropertyVisit.query.filter_by(buyer_id=current_user.id).order_by(PropertyVisit.visit_date.asc()).all()
    
    return jsonify({
        'success': True,
        'visits': [v.to_dict() for v in visits]
    }), 200


@visits_bp.route('/agent', methods=['GET'])
@role_required('agent')
def get_agent_visits():
    current_user = get_current_user()
    status_filter = request.args.get('status', '').strip()
    
    query = PropertyVisit.query.filter_by(agent_id=current_user.id)
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    visits = query.order_by(PropertyVisit.visit_date.asc()).all()
    
    return jsonify({
        'success': True,
        'visits': [v.to_dict() for v in visits]
    }), 200


@visits_bp.route('/<int:visit_id>/status', methods=['PATCH'])
@role_required('agent', 'admin', 'buyer')
def update_visit_status(visit_id):
    current_user = get_current_user()
    visit = PropertyVisit.query.get(visit_id)
    
    if not visit:
        return jsonify({'success': False, 'message': 'Visit request not found'}), 404
        
    data = request.get_json() or {}
    new_status = data.get('status')
    agent_notes = data.get('agent_notes', '').strip()
    
    allowed_statuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled']
    if new_status not in allowed_statuses:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400
        
    # Permission checks:
    # Buyer can only cancel their own visit
    if current_user.role == 'buyer':
        if visit.buyer_id != current_user.id:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        if new_status != 'cancelled':
            return jsonify({'success': False, 'message': 'Buyers can only cancel their visits'}), 403
            
    # Agent can confirm, reject, complete, or cancel
    if current_user.role == 'agent':
        if visit.agent_id != current_user.id:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
            
    visit.status = new_status
    if agent_notes:
        visit.agent_notes = agent_notes
        
    db.session.commit()
    
    # Notify counterparty
    if current_user.role in ['agent', 'admin']:
        create_notification(
            user_id=visit.buyer_id,
            title=f'Visit {new_status.capitalize()}',
            message=f"Your visit request for '{visit.property.title}' on {visit.visit_date} was {new_status}.",
            link='/buyer/visits',
            notif_type='visit'
        )
    elif current_user.role == 'buyer':
        create_notification(
            user_id=visit.agent_id,
            title='Visit Cancelled by Buyer',
            message=f"{current_user.full_name} cancelled their scheduled visit for '{visit.property.title}'.",
            link='/agent/visits',
            notif_type='visit'
        )
        
    return jsonify({
        'success': True,
        'message': f'Visit status updated to {new_status}',
        'visit': visit.to_dict()
    }), 200
