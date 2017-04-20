# -*- coding: utf-8 -*-
from flask_sqlalchemy import SQLAlchemy
from db_conf import DB_CONFIG

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True, autoincrement=True)
    name = db.Column(db.String(20), nullable=False, unique=True)
    passwd = db.Column(db.String(20), nullable=False, default='')
    permission = db.Column(db.BIGINT, nullable=False, default=0)

class Role(db.Model):
    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    name = db.Column(db.String(10), nullable = False, unique = True)
    permission = db.Column(db.BIGINT, nullable=False, default=0)

class User_Role_Relationship(db.Model):
    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='cascade'), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id', ondelete='cascade'), nullable=False)

class Asset(db.Model):
    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    company = db.Column(db.CHAR(4), nullable=False)
    asset_tag = db.Column(db.CHAR(11), nullable=False)
    asset_state = db.Column(db.String(3), nullable=False, default='')
    purchase_date = db.Column(db.Date)
    sn = db.Column(db.String(20), nullable=False, default='')
    user = db.Column(db.String(20), nullable=False, default='')
    location = db.Column(db.String(20), nullable=False, default='')
    type = db.Column(db.String(6), nullable=False, default='')
    model = db.Column(db.String(30), nullable=False, default='')
    mac_wireless = db.Column(db.String(17), nullable=False, default='')
    mac_wired = db.Column(db.String(17), nullable=False, default='')
    remark = db.Column(db.String(255), nullable=False, default='')

    def __iter__(self):
        return self.to_dict().iteritems()
