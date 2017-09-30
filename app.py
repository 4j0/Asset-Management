# -*- coding: utf-8 -*-
import sys
from flask import Flask, g
from db_conf import DB_CONFIG
from model import db
from modules.asset import AssetManagement
from modules.login import Login
from modules.user import UserManagement
from modules.role import RoleManagement
from modules.vdcs import VDCS

debug = False
if '--debug' in sys.argv: debug = True

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://%s:%s@%s/%s' % (\
        DB_CONFIG['username'],\
        DB_CONFIG['password'],\
        DB_CONFIG['server'],\
        DB_CONFIG['db'])
db.init_app(app)

app.register_blueprint(AssetManagement)
app.register_blueprint(Login)
app.register_blueprint(UserManagement)
app.register_blueprint(RoleManagement)
app.register_blueprint(VDCS)

@app.before_first_request
def initialize_database():
    db.create_all()

@app.teardown_appcontext
def close_vdcs_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'vdcs_db_con'):
        g.vdcs_db_con.close()

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug = debug)

