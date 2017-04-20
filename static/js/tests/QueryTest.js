var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

describe('Query', function() {
  describe('#getLogic()', function() {

	it("if more than one logic character then throw Error", function() {
		(function() {
			Query.prototype.getLogic("fdsfdf|fdsfsf&fdsff");
		}).should.to.throw(Error);
	});

	it('aaa|bbb should return or', function() {
		Query.prototype.getLogic("aaa|bbb").should.equal("or");
	});

	it('aaa&bbb should return and', function() {
		Query.prototype.getLogic("aaa&bbb").should.equal("and");
	});

  });

  describe('#getCriteria()', function() {

	//it("", function() {
		//(function() {

		//}).should.to.throw(Error);
	//});

	it('aaa|bbb|ccc should return ["aaa","bbb","ccc"]', function() {
		var str = "aaa|bbb|ccc";
		var logic = "or";
		Query.prototype.getCriteria(str, logic).should.deep.equal(["aaa","bbb","ccc"]);
	});

	it('a&b&c should return ["a","b","c"]', function() {
		var str = "a&b&c";
		var logic = "and";
		Query.prototype.getCriteria(str, logic).should.deep.equal(["a","b","c"]);
	});

  });

  describe("#get_url_str()", function() {

	  it('', function() {
		  var query = new Query("笔记本&NALC&DELL");
		  //笔记本
		  var laptop = "%E7%AC%94%E8%AE%B0%E6%9C%AC";
		  var url = "?q=" + laptop + "+NALC+DELL&logic=and&like=true";
		  query.get_url_str().should.equal(url);
	  });

  });

});

describe('API_test', function() {

	describe('/assets', function() {

	});

});
