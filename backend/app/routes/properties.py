import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from extensions import db
from app.models.property import Property, PropertyImage
from app.models.user import User
from app.models.transaction import PropertyTransaction
from app.middleware.auth import role_required, get_current_user
from app.utils.helpers import save_upload_file, create_notification

properties_bp = Blueprint('properties', __name__, url_prefix='/api/properties')

def get_optional_user_id():
    try:
        verify_jwt_in_request(optional=True)
        ident = get_jwt_identity()
        return int(ident) if ident is not None else None
    except Exception:
        return None

@properties_bp.route('', methods=['GET'])
def get_properties():
    user_id = get_optional_user_id()
    
    # Query parameters
    search = request.args.get('search', '').strip()
    purpose = request.args.get('purpose', '').strip()
    property_type = request.args.get('property_type', '').strip()
    city = request.args.get('city', '').strip()
    location = request.args.get('location', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    bedrooms = request.args.get('bedrooms', type=int)
    bathrooms = request.args.get('bathrooms', type=int)
    furnishing = request.args.get('furnishing', '').strip()
    parking = request.args.get('parking', '').strip()
    sort_by = request.args.get('sort', 'newest').strip()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 12, type=int)
    
    # Public listings must be approved and available (unless specified otherwise)
    query = Property.query.filter_by(listing_status='approved')
    
    availability = request.args.get('availability', 'available').strip()
    if availability and availability != 'all':
        query = query.filter_by(availability_status=availability)
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Property.title.ilike(search_filter)) |
            (Property.description.ilike(search_filter)) |
            (Property.location.ilike(search_filter)) |
            (Property.city.ilike(search_filter))
        )
        
    if purpose:
        query = query.filter(Property.purpose.ilike(purpose))
        
    if property_type:
        query = query.filter(Property.property_type.ilike(property_type))
        
    if city:
        query = query.filter(Property.city.ilike(city))
        
    if location:
        query = query.filter(Property.location.ilike(f"%{location}%"))
        
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
        
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
        
    if bedrooms is not None and bedrooms > 0:
        if bedrooms >= 4:
            query = query.filter(Property.bedrooms >= 4)
        else:
            query = query.filter(Property.bedrooms == bedrooms)
            
    if bathrooms is not None and bathrooms > 0:
        query = query.filter(Property.bathrooms >= bathrooms)
        
    if furnishing:
        query = query.filter(Property.furnishing.ilike(furnishing))
        
    if parking:
        query = query.filter(Property.parking.ilike(parking))
        
    # Sorting
    if sort_by == 'price_asc':
        query = query.order_by(Property.price.asc())
    elif sort_by == 'price_desc':
        query = query.order_by(Property.price.desc())
    elif sort_by == 'area_desc':
        query = query.order_by(Property.area_sqft.desc())
    else:  # newest
        query = query.order_by(Property.created_at.desc())
        
    # Pagination
    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    
    properties_list = [p.to_dict(include_agent=True, current_user_id=user_id) for p in pagination.items]
    
    return jsonify({
        'success': True,
        'properties': properties_list,
        'pagination': {
            'page': pagination.page,
            'pages': pagination.pages,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'has_prev': pagination.has_prev,
            'has_next': pagination.has_next
        }
    }), 200


@properties_bp.route('/featured', methods=['GET'])
def get_featured_properties():
    user_id = get_optional_user_id()
    limit = request.args.get('limit', 6, type=int)
    
    properties = Property.query.filter_by(
        listing_status='approved', 
        availability_status='available'
    ).order_by(Property.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'success': True,
        'properties': [p.to_dict(include_agent=True, current_user_id=user_id) for p in properties]
    }), 200


@properties_bp.route('/<int:property_id>', methods=['GET'])
def get_property_details(property_id):
    user_id = get_optional_user_id()
    property_obj = Property.query.get(property_id)
    
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    # If not approved, only agent owner or admin can view
    if property_obj.listing_status != 'approved':
        user = User.query.get(user_id) if user_id else None
        if not user or (user.role != 'admin' and user.id != property_obj.agent_id):
            return jsonify({'success': False, 'message': 'Property listing is pending review'}), 403
            
    # Fetch similar properties in same city or property type
    similar_properties = Property.query.filter(
        Property.id != property_obj.id,
        Property.listing_status == 'approved',
        Property.availability_status == 'available',
        (Property.city == property_obj.city) | (Property.property_type == property_obj.property_type)
    ).limit(3).all()
    
    property_dict = property_obj.to_dict(include_agent=True, current_user_id=user_id)
    property_dict['similar'] = [p.to_dict(include_agent=False) for p in similar_properties]
    
    return jsonify({
        'success': True,
        'property': property_dict
    }), 200


@properties_bp.route('', methods=['POST'])
@role_required('agent')
def create_property():
    current_user = get_current_user()
    data = request.get_json() or {}
    
    required_fields = ['title', 'description', 'property_type', 'purpose', 'price', 'location', 'city', 'area_sqft']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'message': f'{field.replace("_", " ").capitalize()} is required'}), 400
            
    new_property = Property(
        agent_id=current_user.id,
        title=data.get('title').strip(),
        description=data.get('description').strip(),
        property_type=data.get('property_type').strip(),
        purpose=data.get('purpose').strip(),
        price=float(data.get('price')),
        location=data.get('location').strip(),
        city=data.get('city').strip(),
        state=data.get('state', 'Gujarat').strip(),
        area_sqft=float(data.get('area_sqft')),
        bedrooms=int(data.get('bedrooms', 1)),
        bathrooms=int(data.get('bathrooms', 1)),
        furnishing=data.get('furnishing', 'Unfurnished').strip(),
        parking=data.get('parking', 'Open').strip(),
        listing_status='pending',  # Awaiting Admin Approval
        availability_status='available'
    )
    
    if 'amenities' in data and isinstance(data['amenities'], list):
        new_property.set_amenities_list(data['amenities'])
        
    db.session.add(new_property)
    db.session.flush()  # assign ID
    
    # Handle image URLs
    images = data.get('images', [])
    if isinstance(images, list):
        for index, img_url in enumerate(images):
            if isinstance(img_url, str) and img_url.strip():
                is_featured = (index == 0)
                img = PropertyImage(
                    property_id=new_property.id,
                    image_url=img_url.strip(),
                    is_featured=is_featured
                )
                db.session.add(img)
                
    db.session.commit()
    
    # Notify admin about new listing
    admin_users = User.query.filter_by(role='admin').all()
    for admin in admin_users:
        create_notification(
            user_id=admin.id,
            title='New Property Submitted',
            message=f"Agent {current_user.full_name} submitted '{new_property.title}' for review.",
            link=f'/admin/properties',
            notif_type='listing'
        )
        
    return jsonify({
        'success': True,
        'message': 'Property submitted successfully! It is now pending admin approval.',
        'property': new_property.to_dict()
    }), 201


@properties_bp.route('/<int:property_id>', methods=['PUT'])
@role_required('agent', 'admin')
def update_property(property_id):
    current_user = get_current_user()
    property_obj = Property.query.get(property_id)
    
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    if current_user.role != 'admin' and property_obj.agent_id != current_user.id:
        return jsonify({'success': False, 'message': 'You can only edit your own listings'}), 403
        
    data = request.get_json() or {}
    
    if 'title' in data:
        property_obj.title = data['title'].strip()
    if 'description' in data:
        property_obj.description = data['description'].strip()
    if 'property_type' in data:
        property_obj.property_type = data['property_type'].strip()
    if 'purpose' in data:
        property_obj.purpose = data['purpose'].strip()
    if 'price' in data:
        property_obj.price = float(data['price'])
    if 'location' in data:
        property_obj.location = data['location'].strip()
    if 'city' in data:
        property_obj.city = data['city'].strip()
    if 'state' in data:
        property_obj.state = data['state'].strip()
    if 'area_sqft' in data:
        property_obj.area_sqft = float(data['area_sqft'])
    if 'bedrooms' in data:
        property_obj.bedrooms = int(data['bedrooms'])
    if 'bathrooms' in data:
        property_obj.bathrooms = int(data['bathrooms'])
    if 'furnishing' in data:
        property_obj.furnishing = data['furnishing'].strip()
    if 'parking' in data:
        property_obj.parking = data['parking'].strip()
    if 'amenities' in data and isinstance(data['amenities'], list):
        property_obj.set_amenities_list(data['amenities'])
    if 'availability_status' in data:
        property_obj.availability_status = data['availability_status'].strip()
        
    # If previously rejected, editing re-submits for approval
    if current_user.role == 'agent' and property_obj.listing_status == 'rejected':
        property_obj.listing_status = 'pending'
        property_obj.rejection_reason = None
        
    # Update images if provided
    if 'images' in data and isinstance(data['images'], list):
        # Remove old images
        PropertyImage.query.filter_by(property_id=property_obj.id).delete()
        for index, img_url in enumerate(data['images']):
            if isinstance(img_url, str) and img_url.strip():
                img = PropertyImage(
                    property_id=property_obj.id,
                    image_url=img_url.strip(),
                    is_featured=(index == 0)
                )
                db.session.add(img)
                
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Property updated successfully',
        'property': property_obj.to_dict()
    }), 200


@properties_bp.route('/<int:property_id>', methods=['DELETE'])
@role_required('agent', 'admin')
def delete_property(property_id):
    current_user = get_current_user()
    property_obj = Property.query.get(property_id)
    
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    if current_user.role != 'admin' and property_obj.agent_id != current_user.id:
        return jsonify({'success': False, 'message': 'You can only delete your own listings'}), 403
        
    db.session.delete(property_obj)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Property deleted successfully'}), 200


@properties_bp.route('/<int:property_id>/availability', methods=['PATCH'])
@role_required('agent', 'admin')
def update_availability(property_id):
    current_user = get_current_user()
    property_obj = Property.query.get(property_id)
    
    if not property_obj:
        return jsonify({'success': False, 'message': 'Property not found'}), 404
        
    if current_user.role != 'admin' and property_obj.agent_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
    data = request.get_json() or {}
    new_status = data.get('availability_status')
    
    if new_status not in ['available', 'reserved', 'sold', 'rented']:
        return jsonify({'success': False, 'message': 'Invalid availability status'}), 400
        
    old_status = property_obj.availability_status
    property_obj.availability_status = new_status
    
    # Record transaction if sold or rented
    if new_status in ['sold', 'rented', 'reserved'] and old_status != new_status:
        transaction = PropertyTransaction(
            property_id=property_obj.id,
            agent_id=property_obj.agent_id,
            buyer_id=data.get('buyer_id'),
            transaction_type=new_status,
            amount=data.get('amount', property_obj.price),
            transaction_date=datetime.utcnow().strftime('%Y-%m-%d'),
            notes=data.get('notes', f'Property marked as {new_status}')
        )
        db.session.add(transaction)
        
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Property availability updated to {new_status.capitalize()}',
        'property': property_obj.to_dict()
    }), 200


@properties_bp.route('/upload-image', methods=['POST'])
@role_required('agent', 'admin')
def upload_property_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No image file provided'}), 400
        
    file = request.files['image']
    upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'properties')
    
    try:
        saved_filename = save_upload_file(file, upload_folder)
        if not saved_filename:
            return jsonify({'success': False, 'message': 'Invalid image file'}), 400
            
        file_url = f"/api/uploads/properties/{saved_filename}"
        return jsonify({
            'success': True,
            'message': 'Image uploaded successfully',
            'image_url': file_url
        }), 201
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to upload image'}), 500


# Agent properties endpoint
@properties_bp.route('/agent/my-listings', methods=['GET'])
@role_required('agent')
def get_agent_properties():
    current_user = get_current_user()
    status_filter = request.args.get('status', '').strip()
    
    query = Property.query.filter_by(agent_id=current_user.id)
    if status_filter:
        query = query.filter_by(listing_status=status_filter)
        
    properties = query.order_by(Property.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'properties': [p.to_dict(include_agent=False) for p in properties]
    }), 200
