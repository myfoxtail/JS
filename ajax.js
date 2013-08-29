/**
 * Crossdomain ajax
 * Using HTML5 XHR2 technology and JSONP (for old browsers)
*/

Ajax = (function(){
	var xhr = null;
	try {      //for IE
		xhr = new ActiveXObject("Msxml2.XMLHTTP");
	} catch( e ) {
		try {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		} catch( er ) {  //for Mozilla, Safari, etc.
			if( typeof XMLHttpRequest != 'undefined' ) {
				xhr = new XMLHttpRequest();
			}
		}
	}
	var id = 0;
	if( typeof xhr.withCredentials == 'undefined'  ) {
		var prefix = "__JSONP__",
			document = window.document,
			documentElement = document.documentElement;

		return function(params) {
			var jsonp = "&" + ( params.jsonp || "jsonp" );
			function JSONPResponse() {
				try { delete window[src] } catch(e) {
					window[src] = null;
				}
				documentElement.removeChild(script);
				if( typeof arguments[0] === 'string') params.success.apply(this, arguments);
				else {
					arguments[0] = JSON.stringify(arguments[0]);
					params.success.apply(this, arguments);
				}

			}
			var src = prefix + id++,
				script = document.createElement("script");
			window[src] = JSONPResponse;
			documentElement.insertBefore(
				script,
				documentElement.lastChild
			).src = params.url + jsonp + "=" + src;
		}
	} else {
		return function(params) {
			var data = params.data
				, url = params.url
				, async = ( params.async === undefined ) ? true : params.async
				, type = params.type || "GET"
				, error_callback = params.error || function(){}
				, success_callback = params.success || null;

			//проверяем, чтобы содержимое не было загружено в элемент iframe - "подавеление фреймов"
			if( window !== window.top ) {
				window.top.location = location;
			}
			//при получении запроса, если он прошел успешно вызываем колбэк функцию и передаем ей полученные данные
			xhr.onload = function(e) {
				if( xhr.readyState != 4 ) return;

				if( xhr.status != 200 ) {
					error_callback('Ошибка ' + xhr.status + ': ' + xhr.statusText);
					return;
				}

				success_callback(this.responseText, params.url);
			};

			xhr.onabort = function(e) {
				error_callback(e);
			};

			xhr.ontimeout = function() {
				error_callback('408 Error: Запрос превысил максимальное время');
			};

			//в зависимости от типа запроса, посылаем его на сервер
			switch( type ) {
				case "POST":
					var t = JSON.stringify(data);
					xhr.open("POST", url, async);
					xhr.send(t);
					break;
				case "GET":
					xhr.open("GET", url, async);
					xhr.send();
					break;
				default:
					console.log('error');
					break;
			}
		}
	}
})();