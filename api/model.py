# -*- coding: utf-8 -*-
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from db_conf import DB_CONFIG
#import pdb

db = SQLAlchemy()
sql_engine = create_engine('mysql://%s:%s@%s/%s' % (\
        DB_CONFIG['username'],\
        DB_CONFIG['password'],\
        DB_CONFIG['server'],\
        DB_CONFIG['db'])\
        )
db.Model.metadata.reflect(sql_engine)

#def modelToDict(model):
    ##return {c.name: getattr(model, c.name) for c in model.__table__.columns}
    #if isinstance(model, Asset):
        #return {c.name: getattr(model, c.name) for c in model.__table__.columns}
    #return json.JSONEncoder.default(self, model)

class User(db.Model):
    __table__ = db.Model.metadata.tables['user']

class Asset(db.Model):
    __table__ = db.Model.metadata.tables['asset']

    def __iter__(self):
        return self.to_dict().iteritems()

#class User(db.Model):
    #user_name = db.Column(db.CHAR(20), primary_key = True)
    #passwd = db.Column(db.CHAR(20))
    
    #def __init__(self, user_name, passwd):
        #self.user_name = user_name
        #self.passwd = passwd

#class Asset(db.Model):
    #asset_tag = db.Column(db.CHAR(11), primary_key = True)
    #asset_state = db.Column(db.CHAR(3))
    #sn = db.Column(db.CHAR(20))
    #user = db.Column(db.CHAR(5))
    #location = db.Column(db.CHAR(6))
    #specific_location = db.Column(db.CHAR(12))
    #type = db.Column(db.CHAR(6))
    #model = db.Column(db.CHAR(30))
    #os = db.Column(db.CHAR(14))
    #mac_wireless = db.Column(db.CHAR(17))
    #mac_wired = db.Column(db.CHAR(17))
    #remark = db.Column(db.String(255))

    #def __init__(self, asset_tag, asset_state, sn, user, location, specific_location, type, model, os, mac_wireless, mac_wired, remark):
        #self.asset_tag = asset_tag
        #self.asset_state = asset_state
        #self.sn = sn
        #self.user = user
        #self.location = location
        #self.specific_location = specific_location 
        #self.type = type
        #self.model = model
        #self.os = os
        #self.mac_wireless = mac_wireless
        #self.mac_wired = mac_wired
        #self.remark = remark

    #def __iter__(self):
        #return self.to_dict().iteritems()
