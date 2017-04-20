//var assert = require('assert');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
Role.PERMISSIONS = {"role": {"manage": 2}, "user": {"manage": 1}, "asset": {"query": 8, "manage": 4}};
describe('Role', function() {
	describe('#init_permission()', function() {
		it('', function() {
			var permission = Role.prototype.init_permission(10);
			var p = {"role": {"manage": true}, "user": {"manage": false}, "asset": {"query": true, "manage": false}};
			//expect(permissions).to.deep.equal(p);
			permission.should.to.deep.equal(p);
		});

		it('如果n是负数则抛出RangeError', function() {
			(function() {
				Role.prototype.init_permission(-1);
		  }).should.to.throw(RangeError);
		});

		it("如果n > 2147483647 则抛出RangeError", function() {
			(function() {
				Role.prototype.init_permission(2147483648);
			}).should.to.throw(RangeError);
		});
	});

	describe("#getPermissionNum()", function() {
		it("", function() {
			roleData = {"permission": 8, "id": 2, "name": "test"};
			var role = new Role(roleData);
			role.getPermissionNum().should.to.equal(roleData.permission);
		});
	});
});
