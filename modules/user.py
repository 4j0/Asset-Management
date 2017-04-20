# -*- coding: utf-8 -*-
import json
from flask import Blueprint, request, abort
from model import User, Role, User_Role_Relationship, db
from comm import jsonEncoder, json_abort, login_required, permission, PERMISSIONS
from flask import Blueprint

UserManagement = Blueprint('UserManagement', __name__)

@UserManagement.route("/user_and_role_relationships", methods=['DELETE'])
@login_required
@permission(PERMISSIONS['user']['all'])
def del_user_and_role_relationship():
    if not request.json:
        json_abort({'err_msg':'request should be a json type!'}, 400)
    try:
        user_id = int(request.json['user_id'])
        role_id = int(request.json['role_id'])
    except Exception:
        json_abort({'err_msg': 'invalid json data'}, 400)
    relationship = User_Role_Relationship.query.filter(User_Role_Relationship.user_id == user_id, User_Role_Relationship.role_id == role_id).first()
    if not relationship:
        json_abort({'err_msg': 'relationship is not exits!'}, 404)
    db.session.delete(relationship)
    db.session.commit()
    jsonData = json.dumps({"role_id" : role_id})
    print jsonData
    return jsonData, 200

@UserManagement.route("/user_and_role_relationships", methods=['POST'])
@login_required
@permission(PERMISSIONS['user']['all'])
def post_user_and_role_relationship():
    if not request.json:
        json_abort({'err_msg':'request should be a json type!'}, 400)
    try:
        user_id = int(request.json['user_id'])
        role_id = int(request.json['role_id'])
    except Exception:
        json_abort({'err_msg': 'invalid json data'}, 400)
    user = User.query.filter(User.id == user_id).first()
    role = Role.query.filter(Role.id == role_id).first()
    if not user or not role:
        json_abort({'err_msg' : 'user_id or role_id is not exits!'}, 400)
    relationship = User_Role_Relationship.query.filter(User_Role_Relationship.user_id == user_id, User_Role_Relationship.role_id == role_id).first()
    if relationship:
        json_abort({'err_msg' : '该用户已拥有此角色！'}, 400)
    relationship = User_Role_Relationship(user_id = user_id, role_id = role_id)
    db.session.add(relationship)
    db.session.commit()
    roleData = json.dumps(role, default=jsonEncoder)
    return roleData, 201

@UserManagement.route("/users", methods=['POST'])
@login_required
@permission(PERMISSIONS['user']['all'])
def postUser():
    if not request.json:
        json_abort({'err_msg':'request should be a json type!'}, 400)
    try:
        name = request.json['name']
        permission = int(request.json['permission'])
        password = request.json['password']
    except Exception:
        json_abort({'err_msg': 'invalid json data'}, 400)
    user = User.query.filter(User.name == name).first()
    if user:
        json_abort({'err_msg':'该用户已存在！'}, 400)
    user = User(name=name, permission=permission, passwd=password)
    db.session.add(user)
    db.session.flush()
    _id = user.id
    db.session.commit()
    return '{ "id" : %d }' % _id, 201

@UserManagement.route("/users/<int:user_id>/roles", methods=['GET'])
@login_required
@permission(PERMISSIONS['user']['all'])
def getUserRoles(user_id):
    user_role_map_list = User_Role_Relationship.query.filter(User_Role_Relationship.user_id == user_id).all()
    role_id_list = [x.role_id for x in user_role_map_list]
    roles = Role.query.filter(Role.id.in_(role_id_list)).all()
    return json.dumps(roles, default=jsonEncoder)

@UserManagement.route("/users", methods=['GET'])
@login_required
@permission(PERMISSIONS['user']['all'])
def get_users():
    args = request.args.to_dict()
    if (args.has_key('user_name') and args['user_name']):
        #user = User.query.filter_by(name='%s' % args['user_name']).first()
        qStr = "%s%%" % args['user_name']
        users = User.query.filter(User.name.like(qStr)).all()
        if not users:
            abort(404)
    else:
        users = User.query.all()
    return json.dumps(users, default=jsonEncoder)

@UserManagement.route("/users/<int:user_id>", methods=['DELETE'])
@login_required
@permission(PERMISSIONS['user']['all'])
def deleteUser(user_id):
    if not request.json:
        json_abort({'err_msg':'invalid request body'}, 400)
    if user_id <= 0:
        json_abort({'err_msg':'invalid user_id'}, 400)
    user = User.query.filter(User.id == user_id).first()
    if not user:
        json_abort({'err_msg':'user not find'}, 404)
    db.session.delete(user)
    db.session.commit()
    return '', 204

@UserManagement.route("/users/<int:user_id>/permission", methods=['PUT'])
@login_required
@permission(PERMISSIONS['user']['all'])
def updateUserPermission(user_id):
    if not request.json:
        json_abort({'err_msg':'invalid request body'}, 400)
    if user_id <= 0:
        json_abort({'err_msg':'invalid user_id'}, 400)
    permission = request.json.get('permission')
    if permission < 0 or permission > 2147483647:
        json_abort({'err_msg':'invalid permission'}, 400)
    user = User.query.filter(User.id == user_id).first()
    if not user:
        json_abort({'err_msg':'user not find'}, 404)
    user.permission = permission
    db.session.commit()
    return '', 200

@UserManagement.route("/users/<int:user_id>/password", methods=['PUT'])
@login_required
@permission(PERMISSIONS['user']['all'])
def updateUserPassword(user_id):
    if not request.json:
        json_abort({'err_msg':'invalid request body'}, 400)
    if user_id <= 0:
        json_abort({'err_msg':'invalid user_id'}, 400)
    passwd = request.json.get('password')
    user = User.query.filter(User.id == user_id).first()
    if not user:
        json_abort({'err_msg':'user not find'}, 404)
    user.passwd = passwd
    db.session.commit()
    return '', 200
