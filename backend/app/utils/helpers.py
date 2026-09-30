import os
import uuid
from werkzeug.utils import secure_filename
from extensions import db
from app.models.notification import Notification

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_upload_file(file, upload_folder):
    """
    Saves an uploaded file with a safe UUID-prefixed filename.
    Returns relative web path e.g. /uploads/properties/abc.jpg
    """
    if not file or file.filename == '':
        return None
    
    if not allowed_file(file.filename):
        raise ValueError('Unsupported file extension. Allowed: PNG, JPG, JPEG, WEBP, GIF')
    
    filename = secure_filename(file.filename)
    extension = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}_{datetime_stamp()}.{extension}"
    
    os.makedirs(upload_folder, exist_ok=True)
    full_path = os.path.join(upload_folder, unique_filename)
    file.save(full_path)
    
    return unique_filename

def datetime_stamp():
    from datetime import datetime
    return datetime.utcnow().strftime('%Y%m%d%H%M%S')

def create_notification(user_id, title, message, link=None, notif_type='system'):
    """Utility to generate and save a notification for any user."""
    try:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            link=link,
            type=notif_type
        )
        db.session.add(notification)
        db.session.commit()
        return notification
    except Exception as e:
        db.session.rollback()
        print(f"Error creating notification: {e}")
        return None
