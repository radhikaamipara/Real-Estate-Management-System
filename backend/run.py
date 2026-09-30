import os
from app import create_app
from extensions import db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Ensure database tables exist
        db.create_all()
        print("Database initialized successfully.")
        
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Real Estate Management Flask Server on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=True)
