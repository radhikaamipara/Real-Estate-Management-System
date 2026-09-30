from flask import Blueprint, request, jsonify
from extensions import db
from app.models.contact import ContactMessage
from app.middleware.auth import role_required

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')

@contact_bp.route('', methods=['POST'])
def submit_contact_message():
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()
    
    if not name or not email or not subject or not message:
        return jsonify({'success': False, 'message': 'Name, email, subject, and message are required'}), 400
        
    contact_msg = ContactMessage(
        name=name,
        email=email,
        phone=phone,
        subject=subject,
        message=message
    )
    
    db.session.add(contact_msg)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Thank you! Your message has been sent successfully. Our team will contact you shortly.'
    }), 201


@contact_bp.route('/messages', methods=['GET'])
@role_required('admin')
def get_contact_messages():
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify({
        'success': True,
        'messages': [m.to_dict() for m in messages]
    }), 200
