# -*- coding: utf-8 -*-
#import pdb
import json, MySQLdb, random, hashlib
from flask import Flask, request, abort, Response, jsonify, make_response
from functools import wraps
from db_conf import DB_CONFIG
#from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import and_, or_
from model import db, User, Asset
from funcs import jsonEncoder

tokens = {}
app = Flask(__name__, static_folder = '../static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://%s:%s@%s/%s' % (\
        DB_CONFIG['username'],\
        DB_CONFIG['password'],\
        DB_CONFIG['server'],\
        DB_CONFIG['db'])

db.init_app(app)
#db = SQLAlchemy(app)
#db.Model.metadata.reflect(db.engine)

class RequestError(Exception):
    status_code = 400

    def __init__(self, err_msg, status_code=None, payload=None):
        Exception.__init__(self)
        self.err_msg = err_msg
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['err_msg'] = self.err_msg
        return rv

#@app.before_first_request
#def initialize_database():
    #db.create_all()

def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kw):
        token = request.cookies.get('token')
        user_name = request.cookies.get('user')
        if tokens.has_key(user_name) and token == tokens[user_name]:
            return func(*args, **kw)
        else:
            abort(401)
    return decorated_function

@app.route("/login", methods=['POST'])
def login():
    name = request.json.get('name')
    passwd = request.json.get('passwd')
    user = User.query.filter_by(user_name='%s' % name).first()
    if user == None:
        abort(401)
    if passwd == user.passwd:
        token = hashlib.sha256(user.user_name + user.passwd + str(random.random())).hexdigest()
        tokens[user.user_name] = token
        response = Response('ok')
        response.set_cookie('token',value=token)
        response.set_cookie('user',value=user.user_name)
        return response
    abort(401)

@app.route("/validator/assets", methods=['GET'])
@login_required
def validate_asset():
    _asset_tag = request.args['asset_tag']
    if _asset_tag and Asset.query.filter_by(asset_tag = _asset_tag).scalar() is not None:
        return make_response('false', 200, {'Content-Type': 'application/json'})
    return make_response('true', 200, {'Content-Type': 'application/json'})

@app.route("/assets", methods=['GET'])
@login_required
def get_assets():
    args = request.args.to_dict()
    criteria = { k:v for (k,v) in args.items() if k in Asset.__table__.columns.keys() }
    print(criteria)
    columns = [col for col in Asset.__table__.columns if col.key in criteria.keys()]
    if args['logic'] == 'and':
        #pdb.set_trace()
        if args['like'] == 'true':
            criteria_like = { k:u'%{0}%'.format(v) for (k,v) in criteria.items() }
            rule = and_(*[col.like(criteria_like[col.key]) for col in columns])
        else:
            rule = and_(*[col.like(criteria[col.key]) for col in columns])
    elif args['logic'] == 'or':
        if args['like'] == 'true':
            criteria_like = { k:u'%{0}%'.format(v) for (k,v) in criteria.items() }
            rule = or_(*[col.like(criteria_like[col.key]) for col in columns])
        else:
            rule = or_(*[col.like(criteria[col.key]) for col in columns])
    order = args.get('order_by')
    pagination = Asset.query.filter(rule).order_by(order).paginate()
    return json.dumps({'assets':pagination.items, 'pages':pagination.pages}, default=jsonEncoder)
    #pagination = Asset.query.filter_by(**_filter).order_by(order).paginate()
    #assets = Asset.query.order_by(args['order_by']).paginate(1, 50, False).items
    #assets = json.dumps(pagination.items, default=modelToDict, ensure_ascii=False)

@app.route("/assets", methods=['POST'])
@login_required
def add_asset():
    _asset_tag = request.json.get('asset_tag')
    if Asset.query.filter_by(asset_tag = _asset_tag).scalar() is not None:
        raise RequestError("asset_tag is already exists!", 422)
    asset = Asset(**request.json)
    db.session.add(asset)
    db.session.commit()
    return '', 201

@app.route("/assets/<string:_asset_tag>", methods=['PUT'])
@login_required
def update_asset(_asset_tag):
    Asset.query.filter(Asset.asset_tag == _asset_tag).update(request.json)
    db.session.commit()
    return "", 201

@app.route("/assets/<string:_asset_tag>", methods=['DELETE'])
@login_required
def del_asset(_asset_tag):
    asset = Asset.query.filter_by(asset_tag = _asset_tag).first()
    db.session.delete(asset)
    db.session.commit()
    return "", 204

@app.errorhandler(RequestError)
def handle_BadRequest(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    #return make_response('false',error.status_code,{'Content-Type': 'application/json'})
    return response

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

