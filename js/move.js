//var obj ,province,district,township,street,streetNumber,address;
var nowPosition,
    longtitude,
    latitude;
//返回原生页面

//var ip = "10.4.102.43";
//var port = "8090";
//var usercode = "00058";

var ip,
    port,
    userid,
    usercode;
summerready = function() {

	//获取原生参数
	var params = {
		"params" : {
			"transtype" : "request_token"
		},
		"callback" : tokenback,
		"error" : function(err) {
			alert(err);
		}
	};

	//调用原生
	summer.callService("SummerService.gotoNative", params, false);

	//获取token和ip
	function tokenback(data) {
		var u = navigator.userAgent,
		    app = navigator.appVersion;
		var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
		var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
		var info = data.result;
		if (!info) {
			alert("token获取失败！");
			return;
		}
		//安卓
		if (isAndroid) {
			info = JSON.parse(info);
		}
		ip = info.ip;
		port = info.port;
		userid = info.userid;
		usercode = info.usercode;
		applyData();
	};

	//获取数据
	function applyData() {

		summer.writeConfig({
			"host" : ip,
			"port" : port
		})
		var params = {};
		params.transtype = "getSigninByUserid";
		params.usercode = usercode;
		summer.callAction({
			"viewid" : "nc.hrmobile.Signin.HRSigninController", //后台带包名的Controller名
			"action" : "handler", //方法名
			"params" : params, //自定义参数
			"callback" : dataReturn, //请求回来后执行的ActionID
			"error" : noReturn //失败回调的ActionId
		});

	}

	//提交数据
	//签到按钮居中
	$('.imgbtn').css('left', (($(window).width()) / 2 - $('.imgbtn')[0].clientWidth / 2) + "px");

	//签到按钮点击事件获取打卡时间及地址
	$('.imgbtn').on('click', function() {
		$(".mask")[0].style.display = "block";
		//高德地图API
		AMap.plugin('AMap.Geolocation', function() {
			var geolocation = new AMap.Geolocation({
				enableHighAccuracy : false, //是否使用高精度定位，默认:true
			});
			geolocation.getCurrentPosition();
			AMap.event.addListener(geolocation, 'complete', onComplete);
			//返回定位信息
			AMap.event.addListener(geolocation, 'error', onError);
			//返回定位出错信息
		});

	});

}//初始化包裹
//解析定位正确信息
function onComplete(data) {
	var str = ['定位成功'];
	longtitude = data.position.getLng();
	latitude = data.position.getLat();
	var positionla = {};
	positionla.longtitude = longtitude;
	positionla.latitude = latitude;
	localStorage.setItem('positionla', JSON.stringify(positionla));
	str.push('经度：' + longtitude);
	str.push('纬度：' + latitude);
	//document.getElementById('tip').innerHTML = str.join('<br>');
	AMap.service('AMap.Geocoder', function() {//回调函数
		//实例化Geocoder
		geocoder = new AMap.Geocoder({
			city : "010"//城市，默认：“全国”
		});
		//逆地理编码
		var lnglatXY = [longtitude, latitude];
		//var lnglatXY=[105.53,35.87];
		//地图上所标点的坐标
		geocoder.getAddress(lnglatXY, function(status, result) {
			if (status === 'complete' && result.info === 'OK') {
				//获得了有效的地址信息:即，result.regeocode.formattedAddress
				nowPosition = result.regeocode.formattedAddress;
				//document.getElementById('tip').innerHTML = nowPosition;
				/*obj = result.regeocode.addressComponent;
				province=obj.province;
				city=obj.city;
				district=obj.district;
				township=obj.township;
				street=obj.street;
				streetNumber=obj.streetNumber;
				address=''+city+district+township+street+streetNumber;*/
				//JSON.stringify(result.regeocode.addressComponent)
				$('.um-content').css('background-image','none')
				$(".mask")[0].style.display = "none";
				addCard();
				cssstyle();
				$(".mask")[0].style.display = "none";
			} else {
				//获取地址失败
				$(".mask")[0].style.display = "none";
				layer.open({
					shadeClose : false,
					style : 'width:60%',
					content : '<p class="p1">提示</p><p>获取地址失败</p>',
					btn : '我知道了'
				});
			}
		});
	})
}

//解析定位错误信息
function onError(data) {
	$(".mask")[0].style.display = "none";
	layer.open({
		shadeClose : false,
		style : 'width:60%',
		content : '<p class="p1">提示</p><p>定位失败</p>',
		btn : '我知道了'
	});
}

//添加打卡信息
function addCard() {
	var date = new Date();
	var year = date.getFullYear();
	var month = (date.getMonth() + 1);
	month = month > 9 ? month : "0" + month;
	var day = date.getDate();
	day = day > 9 ? day : "0" + day;
	var hours = date.getHours();
	hours = hours > 9 ? hours : "0" + hours;
	var minutes = date.getMinutes();
	minutes = minutes > 9 ? minutes : "0" + minutes;
	var seconds = date.getSeconds();
	seconds = seconds > 9 ? seconds : "0" + seconds;
	//console.log(year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds);
	var newmove = document.createElement("div");
	//获取当前列表最近的日期，判断打卡时间是否为当日
	var nowday = $('.title-time').eq(0).text();
	//最近日期是当日，只添加时间
	if ((year + '-' + month + '-' + day) == nowday) {
		newmove.className = "move-list clearfix";
		var str = '<span class="list-time">' + hours + ':' + minutes + ':' + seconds + '</span>' + '<span class="list-address">' + nowPosition + '</span>' + '<img src="img/card-icon2.png" alt="" />'
		newmove.innerHTML = str;
		$('.move-list').eq(0).before(newmove);
	} else {//最近日期不是当日，添加日期和时间
		var str = '<div class="move-title clearfix" >' + '<span class="title-time">' + year + '-' + month + '-' + day + '</span>' + '</div>' + '<div class="move-list clearfix">' + '<span class="list-time">' + hours + ':' + minutes + ':' + seconds + '</span>' + '<span class="list-address">' + nowPosition + '</span>' + '<img src="img/card-icon2.png" alt="" />' + '</div>'
		newmove.innerHTML = str;
		$('.um-content').eq(0).prepend(newmove);
	}
	var newdate = '' + $('.title-time').eq(0).text() + ' ' + $('.list-time').eq(0).text();
	newposition = $('.list-address').eq(0).text();
	positionla = JSON.parse(localStorage.getItem('positionla'));
	var putparams = {};
	putparams.transtype = "addSignIn";
	putparams.usercode = usercode;
	putparams.recordaddress = newposition;
	putparams.longitude = positionla.longtitude;
	putparams.latitude = positionla.latitude;
	putparams.recordtime = newdate;
	cssstyle();

	summer.callAction({
		"viewid" : "nc.hrmobile.Signin.HRSigninController", //后台带包名的Controller名
		"action" : "handler", //方法名
		"params" : putparams, //自定义参数
		"callback" : dataAdd, //请求回来后执行的ActionID
		"error" : noAdd //失败回调的ActionId
	});

}

//提交数据成功信息
function dataAdd(args) {
	layer.open({
		shadeClose : false,
		style : 'width:60%',
		content : '<p class="p1">提示</p><p>' + args.des + '</p>',
		btn : '我知道了'
	});
	//args为MA返回的数据，类型是Json对象

}

//提交数据失败信息
function noAdd(args) {
	layer.open({
		shadeClose : false,
		style : 'width:60%',
		content : '<p class="p1">提示</p><p>' + args.des + '</p>',
		btn : '我知道了'
	});
	//在打印字符串时等价于上面的方法
}

//获取数据成功
function dataReturn(data) {

	if (data.flag == '0') {

		var date,
		    list,
		    time,
		    address;
		for (var i = 0; i < data.data.length; i++) {
			date = data.data[i].recorddate;
			list = data.data[i].blist;
			var newtitle = document.createElement("div");
			newtitle.className = "list";
			var str1 = '<div class="move-title clearfix" >' + '<span class="title-time">' + date + '</span>' + '</div>'
			newtitle.innerHTML = str1;
			$('.um-content').eq(0).prepend(newtitle);
			for (var j = list.length - 1; j >= 0; j--) {
				time = list[j].recordtime;
				address = list[j].recordaddress;
				var newlist = document.createElement("div");
				newlist.className = "move-list clearfix";
				var str2 = '<span class="list-time">' + time + '</span>' + '<span class="list-address">' + address + '</span>' + '<img src="img/card-icon2.png" alt="" />'
				newlist.innerHTML = str2;
				$('.list').eq(0).append(newlist);

			}
		}
		cssstyle();

	} else if (data.flag == '1') {
		/*layer.open({
			shadeClose : false,
			style : 'width:60%',
			content : '<p class="p1">提示</p><p>' + data.des + '</p>',
			btn : '我知道了'
		});*/
		$('.um-content').css({
			'background-image':'url(./img/nocard.png)',
			'background-position':'center 100px',
			'background-color':'#f7f7f7',
			'background-repeat':'no-repeat',
			'background-size':'193px 193px'
			
		})
	} else {

		layer.open({
			shadeClose : false,
			style : 'width:60%',
			content : '<p class="p1">提示</p><p>' + data.des + '</p>',
			btn : '我知道了'
		});
	}

}

//获取数据失败
function noReturn(data) {

	layer.open({
		shadeClose : false,
		style : 'width:60%',
		content : '<p class="p1">提示</p><p>' + data.des + '</p>',
		btn : '我知道了'
	});

}

//添加打卡样式
function cssstyle() {
	$('.move-list img').attr("src", "img/card-icon2.png");
	$('.move-list img').css({
		position : "absolute",
		top : "-28px",
		left : "10px",
		width : "14px",
		height : "53px",
	});
	var movearr = $('.move-list img');
	$('.move-title').next().find('img').attr("src", "img/card-icon1.png");
	$('.move-title').next().find('img').css({
		position : "absolute",
		top : "10px",
		left : "10px",
		width : "14px",
		height : "14px",
	});
}

//判断是安卓还是ios
function isIphone() {
	var ua = navigator.userAgent.toLowerCase();
	//设备信息
	var regexp = /(android|os) (\d{1,}(\.|\_)\d{1,})/;
	if (/iphone|ipad|ipod/.test(ua)) {
		return true;
	} else {
		return false;
	}
}

function functionback() {
	var u = navigator.userAgent,
	    app = navigator.appVersion;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
	var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
	if (isAndroid) {
		navigator.app.exitApp();
	}
	if (isIOS) {
		var pamn = {
			"params" : {
				"transtype" : "exit_back"
			}
		};
		summer.callService("SummerService.gotoNative", pamn, false);
	}
}

