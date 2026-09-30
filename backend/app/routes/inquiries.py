from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from app.models.inquiry import Inquiry
from app.models.property import Property
from app.models.user import User
from app.middleware.auth import role_required, get_current_user
from app.utils.helpers import create_notification

inquiries_bp = Blueprint('inquiries', __name__, url_prefix='/api/inquiries')

@inquiries_bp.route('', methods=['POST'])
@role_required('buyer')
def create_inquiry():
    current_user = get_current_user()
    data = request.get_json() or {}
    
    property_id = data.get('property_id')
    message = data.get('message', '').strip()
    phone = data.get('phone', current_user.phone or '').strip()
    preferred_time = data.get('preferred_time', '').strip()
    
    if not property_id or not message:
        return jsonify({'success': False, 'message': 'Property ID and inquiry message are required'}), 400
        
    property_obj = Property.query.get(property_id)
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    # Check if buyer already sent an active pending inquiry for this property
    existing = Inquiry.query.filter_by(
        buyer_id=current_user.id, 
        property_id=property_id, 
        status='pending'
    ).first()
    if existing:
        return jsonify({
            'success': False, 
            'message': 'You already have a pending inquiry for this property. The agent will contact you soon.'
        }), 400
        
    inquiry = Inquiry(
        property_id=property_id,
        buyer_id=current_user.id,
        agent_id=property_obj.agent_id,
        message=message,
        phone=phone,
        preferred_time=preferred_time,
        status='pending'
    )
    
    db.session.add(inquiry)
    db.session.commit()
    
    # Notify agent
    create_notification(
        user_id=property_obj.agent_id,
        title='New Inquiry Received',
        message=f"{current_user.full_name} inquired about '{property_obj.title}'.",
        link='/agent/inquiries',
        notif_type='inquiry'
    )
    
    return jsonify({
        'success': True,
        'message': 'Inquiry submitted successfully! The agent has been notified.',
        'inquiry': inquiry.to_dict()
    }), 201


@inquiries_bp.route('/buyer', methods=['GET'])
@role_required('buyer')
def get_buyer_inquiries():
    current_user = get_current_user()
    inquiries = Inquiry.query.filter_by(buyer_id=current_user.id).order_by(Inquiry.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'inquiries': [i.to_dict() for i in inquiries]
    }), 200


@inquiries_bp.route('/agent', methods=['GET'])
@role_required('agent')
def get_agent_inquiries():
    current_user = get_current_user()
    status_filter = request.args.get('status', '').strip()
    
    query = Inquiry.query.filter_by(agent_id=current_user.id)
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    inquiries = query.order_by(Inquiry.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'inquiries': [i.to_dict() for i in inquiries]
    }), 200


@inquiries_bp.route('/<int:inquiry_id>', methods=['GET'])
@jwt_required()
def get_inquiry(inquiry_id):
    current_user = get_current_user()
    inquiry = Inquiry.query.get(inquiry_id)
    
    if not inquiry:
        return jsonify({'success': False, 'message': 'Inquiry not found'}), 404
        
    # Check authorization
    if current_user.role != 'admin' and inquiry.buyer_id != current_user.id and inquiry.agent_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized to view this inquiry'}), 403
        
    return jsonify({'success': True, 'inquiry': inquiry.to_dict()}), 200


@inquiries_bp.route('/<int:inquiry_id>/status', methods=['PATCH'])
@role_required('agent', 'admin')
def update_inquiry_status(inquiry_id):
    current_user = get_current_user()
    inquiry = Inquiry.query.get(inquiry_id)
    
    if not inquiry:
        return jsonify({'success': False, 'message': 'Inquiry not found'}), 404
        
    if current_user.role != 'admin' and inquiry.agent_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
    data = request.get_json() or {}
    status = data.get('status')
    response_message = data.get('response_message', '').strip()
    
    if status and status not in ['pending', 'responded', 'closed']:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400
        
    if status:
        inquiry.status = status
    if response_message:
        inquiry.response_message = response_message
        if not status:
            inquiry.status = 'responded'
            
    db.session.commit()
    
    # Notify buyer
    create_notification(
        user_id=inquiry.buyer_id,
        title='Response to Your Property Inquiry',
        message=f"Agent {inquiry.agent.full_name} updated your inquiry on '{inquiry.property.title}'.",
        link='/buyer/inquiries',
        notif_type='inquiry'
    )
    
    return jsonify({
        'success': True,
        'message': 'Inquiry updated successfully',
        'inquiry': inquiry.to_dict()
    }), 200
