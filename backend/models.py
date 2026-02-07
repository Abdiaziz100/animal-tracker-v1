# Models are now defined in app.py to avoid SQLAlchemy initialization issues
# This file is kept for backward compatibility

# If you want to separate models, make sure to:
# 1. Initialize db in app.py first
# 2. Import models after db.init_app(app)

