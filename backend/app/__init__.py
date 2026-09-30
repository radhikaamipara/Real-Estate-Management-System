import os
from flask import Flask, jsonify, send_from_directory
from config import Config
from extensions import db, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Enable CORS for React frontend (supports localhost:5173, 127.0.0.1:5173, etc.)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Ensure instance and upload directories exist
    os.makedirs(app.instance_path, exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'properties'), exist_ok=True)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.favorites import favorites_bp
    from app.routes.inquiries import inquiries_bp
    from app.routes.visits import visits_bp
    from app.routes.notifications import notifications_bp
    from app.routes.admin import admin_bp
    from app.routes.contact import contact_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(properties_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(inquiries_bp)
    app.register_blueprint(visits_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(contact_bp)

    # Static file serving for uploaded property images
    @app.route('/api/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'system': 'Real Estate Management System API',
            'version': '1.0.0'
        }), 200

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'success': False, 'message': 'Missing or invalid authentication token'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'success': False, 'message': 'Authentication token has expired. Please log in again.'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({'success': False, 'message': 'Signature verification failed'}), 422

    return app
