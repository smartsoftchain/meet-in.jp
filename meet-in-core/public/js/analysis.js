
_U.showLoading("読込中...");

/* global google */
google.load("visualization", "1", {packages: ["corechart", "controls"]});
google.setOnLoadCallback(function () {
	_U.hideLoading();
});

// 集計時間表示タイプ（集計タイプ）
var AGGREGATE_TYPE_HOUR        = "1";	// 時間別
var AGGREGATE_TYPE_DAY         = "2";	// 日別
var AGGREGATE_TYPE_WEEK        = "3";	// 種別
var AGGREGATE_TYPE_MONTH       = "4";	// 月別
var AGGREGATE_TYPE_DAY_OF_WEEK = "5";	// 曜日別

var Analysis = {};
var AnalysisLoader = {};

var AggregateTypeController = {};
var PeriodController        = {};
var ApproachTypeController  = {};
var GraphAxisController     = {};
var GraphTypeController     = {};

var ChartLoader = {};
var TableDrawer = {};

/**
 * 解析コントローラ
 */
Analysis = (function () {
	var _config = {};

	var Analysis = {
		init: function (config) {
			_config = config;
			AggregateTypeController.init();
			PeriodController.init();
			ApproachTypeController.init();
			GraphAxisController.init();
			
			// 集計ボタン
			$('#aggregate-btn').on('click', function () {
				// 従業員数
				var employee_from = $("#employee_from").val();
				var employee_to = $("#employee_to").val();
				// 資本金
				var capital_from = $("#capital_from").val();
				var capital_to = $("#capital_to").val();
				// 売上高
				var sales_from = $("#sales_from").val();
				var sales_to = $("#sales_to").val();
				// 軸の設定
				var analysis_item_1 = $("[name=analysis_item_1]").val();
				var analysis_item_2 = $("[name=analysis_item_2]").val();
				// 集計種別を判定用で設定（電話、メール、問い合わせ）
				var approach_type = $("ul.technique-list").find(".select").children("a").data('approachType');
				// 入力する検索条件を非同期でサーバーへ送信後、集計処理を実行する
				$.ajax({
					url: "/analysis/save-condition",
					type: "POST",
					data: {
						"employee_from"			: employee_from,
						"employee_to"			: employee_to,
						"capital_from"			: capital_from,
						"capital_to"			: capital_to,
						"sales_from"			: sales_from,
						"sales_to"				: sales_to,
						"analysis_item_1"		: analysis_item_1, 
						"analysis_item_2"		: analysis_item_2, 
						"approach_type"			: approach_type
					},
					dataType: 'json',
					success: function(result) {
						if(result == ""){
							AnalysisLoader.load();
							return false;
						}else{
							// resultが空出ない場合はエラーが存在する
							alert(result);
						}
					}
				});
			});
			
			// リセットボタン
			$('#reset-btn').on('click', function() {
				
				if (confirm("全ての条件をリセットします")) {
					location.href = "/analysis/analysis?reset=true";
				}
				
				return;
			});

			//ChartLoader.load();
			
			TableDrawer.init();
			//TableDrawer.draw();
		},
		config: function (name) {
			if (!name) {
				return _config;
			}
			return _config[name];
		},
		setConfig: function (config) {
			_config = config;
			return _config;
		},
		update: function () {
			AnalysisLoader.load();
		},
		aggregateType: AggregateTypeController.aggregateType
	};
	return Analysis;
})();

/**
 * 解析結果をロードし、グラフと表を描画する
 * 
 */
AnalysisLoader = (function () {
	function load() {
		
		_U.showLoading("解析中です...");
		
		$.ajax({
			url: "load",
			type: "POST",
			data: data(),
			dataType: 'json',
			success: onSuccess
		});
	}
	function data() {
		var data = {};
		$.extend(data, AggregateTypeController.data());
		$.extend(data, PeriodController.data());
		$.extend(data, ApproachTypeController.data());
		$.extend(data, GraphAxisController.data());
		return data;
	}

	function onSuccess(response) {
		
		if (response !== "" && response["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
			
			Analysis.setConfig(response["result"]);
			ChartLoader.load();
			TableDrawer.draw();
			
			fixedtablehead();
		} else {
			alert(response["error"]);
		}
		
		_U.hideLoading();
	}

	var AnalysisLoader = {
		load: load
	};
	return AnalysisLoader;
})();


function fixedtablehead(){
	//テーブル固定用の要素を追加
  $('div.list-table-area table.listtable').addClass("hiddenthead").wrap('<div class="list-body" />');
  var fixtheadclone = $('div.list-table-area table.listtable thead').clone();
  $('div.list-table-area').prepend("<table class='listtable fixthead th-c td-l'></table>");
  $('div.list-table-area table.fixthead').prepend(fixtheadclone).wrap('<div class="scroll-y" id="scroll-yid" />');
  
  //変数に格納して無駄な処理を少なくする
  var fixthead = $("div.list-table-area table.fixthead");
  var scrolly = $("div.list-table-area div.scroll-y");
  var listbody = $("div.list-table-area div.list-body");
  var hiddenthead = $("div.list-table-area table.hiddenthead");
  
  var all_check = fixthead.find(".all_check").length;
  if(all_check==1){
    fixthead.find(".all_check").addClass("all_check_dummy")
    .attr("name","all_check_dummy")
    .removeClass("all_check");
  }
  $(document).on('click', '.fixthead :checkbox', function() {
		if($(this).hasClass("all_check_dummy")) {
      $(this).closest('.scroll-y').next(".list-body").find(".all_check").trigger("click");
    }
  });
  //現在表示されているテーブルの幅取得
  var scrolltablewidth = $(".hiddenthead").width();
  var wrapwidth = $(".list-table-area").width();
  
  //スクロールバーの値取得
  var scrollbarwidth = window.innerWidth - document.body.clientWidth;
  var sbrwm =wrapwidth-scrollbarwidth;
  
  //設置した要素のCSS設定
  fixthead.css({
    "width":"auto",
    "position": "relative"
  });
  scrolly.css({
    "width":sbrwm+"px",
    "position": "absolute",
    "overflow": "hidden",
    "z-index": "10"
  });
  listbody.css({
    "min-width":wrapwidth+"px",
    "position":"absolute"
  });
  hiddenthead.css({
    "position": "absolute"
  });

   // IE かどうか判定
  var ua, isIE, array, version;
  ua = window.navigator.userAgent.toLowerCase();
  isIE = (ua.indexOf('msie') >= 0 || ua.indexOf('trident') >= 0);
  if (isIE) {
    //IEの場合はmin-widthを設置しないとずれる
    fixthead.css({
      "min-width":scrolltablewidth+2+"px",
    });
  }
  
  if(listbody.hasClass("wfix1")){
    $("table.fixthead tr th:first-child").css({
        "padding": "10px 12px 7px"
    });
  }
  
  //現在表示されているセルの幅取得し、クローンした固定用のヘッダに設定
  var trLength = $(".listtable.hiddenthead tr th").length;
  for (var i = 0; i < trLength; i++) {
    var thMaxWidth = 0;
    thMaxWidth = $(".listtable.hiddenthead tr th:eq("+i+")").width();

    $(".listtable.fixthead tr th:eq("+i+")").css({
      "max-width": thMaxWidth,
      "min-width": thMaxWidth,
      "width": thMaxWidth,
      "height": "18px"
    });
  }
  
  //表示枠内でスクロールされた際の処理
  listbody.scroll(function () {
    var ScrTop = hiddenthead.position();
    fixthead.css({
      "left":ScrTop.left+"px"
    });
  });
}

/**
 * 時間表示方法設定
 */
AggregateTypeController = (function () {
	function init() {
		$('.aggregate_type_container a').click(function () {
			onClick($(this));
			return false;
		});
	}

	function onClick($clicked) {
		$('.aggregate_type_container a').each(function () {
			if ($(this).data('aggregateType') === $clicked.data('aggregateType')) {
				$(this).removeClass('btn-clear');
				$(this).addClass('btn');
			} else {
				$(this).removeClass('btn');
				$(this).addClass('btn-clear');
			}
		});
	}

	function aggregateType() {
		var type = 0;
		$('.aggregate_type_container a').each(function () {
			if ($(this).hasClass('btn')) {
				type = $(this).data('aggregateType');
				return false;
			}
		});
		return type;
	}

	function data() {
		return {
			aggregate_type: aggregateType()
		};
	}

	var AggregateTypeController = {
		init: init,
		aggregateType: aggregateType,
		data: data
	};
	return AggregateTypeController;
})();

/**
 * 対象の期間、および、曜日設定
 * 
 */
PeriodController = (function () {
	function init() {
		// initial state
		onChange($('.period_container select[name="period"]'));

		$('.period_container select[name="period"]').change(function () {
			onChange($(this));
		});
		$('.period_container .datepicker').change(function () {
			$('.period_container select[name="period"]').val('custome');
		});
	}

	function onChange($select) {
		var p = $select.val();
		if (p === 'custome') {
			return;
		}
		if (p === 'all') {
			if (Analysis.config('periodOrigin')) {
				periodFrom(Analysis.config('periodOrigin'));
			} else {
				periodFrom(today());
			}
			periodTo(today());
			return;
		}
		if (p === 'today') {
			periodFrom(today());
			periodTo(today());
			return;
		}
		if (p === 'this_week') {
			periodFrom(weekStart());
			periodTo(weekEnd());
			return;
		}
		if (p === 'this_month') {
			periodFrom(monthStart());
			periodTo(monthEnd());
			return;
		}
	}

	function periodFrom(date) {
		if (date) {
			$('.period_container input[name="period_from"]').val(formatDate(date));
		}
		return $('.period_container input[name="period_from"]').val();
	}
	function periodTo(date) {
		if (date) {
			$('.period_container input[name="period_to"]').val(formatDate(date));
		}
		return $('.period_container input[name="period_to"]').val();
	}
	function today() {
		return new Date();
	}
	function weekStart() {
		var d = new Date();
		d.setDate(d.getDate() - ((6 + d.getDay()) % 7));
		return d;
	}
	function weekEnd() {
		var d = weekStart();
		d.setDate(d.getDate() + 6);
		return d;
	}
	function monthStart() {
		var d = new Date();
		d.setDate(1);
		return d;
	}
	function monthEnd() {
		var d = new Date();
		d.setDate(1);
		d.setMonth(d.getMonth() + 1);
		d.setDate(0);
		return d;
	}

	function formatDate(date) {
		var y = m = d = '';
		if (!(date instanceof Date)) {
			return date;
		}
		y = '' + date.getFullYear();
		m = ('0' + (date.getMonth() + 1)).slice(-2);
		d = ('0' + date.getDate()).slice(-2);
		return y + '-' + m + '-' + d;
	}

	function dataWeek() {
		var mask = '';
		$('.period_container input[name="week"]').each(function () {
			if ($(this).prop('checked')) {
				mask += '1';
			} else {
				mask += '0';
			}
		});
		return mask;
	}

	function data() {
		return {
			period_from: periodFrom(),
			period_to: periodTo(),
			wday: dataWeek()
		};
	}

	var PeriodController = {
		init: init,
		periodFrom: periodFrom,
		periodTo: periodTo,
		data: data
	};
	return PeriodController;
})();

/**
 * 対象の手法設定
 */
ApproachTypeController = (function () {
	function init() {
		$('.approach_type_container a').click(function () {
			if ($(this).parent().hasClass('reset')) {
				return;
			}
			onClick($(this));
			return false;
		});
	}
	function onClick($clicked) {
		
		var currentApproachType = $clicked.data('approachType');
		
		$('.approach_type_container a').each(function () {
			if ($(this).parent().hasClass('reset')) {
				return true;
			}
			if ($(this).data('approachType') === currentApproachType) {
				$(this).parent().addClass('select');
			} else {
				$(this).parent().removeClass('select');
			}
		});
		
		$.ajax({
			url: "approach-axis-list",
			type: "GET",
			data: {
				"approach_type" : currentApproachType
			},
			dataType: 'json',
			success: function(result) {

				if (result !== "" && result["resultCode"] === TMO.CONST.AJAX.SUCCESS) {
					
					var checkedAxis1 = result["axisResult"]["default1"];
					var checkedAxis2 = result["axisResult"]["default2"];
					var items = result["axisResult"]["items"];
					
					var list = [];
					$.each(items, function() {
						list.push({
							"value"          : this.value,
							"name"           : this.name,
							"axis_1_checked" : (this.value === checkedAxis1 ? 'checked' : ''),
							"axis_2_checked" : (this.value === checkedAxis2 ? 'checked' : '')
						});
					});
				
					// HIDDEN要素にも選択中の値を入れる。
					$("input[name='axis_1']").val(checkedAxis1);
					$("input[name='axis_2']").val(checkedAxis2);
					
					var template = Handlebars.compile($('#select-axis-row-template').html());

					// 集計表を表示
					$("#select-axis tbody").empty().append(template({
						"items" : list
					}));
				} else {
					alert(result["error"]);
				}
			}
		});
	}

	function approachType() {
		var type = 0;
		$('.approach_type_container a').each(function () {
			if ($(this).parent().hasClass('select')) {
				type = $(this).data('approachType');
				return false;
			}
		});
		return type;
	}

	function data() {
		return {
			approach_type: approachType()
		};
	}

	var ApproachTypeController = {
		init: init,
		approachType: approachType,
		data: data
	};
	return ApproachTypeController;
})();


/**
 * グラフ表示項目設定
 * 
 * 左右のグラフ軸を設定する
 * TODO 未実装 対象の手法に依存する
 */
GraphAxisController = (function () {
	function init() {
		$('.graph-area .modal-open').click(function () {
			reset();
		});
		$('#graph-item-edit').on('click', '.area2btn a', function () {
			if ($(this).data('role') === 'cancel') {
				reset();
			} else if ($(this).data('role') === 'save') {
				save();
			}
			return false;
		});
	}
	function reset() {
		$('input[name="axis_1_ui"]').val([$('input[name="axis_1"]').val()]);
		$('input[name="axis_2_ui"]').val([$('input[name="axis_2"]').val()]);
	}

	function save() {
		$('input[name="axis_1"]').val($('input[name="axis_1_ui"]:checked').val());
		$('input[name="axis_2"]').val($('input[name="axis_2_ui"]:checked').val());
	}

	function data() {
		return {
			axis_1: $('input[name="axis_1"]').val(),
			axis_2: $('input[name="axis_2"]').val()
		};
	}

	var GraphAxisController = {
		init: init,
		data: data
	};
	return GraphAxisController;
})();






/**
 * 
 */
ChartLoader = (function () {
	
	// グラフの種類
	var CHART_TYPE_LINE   = "1";
	var CHART_TYPE_COLUMN = "2";
	
	var isPackageLoaded = false;
	var chartFontSetting = {
		fontName: "ＭＳ Ｐゴシック",
		fontSize: 14,
		bold: false,
		italic: false
	};

	function load() {
		draw();
	}

	function draw() {
		var config = Analysis.config();
		_draw(config.chart, 0);

	}
	function _draw(chartConfig, chartPosition) {
		// TODO 複数表示する場合、chartPositionで制御する計画

		if (!chartConfig.hAxisData || !chartConfig.hAxisData.length) {
			$('#chart_div').empty();
			$('#chart_div').html('<p class="align-c" style="padding-top: 50px;">選択の条件でのアプローチ結果がありませんでした。再度条件を指定し直してください。</p>');
			$('#chart_control_div').empty();
			return;
		}

		// data table作成
		var dataArray = [];
		var titles = ['x'];
		for (var i = 0; i < chartConfig.series.length; i++) {
			titles.push(chartConfig.series[i].title);
		}
		dataArray.push(titles);

		// x軸データ　[重要]グラフに表示させるデータは「日付型」か「数字型」しか駄目。
		for (var k = 0; k < chartConfig.hAxisData.length; k++) {
			var seriesData = [];
			
			// グラフには「合計/平均」行（all）は表示しないので飛ばす。
			if (chartConfig.hAxisData[k] === "all") {
				continue;
			}

			if ("2" == chartConfig.aggregateType) {
				// 日別
				var s = chartConfig.hAxisData[k].split('-');
				seriesData.push(new Date(s[0], s[1] - 1, s[2]));
			} else if ("3" == chartConfig.aggregateType) {
				// 週別
				var weeks = '' + chartConfig.hAxisData[k];
				var startWeekDateString = (weeks.split("/")[0]).split("-");
				var startWeekDate       = new Date(+startWeekDateString[0], (+startWeekDateString[1] - 1), +startWeekDateString[2]);
				
				seriesData.push(startWeekDate);

			} else if ("4" == chartConfig.aggregateType) {
				// 月別
				var d = '' + chartConfig.hAxisData[k];
				seriesData.push(new Date(d.substr(0, 4), d.substr(-2) - 1, 1));
//				seriesData.push(s.substr(0, 4) + '/' + s.substr(-2));
				//seriesData.push(chartConfig.hAxisData[k]);
			} else {
				seriesData.push(chartConfig.hAxisData[k]);
			}
			// allが存在する為kを1つ引いた値がkeyとなる
			var newKey = k - 1;
			for (var i = 0; i < chartConfig.series.length; i++) {
				seriesData.push(chartConfig.series[i].data[newKey]);
			}
			
			dataArray.push(seriesData);
		}

		var dataTable = google.visualization.arrayToDataTable(dataArray);

		// chartオプション
		var options = {
			title: chartConfig.title
		};

		// 各データ系列が左右どちらの軸を使うのか設定
		options.series = [];
		for (var i = 0; i < chartConfig.series.length; i++) {
			options.series.push({
				targetAxisIndex: chartConfig.series[i].vAxisIndex
			});
		}

		options.hAxis = {
			title: chartConfig.hAxisTitle,
			titleTextStyle: chartFontSetting
		};
		options.vAxes = [];
		options.vAxes[0] = {
			viewWindow: {
				min: 0
			},
			title: chartConfig.vAxisTitles[0],
			titleTextStyle: chartFontSetting
		};
		options.vAxes[1] = {
			viewWindow: {
				min: 0
			},
			title: chartConfig.vAxisTitles[1],
			titleTextStyle: chartFontSetting
		};


		// chartのcolumns view
		var columnsView = [];
		// x軸
		columnsView.push(xAxisColumnFormatter(chartConfig.aggregateType));

		// datable中のy軸のデータ位置設定
		for (var i = 0; i < chartConfig.series.length; i++) {
			columnsView.push(i + 1);
		}

		// Chart
		var currentChartType = $("#chartType").val();
		var chartType        = 'LineChart';
		
		if (CHART_TYPE_COLUMN === currentChartType) {
			chartType = 'ColumnChart';
		}
		
		var chart = new google.visualization.ChartWrapper({
			chartType: chartType,
			containerId: 'chart_div',
			options: options,
			view: {
				columns: columnsView
			}
		});

		// Dashboard Control
		var dashboard = new google.visualization.Dashboard(document.getElementById('chart_dashboard_div'));

		var controlOptions = {
			filterColumnIndex: 0,
			ui: {
				chartType: 'LineChart',
				chartView: {
					columns: columnsView
				}
			}
		};

		// TODO コントロールのラベルが、日別、月別でうまく表示できない(Firefoxで確認)
		// 日別は、デフォルトで良いと思います。月別は、要件等。
		if ("2" == chartConfig.aggregateType || "3" == chartConfig.aggregateType || "4" == chartConfig.aggregateType) {
			controlOptions.ui.chartView = null;
		}

		var control = new google.visualization.ControlWrapper({
			controlType: 'ChartRangeFilter',
			containerId: 'chart_control_div',
			options: controlOptions
		});

		dashboard.bind(control, chart);
		dashboard.draw(dataTable);
	}

	/**
	 * 
	 * @param {type} aggregate_type
	 * @return {object} calculated column format
	 */
	function xAxisColumnFormatter(aggregate_type) {
		
		aggregate_type = new String(aggregate_type);
		
		if (AGGREGATE_TYPE_HOUR == aggregate_type) {
			// 時間別
			return {
				calc: function (dataTable, rowIndex) {
					return  dataTable.getValue(rowIndex, 0) + '時台';
				},
				type: 'string'
			};
		} else if (AGGREGATE_TYPE_DAY == aggregate_type) {
			// 日別
			return {
				calc: function (dataTable, rowIndex) {
					var weekArray = ["日", "月", "火", "水", "木", "金", "土"];
					var date = dataTable.getValue(rowIndex, 0);
					var month = date.getMonth() + 1;
					var day = date.getDate();
					var name = month + '-' + day + '(' + weekArray[date.getDay()] + ')';
					return name;
				},
				type: 'string'
			};
		} else if (AGGREGATE_TYPE_WEEK == aggregate_type) {
			// 週別
			return {
				calc: function (dataTable, rowIndex) {
					var date = dataTable.getValue(rowIndex, 0);
					var month = date.getMonth() + 1;
					var day = date.getDate();
					var name = month + '/' + day + '週';
					return name;
				},
				type: 'string'
			};
		} else if (AGGREGATE_TYPE_MONTH == aggregate_type) {
			// 月別
			return {
				calc: function (dataTable, rowIndex) {
					var date = dataTable.getValue(rowIndex, 0);
					//var month = date.getMonth() + 1;
					var name = '' + date.getFullYear() + '/' + (date.getMonth() + 1);
					return name;
				},
				type: 'string'
			};
		} else if (AGGREGATE_TYPE_DAY_OF_WEEK == aggregate_type) {
			//TODO 曜日
			return {
				calc: function (dataTable, rowIndex) {
					var wdays = '日月火水木金土';
					var wday = dataTable.getValue(rowIndex, 0);
					return wdays.substr(wday, 1);
				},
				type: 'string'
			};
		}
		return false;
	}


	var ChartLoader = {
		load: load
	};
	return ChartLoader;
})();

/**
 * 表の描画
 */
TableDrawer = (function () {
	
	var APPROACH_TYPE_CALL    = "1";	// アプローチタイプ：架電
	var APPROACH_TYPE_MAIL    = "2";	// アプローチタイプ：メール
	var APPROACH_TYPE_INQUIRY = "3";	// アプローチタイプ：お問い合わせ
	
	function init() {
		
		$(document).on('click', '#open-filter-column-modal', function(){
			
			displayApproachTypeColumn();
			_U.modal("disp-item-edit");
			
			return false;
		});
		
		$(document).on('click', '#close-filder-column-modal', function(){
			$(".modal-close").trigger("click");
			return false;
		});
		
		
		$(document).on('click', '#regist-filder-column', function(){

			registFilterColumn();
			
			// フィルターをかけて一覧を表示
			filterShowColumn();
			$(".modal-close").trigger("click");
			
			return false;
		});
	}

	/**
	 * アプローチタイプ別のカラム一覧を表示
	 */
	function displayApproachTypeColumn() {
		
		var approachType  = $(".approach_type_container li.select a").data("approachType");
		var selectOptions = [];
		
		// アプローチタイプごとにセッション名前空間を切替
		_setSessionNameSpace();
		
		// 初期化
		$("#ReportArea thead th").each(function() {
			
			var index      = $("#ReportArea thead th").index(this);
			var columnName =  $(this).text();
			var isChecked  = (_Session.get(columnName) !== "0") ? "checked" : "";
			
			selectOptions.push({
				"approach_type" : approachType,
				"index"         : index,
				"checked"       : isChecked,
				"column_name"   : columnName
			});
		});
		
		var template = Handlebars.compile($('#filter-column-row-template').html());
		
		$("#disp-refine").empty().append(template({
			"list" : selectOptions
		}));
	}
	
	/**
	 * 登録ボタン押下時
	 */
	function registFilterColumn() {
		
		// アプローチタイプごとにセッション名前空間を切替
		_setSessionNameSpace();
		
		$("#disp-refine input[type='checkbox']").each(function() {
			
			var key       = $(this).val();
			var index     = $("#disp-refine input[type='checkbox']").index(this);
			var value = $(this).prop("checked") ? "1" : "0";
			
			_Session.set(key, value);
		});
	}
	
	/**
	 * セッションに表示設定になっているカラムのみ表示する
	 */
	function filterShowColumn() {
		
		// アプローチタイプごとにセッション名前空間を切替
		_setSessionNameSpace();
		
		// 表示/非表示を切り替える
		$("#ReportArea thead th").each(function() {
			
			var index      = $("#ReportArea thead th").index(this);
			var columnName = $(this).text();
			var isChecked  = _Session.get(columnName);
			
			if (isChecked === "1") {
				
				$(this).show();
				$("#ReportArea tbody tr").find("td:eq('" + index + "')").show()
				
			} else if (isChecked === "0") {
				$(this).hide();
				$("#ReportArea tbody tr").find("td:eq('" + index + "')").hide();
			}
		});
	}
	
	/**
	 * アプローチタイプごとにセッション名前空間を切替
	 */
	function _setSessionNameSpace() {
		
		var approachType = $(".approach_type_container li.select a").data("approachType") + "";
		
		// ブラウザセッションの名前空間を変更
		switch(approachType)
		{
		case APPROACH_TYPE_CALL:
			_Session.setNameSpace("APPROACH_TYPE_CALL")
			break;
		case APPROACH_TYPE_MAIL:
			_Session.setNameSpace("APPROACH_TYPE_MAIL")
			break;
		case APPROACH_TYPE_INQUIRY:
			_Session.setNameSpace("APPROACH_TYPE_INQUIRY")
			break;
		default:
			throw new Error("想定しないアプローチタイプが選択されています");
			break;
		}
	}
	
	function draw() {
		
		var config = Analysis.config();
		
		var head = [];
		var body = [];
		var indexForTotal = -1;
		var indexForListCount = -1;
		var indexForValidityCount = -1;
		
		// データがなければ終了
		if (!config.table || !config.table.data || !config.table.data.length) {
			$("#ReportArea").empty();
			return;
		}
		
		for (var i = 0; i < config.table.dataFieldNames.length; i++) {
			if (config.table.dataFieldNames[i] === 'analysis_item_1' || config.table.dataFieldNames[i] === 'analysis_item_2') {
				// 読み飛ばす
				continue;
			}
			head.push(config.table.dataFieldNames[i]);
			if (config.table.dataFieldKeys[i] === 'total') {
				indexForTotal = i;
			}
			if (config.table.dataFieldKeys[i] === 'list_count') {
				indexForListCount = i;
			}
			if (config.table.dataFieldKeys[i] === 'validity_count') {
				indexForValidityCount = i;
			}
		}
		for (var n = 0; n < config.table.data.length; n++) {
			
			// トータル数が「0」件の行は表示しない。
			if (indexForTotal > -1) {
				if (!config.table.data[n]["tableData"][indexForTotal]) {
					continue;
				}
			}
			
			var rowList = [];
			var primaryField = "";	// 時間タイプ列の値。詳細別窓画面のパラメータに使用
			var detailAnalysisItem1 = "";	// 解析の詳細検索に使用
			var detailAnalysisItem2 = "";	// 解析の詳細検索に使用

			for (var i = 0; i < config.table.dataFieldKeys.length; i++) {
				
				var k    = config.table.dataFieldKeys[i];
				var row  = "";
				var href = "";
				
				// 平均/合計平均が存在する場合は解析を行っているので、詳細検索用に条件を設定する
				if('detail_analysis_item_1' in config.table.data[n]){
					detailAnalysisItem1 = config.table.data[n]["detail_analysis_item_1"];
				}
				if('detail_analysis_item_2' in config.table.data[n]){
					detailAnalysisItem2 = config.table.data[n]["detail_analysis_item_2"];
				}
				
				if (config.table.data[n]["tableData"][i] === "all") {
					
					// 「総合計/総平均」行の場合
					row = "総合計/総平均";
					primaryField = "all";
					
				} else if (config.table.data[n]["tableData"][i] === "axisAll") {
					
					// 「合計/平均」行の場合
					row = "合計/平均";
					primaryField = "axisAll";
					
				} else if (k === 'primary_field') {
					
					if (AGGREGATE_TYPE_HOUR == config.table.aggregateType) {
						
						// 時間帯別
						var h = ('0' + config.table.data[n]["tableData"][i]).substr(-2);
						primaryField = h;
						row = h + ':00 ～ ' + h + ':59';
						
					} else if (AGGREGATE_TYPE_DAY == config.table.aggregateType) {
						
						// 日別
						var d = config.table.data[n]["tableData"][i].replace(/-/g, '/');
						primaryField = d;
						row = d;
						
					} else if (AGGREGATE_TYPE_WEEK == config.table.aggregateType) {
						
						// 週別
						var w = config.table.data[n]["tableData"][i];
						primaryField = w;
						row = w;
						
					} else if (AGGREGATE_TYPE_MONTH == config.table.aggregateType) {
						
						// 月別
						var ym = "" + config.table.data[n]["tableData"][i];
						primaryField = ym;
						row = ym.substr(0, 4) + '/' + ym.substr(4);
						
					} else if (AGGREGATE_TYPE_DAY_OF_WEEK == config.table.aggregateType) {
						
						// 曜日別
						var weekArray = ["日", "月", "火", "水", "木", "金", "土"];
						var wd = parseInt(config.table.data[n]["tableData"][i]);
						primaryField = wd + 1;
						row = weekArray[wd];
						
					} else {
						
						throw new Error("想定しない時間表示方法が設定されています : " + config.table.aggregateType);
						//row = config.table.data[n]["tableData"][i];
					}
					
				} else if (k.substr(-1) === 'r') {
					row = config.table.data[n]["tableData"][i] + ' %';
				} else if (k === 'round_ratio') {
					row = config.table.data[n]["tableData"][i] + ' %';
				}else if (k === 'analysis_item_1' || k === 'analysis_item_2') {
					if(config.table.data[n]["tableData"][i] != "analysis_item_1" && config.table.data[n]["tableData"][i] != "analysis_item_2"){
						row = config.table.data[n]["tableData"][i];
					}else{
						continue;
					}
				} else {
					if(i === indexForListCount || i === indexForValidityCount){
						// リスト全件数と有効リスト数にはリンクをつけない
						row = + config.table.data[n]["tableData"][i];
					}else{
						row = + config.table.data[n]["tableData"][i];
						href = true;
					}
				}
				
				if (href === true && row !== 0) {
					
					// TODO リンク先ポップアップを表示するために必要な情報を設定する
					rowList.push({
						"data"					: row,
						"link"					: "true",
						"status"				: k,
						"primaryField"			: primaryField,
						"detailAnalysisItem1"	: detailAnalysisItem1, 
						"detailAnalysisItem2"	: detailAnalysisItem2
					});
					
				} else {
					rowList.push({data : row});
				}
			}
			
			body.push(rowList);
		}
		console.log(body);
		var template = Handlebars.compile($('#aggregate-table-template').html());

		// 集計表を表示
		$("#ReportArea").empty().append(template({
			"thead" : head,
			"tbody" : body
		}));
		// 表示設定がされているカラムのみ表示
		filterShowColumn();
	}

	var TableDrawer = {
		init: init,
		draw: draw
	};

	
	return TableDrawer;
})();

