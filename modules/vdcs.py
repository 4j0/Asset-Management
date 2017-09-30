# -*- coding: utf-8 -*-
import json
from flask import Blueprint, request, jsonify
from comm import get_vdcs_db_con, login_required, permission, PERMISSIONS

VDCS = Blueprint("VDCS", __name__)

@VDCS.route('/vdcs/cars/query', methods=['POST'])
@login_required
@permission(PERMISSIONS['vdcs_eu_dlr']['all'])
def query_cars():
    db = get_vdcs_db_con()
    sql_IN = ', '.join(map(lambda car: "'%s'" % car['vin'], request.json))
    sql = 'SELECT * FROM dbo.ProductCarInfo WHERE VinCode IN(%s)' % sql_IN
    with db.cursor(as_dict=True) as cursor:
        cursor.execute(sql)
        rows = cursor.fetchall()
    return jsonify(cars=rows)

@VDCS.route('/vdcs/cars', methods=['PUT'])
@login_required
@permission(PERMISSIONS['vdcs_eu_dlr']['all'])
def put_cars():
    db = get_vdcs_db_con()
    with db.cursor(as_dict=True) as cursor:
        for each in request.json:
            update_items = each['update'].items()
            update_keys = each['update'].keys()
            key_value = ' ,'.join(map(lambda kv: "%s = '%s'" % (kv[0], kv[1]), update_items))
            update_sql = "UPDATE dbo.ProductCarInfo SET %s WHERE VinCode = '%s'" % (key_value, each['data']['VinCode'])
            cursor.execute(update_sql)
            DealerState_and_ManufacturerState = [key for key in update_keys if key in ('DealerState', 'ManufacturerState')]
            for col in DealerState_and_ManufacturerState:
                cursor.execute('INSERT INTO [JLR_Receive]([VinCode],[Brand],[DealerName],[CarStatus],[CreatedTime],[DataStatus]) \
                         VALUES(%s, %s, %s, %s,GETDATE(),1)', \
                         (each['data']['VinCode'], each['data']['CarBrand'], each['data']['DealerCode'], each['update'][col]))
    db.commit()
    return "", 201


