# -*- coding: utf-8 -*-
import json
import pymssql
import datetime
from functools import wraps
from flask import g, make_response, jsonify, abort, request
from db_conf import VDCS_DB_CONFIG

tokens = {}
permission_cache = {}
PERMISSIONS = { 'user': { 'all' : 1, },
                'role': { 'all' : 2, },
                'asset': { 'all' : 4,
                            'query' : 8, },
                'vdcs_eu_dlr': { 'all' : 16, },
                }

def get_vdcs_db_con():
    if not hasattr(g, 'vdcs_db_con'):
        g.vdcs_db_con = pymssql.connect(VDCS_DB_CONFIG['server'], \
                VDCS_DB_CONFIG['username'], \
                VDCS_DB_CONFIG['password'],\
                VDCS_DB_CONFIG['db'])
    return g.vdcs_db_con

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def json_abort(obj, err_code):
    abort(make_response(jsonify(obj), err_code))

def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kw):
        token = request.cookies.get('token')
        if not token:
            json_abort({'err_msg': 'miss cookies token!', 'err_code': 4011}, 401)
        user_name = request.cookies.get('user')
        if not user_name:
            json_abort({'err_msg': 'miss cookies user_name!', 'err_code': 4011}, 401)
        if not tokens.has_key(user_name):
            json_abort({'err_msg': 'invalid token!', 'err_code': 4012}, 401)
        if token != tokens[user_name]:
            json_abort({'err_msg': 'invalid token!', 'err_code': 4012}, 401)
        return func(*args, **kw)
    return decorated_function

def mergePermissions(array):
    if len(array) == 1:
        return array[0].permission
    permissions = [x.permission for x in array]
    return reduce(lambda p, n: p | n, permissions)

def permission(n, logic='or'):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kw):
            user = request.cookies.get('user')
            p = permission_cache[user]
            if logic == 'or':
                if (n & p) == 0:
                    json_abort({'err_msg': 'Permission denied!', 'err_code': 4013}, 401)
            elif logic == 'and':
                if n != (n & p):
                    json_abort({'err_msg': 'Permission denied!', 'err_code': 4013}, 401)
            else:
                raise ValueError('invalid logic!')
            return func(*args, **kw)
        return wrapper
    return decorator

class DB_ModelEncoder(json.JSONEncoder):
    def default(self, obj):
        if not hasattr(obj, '__table__'):
            raise TypeError('not a Model type!')
        d = {}
        for col in obj.__table__.columns:
            colValue = getattr(obj, col.name)
            if isinstance(colValue, datetime.date):
                d[col.name] = colValue.strftime('%Y-%m-%d')
            else:
                d[col.name] = colValue
        return d

def jsonEncoder(obj):
    if hasattr(obj, '__table__'):
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
    return json.JSONEncoder.default(self, obj)
