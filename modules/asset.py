# -*- coding: utf-8 -*-
import json, re, StringIO, csv
from flask import Blueprint, send_file, Response
from sqlalchemy.sql import and_, or_
from sqlalchemy import desc
from flask import request, abort  
from model import db, User, Asset
from comm import jsonEncoder, json_abort, DB_ModelEncoder, login_required, permission, PERMISSIONS

find_dQuote_words = re.compile('"(.*)"')
#find_dQuote_words = re.compile("["“](.*?)["”]")

def filterLikeReduce(f, n):
    return f.filter(\
            (Asset.company.ilike(u'%{0}%'.format(n))) |\
            (Asset.asset_tag.ilike(u'%{0}%'.format(n))) |\
            (Asset.asset_state.ilike(u'%{0}%'.format(n))) |\
            (Asset.purchase_date.ilike(u'%{0}%'.format(n))) |\
            (Asset.sn.ilike(u'%{0}%'.format(n))) |\
            (Asset.user.ilike(u'%{0}%'.format(n))) |\
            (Asset.location.ilike(u'%{0}%'.format(n))) |\
            (Asset.type.ilike(u'%{0}%'.format(n))) |\
            (Asset.model.ilike(u'%{0}%'.format(n))) |\
            (Asset.os.ilike(u'%{0}%'.format(n))) |\
            (Asset.mac_wireless.ilike(u'%{0}%'.format(n))) |\
            (Asset.mac_wired.ilike(u'%{0}%'.format(n))) |\
            (Asset.remark.ilike(u'%{0}%'.format(n)))\
            )

def queryAssetsLike(criteria):
    if len(criteria) < 1:
        raise ValueError('Invalid criteria!')
    criteria = [u'%{0}%'.format(c) for c in criteria]
    clauses = []
    for c in criteria:
        clauses.append(Asset.company.ilike(c))
        clauses.append(Asset.asset_tag.ilike(c))
        clauses.append(Asset.asset_state.ilike(c))
        clauses.append(Asset.purchase_date.ilike(c))
        clauses.append(Asset.sn.ilike(c))
        clauses.append(Asset.user.ilike(c))
        clauses.append(Asset.location.ilike(c))
        clauses.append(Asset.type.ilike(c))
        clauses.append(Asset.model.ilike(c))
        clauses.append(Asset.os.ilike(c))
        clauses.append(Asset.mac_wireless.ilike(c))
        clauses.append(Asset.mac_wired.ilike(c))
        clauses.append(Asset.remark.ilike(c))
    return Asset.query.filter(or_(*clauses))

def getCriteria(q_str):
    dQuote_words = re.findall(find_dQuote_words, q_str)
    dQuoteCleaned_words = re.sub(find_dQuote_words, '', q_str).split(' ')
    #clean empty '' words
    dQuoteCleaned_words = [w for w in dQuoteCleaned_words if w != '']
    return dQuote_words + dQuoteCleaned_words

AssetManagement = Blueprint("AssetManagement", __name__)

#@AssetManagement.route("/validator/assets", methods=['GET'])
#@login_required
#def validate_asset():
    #_asset_tag = request.args['asset_tag']
    #if _asset_tag and Asset.query.filter_by(asset_tag = _asset_tag).scalar() is not None:
        #return make_response('false', 200, {'Content-Type': 'application/json'})
    #return make_response('true', 200, {'Content-Type': 'application/json'})

def export_to_csv(records):
    strIO = StringIO.StringIO()
    cw = csv.writer(strIO)
    for record in records:
        row = [getattr(record, column.name) for column in Asset.__mapper__.columns]
        encodedRow = [item.encode('utf-8') if type(item) is unicode else item for item in row]
        cw.writerow(encodedRow)
    strIO.seek(0)
    return send_file(strIO,
                     attachment_filename="assets.csv",
                     as_attachment=True)

@AssetManagement.route("/assets", methods=['GET'])
@login_required
@permission(PERMISSIONS['asset']['query'] | PERMISSIONS['asset']['all'])
def get_assets():
    args = request.args.to_dict()
    if args['q'] != '':
        criteria = getCriteria(args['q'])
        if args['logic'] == 'and':
            initializer = Asset.query.filter()
            query = reduce(filterLikeReduce, criteria, initializer)
        elif args['logic'] == 'or' or 'null':
            query = queryAssetsLike(criteria)
        else:
            json_abort({'err_msg':'invalid json filed:logic'}, 422)
    else:
        query = Asset.query
    if args.has_key('sort'):
        if args.has_key('order') and args['order'] in ['asc', 'desc']:
            if args['order'] == 'asc':
                query = query.order_by(args['sort'])
            else:
                query = query.order_by(desc(args['sort']))
        else:
            query = query.order_by(args['sort'])
    if args.has_key('export') and args['export'] == 'true':
        records = query.all()
        return export_to_csv(records)
    #If page or per_page are None, they will be retrieved from the request query.
    pagination = query.paginate()
    return json.dumps({ 'assets': pagination.items, 'pages':pagination.pages }, cls=DB_ModelEncoder)

@AssetManagement.route("/assets", methods=['POST'])
@login_required
@permission(PERMISSIONS['asset']['all'])
def post_asset():
    company = request.json.get('company')
    asset_tag = request.json.get('asset_tag')
    if Asset.query.filter(and_(Asset.company == company, Asset.asset_tag == asset_tag)).first() is not None:
        json_abort({'err_msg': '%s is already exist in %s' % (asset_tag, company), 'err_code': 1}, 422)
    asset = Asset(**request.json)
    db.session.add(asset)
    db.session.flush()
    _id = asset.id
    db.session.commit()
    return '{ "id" : %d }' % _id, 201

@AssetManagement.route("/assets/<int:_id>", methods=['PUT'])
@login_required
@permission(PERMISSIONS['asset']['all'])
def update_asset(_id):
    Asset.query.filter(Asset.id == _id).update(request.json)
    db.session.commit()
    return "", 201

@AssetManagement.route("/assets/<int:_id>", methods=['DELETE'])
@login_required
@permission(PERMISSIONS['asset']['all'])
def del_asset(_id):
    asset = Asset.query.filter(Asset.id == _id).first()
    db.session.delete(asset)
    db.session.commit()
    return "", 204
