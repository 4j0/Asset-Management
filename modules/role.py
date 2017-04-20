# -*- coding: utf-8 -*-
import json
from flask import Blueprint, request, abort 
from model import Role, db
from comm import jsonEncoder, json_abort, login_required, PERMISSIONS, permission

RoleManagement = Blueprint('RoleManagement', __name__)

@RoleManagement.route("/permissions", methods=['GET'])
@login_required
def get_permissions():
    return json.dumps(PERMISSIONS)

@RoleManagement.route("/roles", methods=['POST'])
@login_required
@permission(PERMISSIONS['role']['all'])
def postRole():
    if not request.json:
        json_abort({'err_msg':'request should be a json type!'}, 400)
    try:
        name = request.json['name']
        permission = int(request.json['permission'])
    except Exception:
        json_abort({'err_msg': 'invalid json data'}, 400)
    role = Role.query.filter(Role.name == name).first()
    if role:
        json_abort({'err_msg':'该角色已存在！'}, 400)
    role = Role(name=name, permission=permission)
    db.session.add(role)
    db.session.flush()
    _id = role.id
    db.session.commit()
    return '{ "id" : %d }' % _id

@RoleManagement.route("/roles", methods=['GET'])
@login_required
@permission(PERMISSIONS['role']['all'] | PERMISSIONS['user']['all'])
def get_roles():
    args = request.args.to_dict()
    if (args.has_key('role_name') and args['role_name']):
        #role = Role.query.filter_by(name='%s' % args['role_name']).first()
        qStr = "%s%%" % args['role_name']
        roles = Role.query.filter(Role.name.like(qStr)).all()
        if not roles:
            abort(404)
    else:
        roles = Role.query.all()
    return json.dumps(roles, default=jsonEncoder)

@RoleManagement.route("/roles/<int:role_id>", methods=['DELETE'])
@login_required
@permission(PERMISSIONS['role']['all'])
def deleteRole(role_id):
    if not request.json:
        json_abort({'err_msg':'invalid request body'}, 400)
    if role_id <= 0:
        json_abort({'err_msg':'invalid role_id'}, 400)
    role = Role.query.filter(Role.id == role_id).first()
    if not role:
        json_abort({'err_msg':'role not find'}, 404)
    db.session.delete(role)
    db.session.commit()
    return "", 204


@RoleManagement.route("/roles/<int:role_id>/permission", methods=['PUT'])
@login_required
@permission(PERMISSIONS['role']['all'])
def updateRolePermission(role_id):
    if not request.json:
        json_abort({'err_msg':'invalid request body'}, 400)
    if role_id <= 0:
        json_abort({'err_msg':'invalid role_id'}, 400)
    permission = request.json.get('permission')
    if permission < 0 or permission > 2147483647:
        json_abort({'err_msg':'invalid permission'}, 400)
    role = Role.query.filter(Role.id == role_id).first()
    if not role:
        json_abort({'err_msg':'role not find'}, 404)
    role.permission = permission
    db.session.commit()
    return '', 200
