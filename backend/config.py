import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'real-estate-super-secret-mca-project-key-2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-mca-realestate-key-987654')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # SQLite Database configuration with robust path resolution for Windows
    db_env = os.getenv('DATABASE_URL')
    if db_env:
        if db_env.startswith('sqlite:///') and not os.path.isabs(db_env.replace('sqlite:///', '')):
            rel_path = db_env.replace('sqlite:///', '')
            abs_db = os.path.abspath(os.path.join(basedir, rel_path))
            os.makedirs(os.path.dirname(abs_db), exist_ok=True)
            SQLALCHEMY_DATABASE_URI = f"sqlite:///{abs_db.replace(os.sep, '/')}"
        else:
            SQLALCHEMY_DATABASE_URI = db_env
    else:
        db_file = os.path.join(basedir, 'instance', 'real_estate.db')
        os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_file.replace(os.sep, '/')}"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
    
    # CORS
    CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000']
