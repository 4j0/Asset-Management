var DataRowError = function(errCode) {
	this.code = errCode;
	this.str = DataRowError.errors[errCode].str; 
	this.dataColumn = DataRowError.errors[errCode].dataColumn;
};

DataRowError.errors = {
	0 : { str : "检测到非ASCII字符串", dataColumn : 'vin' },
	1 : { str : "Vin码中包含非法字符", dataColumn : 'vin' },
	2 : { str : "此Vin码系统中不存在", dataColumn : 'vin' },
	3 : { str : "错误的状态", dataColumn : 'state' },
	4 : { str : "empty VinCode", dataColumn : 'vin' },
	5 : { str : "empty state", dataColumn : 'state' },
};

var DataRow = function(csvRow) {
	this.vin = $.trim(csvRow[0]);
	this.state = $.trim(csvRow[1]);
	this.car = null;
	this.error = this.checkError();
};
DataRow.states = { 'DLR-CLOVR' : 'DealerState', 'EUCLOVR' : 'ManufacturerState' };
DataRow.prototype = {

	checkError : function() {
		if (this.vin === "") return new DataRowError(4);
		if (this.state === "") return new DataRowError(5);
		if (!isASCII(this.vin)) return new DataRowError(0);
		if (!isAlphanumeric(this.vin)) return new DataRowError(1);
		if (!this.isValidState()) return new DataRowError(3);
		return null;
	},	

	isValidState : function() {
		return Object.keys(DataRow.states).indexOf(this.state) === -1 ? false : true;
	},

	setCar : function(car) {
		if (car === null) {
			this.error = new DataRowError(2); 
		} else {
			this.car = car;
		}
	},

	getStateColumn : function() {
		return DataRow.states[this.state];
	},

};

function getDataRows(csvRows) {
	return csvRows.map(function(each) { return new DataRow(each); });
}

function hasError(dataRows) {
	for (var i = 0; i < dataRows.length; i++) {
		if (dataRows[i].error !== null) return true;
	}
	return false;
}

function findCar(vin, cars) {
	for (var i = 0; i < cars.length; i++) {
		if (cars[i].VinCode === vin) return cars[i];
	}
	return null;
}

$(document).ready(function(){
	turnOnLoadingOverlay();
	var vue = new Vue({
		el: "#app",
		data: {
			dataRows : [],
			showSubmitBtn : false,
			submitSuccess : false,
		},
		methods: {
			setInputValueToNull: function() {
				_$('uploadFile').value = null;
			},
			attachFile: function() {
				this.submitSuccess = false;
				var file = $('#uploadFile')[0].files[0];
				Papa.parse(file, {
					skipEmptyLines: true,
					complete: function(results) {
						this.dataRows = getDataRows(results.data);
						if (!hasError(this.dataRows)) {
							var data = JSON.stringify(this.dataRows);
							var url = URL_PRE + "/vdcs/cars/query";
							$.json_post(url, data, 'json')
								.done(function(data) {
									this.dataRows.map(function(row) { 
										var car = findCar(row.vin, data.cars);
										row.setCar(car);
									});
									this.showSubmitBtn = hasError(this.dataRows) ? false : true;
								}.bind(this));	
						}
					}.bind(this)
				});
			},
			submit: function() {
				var updates = this.dataRows.map(function(row) {
					var update = {};
					update[row.getStateColumn()] = row.state;
					return { data: row.car, 'update': update };
				});
				var url = URL_PRE + "/vdcs/cars";
				var data = JSON.stringify(updates);
				$.json_put(url, data, 'json')
					.done(function(data) {
						this.showSubmitBtn = false;
						this.submitSuccess = true;
					}.bind(this))	
				.fail(function(jqXHR) {
					alertError(jqXHR);
				});
			},
		},
	});
});

