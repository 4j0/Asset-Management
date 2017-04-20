//var assert = require('assert');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
Permission.TEMPLATE = {"role": {"manage": 2}, "user": {"manage": 1}, "asset": {"query": 8, "manage": 4}};
describe('User', function() {
	var user;
	beforeEach(function(done) {
		//user = new User({"passwd": null, "permission": 0, "id": 4, "name": "test2"});
		user = new User({"passwd": null, "permission": 9, "id": 4, "name": "test2"});
		user.getRoles()
			.done(function() {
				user.init_rolePermission();
				user.permission = user.mergePermissions([user.userPermission, user.rolePermission]);
				user.permissionCached = true;
				done();
			});
	});

	//before(function(done) {
		//user.getRoles()
			//.done(function() {
				//user.updatePermission();
				//done();
			//});
	//});
	
	describe('#mergePermissions()', function() {
		it('', function() {
			//var pDatas = [2, 0, 10, 4];
			var pDatas = [2, 1];
			var result = 3;
			var permissions = pDatas.map(function(n) {
				return new Permission(n);
			});
			User.prototype.mergePermissions(permissions).n.should.equal(result);
		});
	});

   /* describe('#updateRolePermission()', function() {*/
		//it('', function() {
			//var n = 9 | 1;
			//user.updateRolePermission();
			//user.rolePermission.n.should.to.be.equal(n);
		//});
	/*});*/

   /* describe('#updatePermission()', function() {*/
		//it('', function() {
			////通过修改user.permission检查updateUserPermission
			//user.updatePermission();
			//user.permission.n.should.to.be.equal(9 | 1 | 0);
		//});
	/*});*/

	describe('#updateUserPermission()', function() {
		it('', function() {
			//通过修改user.permission检查updateUserPermission
			user.permission.dict.asset.manage = true;
			user.updateUserPermission();
			user.userPermission.n.should.to.be.equal(13);
		});

		it('确保修改rolePermission之后userPermission是正确的', function() {
			//通过修改user.permission检查updateUserPermission
			user.rolePermission.setN(15);
			user.updateUserPermission();
			user.userPermission.n.should.to.be.equal(9);
		});
	});

		//it('如果n是负数则抛出RangeError', function() {
			//(function() {
				//Role.prototype.init_permission(-1);
		  //}).should.to.throw(RangeError);
		//});

		//it("如果n > 2147483647 则抛出RangeError", function() {
			//(function() {
				//Role.prototype.init_permission(2147483648);
			//}).should.to.throw(RangeError);
		//});
	//});

	//describe("#getPermissionNum()", function() {
		//it("", function() {
			//roleData = {"permission": 8, "id": 2, "name": "test"};
			//var role = new Role(roleData);
			//role.getPermissionNum().should.to.equal(roleData.permission);
		//});
});

describe('Permission', function() {

	describe('#dictToNum()', function() {
		it('', function() {
			var n = 11;
			var permission = new Permission(n);
			permission.dictToNum(permission.dict).should.equal(n);
		});
	});

});
