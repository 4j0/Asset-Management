# -*- coding: utf-8 -*-
import hashlib, random
from flask import Blueprint, request, Response, abort
from model import db, User, Role, User_Role_Relationship
from comm import json_abort,login_required,tokens,permission_cache,mergePermissions
import pdb

Login = Blueprint("Login", __name__)
    
@Login.route("/login", methods=['POST'])
def login():
    name = request.json.get('name')
    passwd = request.json.get('passwd')
    user = User.query.filter(User.name == name).first_or_404()
    if passwd == user.passwd:
        #pdb.set_trace()
        token = hashlib.sha256(str(random.random())).hexdigest()
        tokens[user.name] = token
        #组合角色权限
        relationships = User_Role_Relationship.query.filter(User_Role_Relationship.user_id == user.id).all()
        role_ids = [x.role_id for x in relationships]
        roles = Role.query.filter(Role.id.in_(role_ids)).all()
        #roles = User_Role_Relationship.query.join(Role).filter(User_Role_Relationship.user_id == user.id).all()
        if len(roles) > 0:
            rolePermission = mergePermissions(roles)
        else:
            rolePermission = 0
        permission = rolePermission | user.permission
        permission_cache[user.name] = permission
        response = Response('')
        response.set_cookie('token',value=token)
        response.set_cookie('user',value=user.name)
        return response
    abort(401)
