# -*- coding: utf-8 -*-
import unittest, sys, json
import pdb
sys.path.append('..')
from db_conf import TEST_DB_CONFIG
from app import app, db
from model import Asset
from modules.asset import getCriteria
from modules.login import mergePermissions

class Role:

    def __init__(self, n):
        self.permission = n

class Test_A(unittest.TestCase):

    def test_mergePermissions(self):
        foo = mergePermissions([Role(2)])
        self.assertEqual(foo, 2)
        bar = mergePermissions([Role(2), Role(4)])
        self.assertEqual(bar, 2|4)
        baz = mergePermissions([Role(2), Role(4), Role(8)])
        self.assertEqual(baz, 2|4|8)

    def test_getCriteria(self):

        q_str = u'"Mac Book"'
        words = [u'Mac Book']
        result = getCriteria(q_str)
        self.assertListEqual(result, words)

        q_str = u'sss'
        words = [u'sss']
        result = getCriteria(q_str)
        self.assertListEqual(result, words)

        q_str = u'aaa bbb'
        words = [u'aaa', u'bbb']
        result = getCriteria(q_str)
        self.assertListEqual(result, words)

        q_str = '"a b" c d'
        words = ['a b', 'c', 'd']
        result = getCriteria(q_str)
        self.assertEquals(result, words)

        q_str = 'a "b c" d'
        words = ['a', 'b c', 'd']
        result = getCriteria(q_str)
        self.assertItemsEqual(result, words)

        q_str = 'a b "c d"'
        words = ['a', 'b', 'c d']
        result = getCriteria(q_str)
        self.assertItemsEqual(result, words)

        q_str = '上海 b "武汉 成都"'
        words = ['上海', 'b', '武汉 成都']
        result = getCriteria(q_str)
        self.assertItemsEqual(result, words)

        q_str = u'上海 b "武汉 成都"'
        words = [u'上海', u'b', u'武汉 成都']
        result = getCriteria(q_str)
        self.assertItemsEqual(result, words)


#class Test_assets_get(unittest.TestCase):
class Test_assets_get():

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://%s:%s@%s/%s' % (\
        TEST_DB_CONFIG['username'],\
        TEST_DB_CONFIG['password'],\
        TEST_DB_CONFIG['server'],\
        TEST_DB_CONFIG['db'])
        db.init_app(app)
        with app.app_context():
            db.create_all()
            asset_a = Asset(model = 'Mac Book Pro', company='NCCC', asset_tag = 'a', asset_state = '已报废', sn = 'sn1', user = 'test1', location = 'sh', type = 'pc')
            asset_b = Asset(model = 'Mac Book Pro', company='NCCC', asset_tag = 'b', asset_state = '已报废', sn = 'sn2', user = 'test2', location = 'sh', type = 'laptop')
            asset_c = Asset(model = 'Mac Book Pro', company='NCCC', asset_tag = 'c', asset_state = '已报废', sn = 'sn3', user = 'test3', location = 'sh', type = 'laptop')
            asset_d = Asset(model = 'Mac Book Pro', company='NCCC', asset_tag = 'd', asset_state = '', sn = 'sn4', user = 'test4', location = 'bj', type = 'pc')
            asset_e = Asset(model = 'Mac Book Pro', company='NCCC', asset_tag = 'e', asset_state = '在用', sn = 'sn5', user = 'user1', location = 'bj', type = 'ipad')
            asset_f = Asset(model = 'Mac Book Pro', company='NCCC', asset_tag = 'f', asset_state = '在用', sn = 'sn6', user = 'user2', location = 'bj', type = 'ipad')
            db.session.add_all([asset_a, asset_b, asset_c, asset_d, asset_e, asset_f])
            db.session.commit()
        self.app = app.test_client()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_get_assets_with_empty_qString(self):
        res = self.app.get('/assets?q=')
        jsonData = json.loads(res.data)
        assert len(jsonData['assets']) == 6

    def test_get_assets_by_one_qString_Mac_with_null_logic(self):
        res = self.app.get('/assets?q=Mac&logic=null')
        jsonData = json.loads(res.data)
        assert len(jsonData['assets']) == 6
        #assert jsonData['assets'][0]['type'] == 'laptop'
        #assert jsonData['assets'][1]['type'] == 'laptop'

    def test_get_assets_by_one_qString_with_null_logic(self):
        res = self.app.get('/assets?q=laptop&logic=null')
        jsonData = json.loads(res.data)
        assert len(jsonData['assets']) == 2
        assert jsonData['assets'][0]['type'] == 'laptop'
        assert jsonData['assets'][1]['type'] == 'laptop'

    def test_get_assets_by_two_qString_with_and_logic(self):
        res = self.app.get('/assets?q=sh+laptop&logic=and')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 2
        assert assets[0]['type'] == 'laptop'
        assert assets[1]['type'] == 'laptop'
        assert assets[0]['location'] == 'sh'
        assert assets[1]['location'] == 'sh'

    def test_get_assets_by_two_qString_with_or_logic(self):
        res = self.app.get('/assets?q=sn1+bj+test3&logic=or')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 5

    def test_get_assets_with_empty_qString_paginate(self):
        res = self.app.get('/assets?q=''&logic=null&page=2&per_page=2')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 2
        res = self.app.get('/assets?q=''&logic=null&page=6&per_page=1')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 1

    def test_get_assets_by_one_qString_with_null_logic_paginate(self):
        res = self.app.get('/assets?q=laptop&logic=null&page=2&per_page=1')
        jsonData = json.loads(res.data)
        assert len(jsonData['assets']) == 1
        assert jsonData['assets'][0]['type'] == 'laptop'

    def test_get_assets_by_two_qString_with_and_logic_paginate(self):
        res = self.app.get('/assets?q=sh+laptop&logic=and&page=1&per_page=2')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 2
        assert assets[0]['type'] == 'laptop'
        assert assets[1]['type'] == 'laptop'
        assert assets[0]['location'] == 'sh'
        assert assets[1]['location'] == 'sh'
        res = self.app.get('/assets?q=sh+laptop&logic=and&page=2&per_page=2')
        assert res._status_code == 404

    def test_get_assets_by_two_qString_with_or_logic_paginate(self):
        res = self.app.get('/assets?q=sn1+bj+test3&logic=or&page=2&per_page=3')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 2
        res = self.app.get('/assets?q=sn1+bj+test3&logic=or&page=3&per_page=3')
        assert res._status_code == 404

    def test_get_assets_with_empty_qString_order_by_type(self):
        res = self.app.get('/assets?q=&sort=type')
        assets = json.loads(res.data)['assets']
        #['ipad', 'laptop', 'pc']
        assert assets[0]['type'] == 'ipad'

    def test_get_assets_with_empty_qString_order_by_type_desc(self):
        res = self.app.get('/assets?q=&sort=type&order=desc')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 6
        #['ipad', 'laptop', 'pc']
        assert assets[0]['type'] == 'pc'

    def test_get_assets_with_empty_qString_order_by_type_asc(self):
        res = self.app.get('/assets?q=&sort=type&order=asc')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 6
        #['ipad', 'laptop', 'pc']
        assert assets[0]['type'] == 'ipad'

    def test_get_assets_by_two_qString_with_and_logic_order_by_asset_tag_desc_paginate(self):
        res = self.app.get('/assets?q=sh+laptop&logic=and&page=1&per_page=2&sort=asset_tag&order=desc')
        assets = json.loads(res.data)['assets']
        assert len(assets) == 2
        assert assets[0]['asset_tag'] == 'c'
        assert assets[1]['asset_tag'] == 'b'
        res = self.app.get('/assets?q=sh+laptop&logic=and&page=2&per_page=2&sort=asset_tag&order=desc')
        assert res._status_code == 404

if __name__ == '__main__':
    unittest.main()
