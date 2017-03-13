/* Copyright 2014 Alexander Oberegger

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

/*
 * Login in index.html
 * 
 */

var getBaseURL = function(slice,cb){
	var  loc = document.location, port = loc.port == "" ? (loc.protocol == "https:" ? 443
			: 80)
			: loc.port, url = loc.protocol + "//"
			+ loc.hostname +":"+ loc.port, pathComponents = location.pathname
			.split('/'),
	// Strip admin/plugins
	baseURL = pathComponents.slice(0,
			pathComponents.length - slice).join('/')
			+ '/';
	
	url = url + baseURL;
//	console.log(">>>>>");
//	console.log(url);
//	console.log("<<<<<<<<<");
	cb(url);
};

function getSlice(cb){
	var slice;
	if(window.location.href.indexOf("public_pad") > -1)
		slice = 2;
	else
		slice = 1;
	cb(slice);
}

$(document).ready(function(){
    // when login on the main page is pressed, the overlay and the lightBox is appended
  	$("#login").click(function(){
   		$("#wrapper").append('<div id="overlay"></div>');
    	//$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div id="lightBoxMain"><div class="headline"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/user-32.png" class="headlineImage" alt="Login"><h1 lang="en">Login</h1></div><div class="content"><div class="overlayLoginArea"><h3 lang="en">Etherpad Account</h3><button id="loginEtherpad" lang="en">Login</button></div><div style="clear:both"></div></div></div></div>');
    	// center the lightBox
    	//$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
    				
    	// click-event for the closing of the lightBox
    	//$(".close").click(function(){
   		//	$("#overlay").remove();
   		//	$("#lightBox").remove();
    	//});
    				
   		// when the etherpad account login is chosen, the ehterpad login screen appears in the lightBox 
   		//$("#loginEtherpad").click(function(){
    		//$("#lightBox").remove();
   				
			$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div id="lightBoxMain"><div class="headline"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/user-32.png" class="headlineImage" alt="Login"><h1 lang="en">Login Etherpad Account</h1></div><div class="content"> \
    							  <form id="formEtherpadLogin">\
    	  					 	  <div class="inputField"><input type="text" name="email" id="email" placeholder="E-Mailaddress" class="smallMarginBottom"></div>\
    					 	 	  <div class="inputField"><input type="password" name="password" id="password" placeholder="Password" class="smallMarginBottom"></div>\
    							  <button type="submit" id="overlayLogin" lang="en">Login</button>\
    							  </form></div></div></div>');    					
    		$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
    					    				
    		// click-event for the closing of the lightBox
    		$(".close").click(function(){
    			$("#overlay").remove();
    			$("#lightBox").remove();
    		});
    					
    		// validation of the login
    		// TODO: correct reaction on the validation
    		$("#formEtherpadLogin").submit(function(e) {
    			e.preventDefault();
//    			console.log('clicked here');
    			//if(validate("#formEtherpadLogin"))
    				//return false;
//			    console.log('here clicked');
				var data = {};
				data.email = $("#email").val();
				data.password = $("#password").val();
				var url;
				getSlice(function(slice){	
					getBaseURL(slice, function(baseurl){
						url = baseurl;
						data.url = baseurl;
						$.ajax({
							type: 'POST',
							data: JSON.stringify(data),
							contentType: 'application/json',
							url: url + 'login',	
							success: function(data) {
								if(data.success){
									if(window.location.href.indexOf("public_pad") > -1)
										window.location.reload();
									else
										window.location = url+"home.html";
								}else{
//									console.log(data.error);
									$("#formEtherpadLogin input").each(function(){
										if($(this).next().hasClass("errorRight"))
											$(this).next().remove();
										if($(this).is('#email') && !$(this).next().hasClass("errorRight") && (data.error == 'User or password wrong!'  || data.error == 'No valid E-mail Address given' || data.error == 'User is inactive')) {
											$(this).parent().append('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');
											$(".errorRight").delay(2000).fadeOut(1000);
										}
										if($(this).is('#password') && !$(this).next().hasClass("errorRight") && (data.error == 'You have to confirm your registration!' || data.error == 'No password given' )) {
											$(this).parent().append('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');
											$(".errorRight").delay(2000).fadeOut(1000);
										}
									});
								};	
							},
							error: function (xhr, ajaxOptions, thrownError) {
								//console.log(thrownError);
							}
						});
					});
				});
  			});
  		});
 	//});
    			
    // when register is clicked, the register screen appears in the lightBox
   	$("#register").click(function(){
   		$("#wrapper").append('<div id="overlay"></div>');
    	$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div id="lightBoxMain"><div class="headline"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/user-32.png" class="headlineImage" alt="Register"><h1>Register</h1></div><div class="content">\
   							  <form id="formEtherpadRegister">\
    						  <label for="fullname">Full Name</label><div class="inputfield marginBottom"><input type="text" name="fullname" id="fullname" class="smallMarginBottom"></div>\
    						  <label for="email">E-Mailaddress</label><div class="inputfield marginBottom"><input type="text" name="email" id="email" class="smallMarginBottom"></div>\
    						  <label for="password">Password</label><div class="inputfield"><input type="password" name="password" id="password" placeholder="Password" class="smallMarginBottom"></div><div class="inputfield marginBottom"><input type="password" name="passwordrepeat" id="passwordrepeat" placeholder="Repeat Password" class="smallMarginBottom"></div>\
    						  <input type="checkbox" required="required" name="acceptedTerms">I have read and accepted the <a href="./../../static/plugins/ep_user_pad_frontend/static/other/benutzungsrichtlinien.html" target="_blank">terms of usage</a>.<br>\
    						  <button type="submit" class="register" id="overlayRegister">Register</button>\
   							  </form></div></div></div>');
    	$("#lightBox").css("margin-top",-$("#lightBox").height()/2);

   	   	// click-event for the closing of the lightBox
   		$(".close").click(function(){
   			$("#overlay").remove();
   			$("#lightBox").remove();
   		});
    				
		// validation of the login
    	// TODO: correct reaction on the validation
    	$("#formEtherpadRegister").submit(function(e) {
    		e.preventDefault();
//    		console.log('here');
    		//if(validate("#formEtherpadRegister"));
    		//	return false;
			getSlice(function(slice){	
				getBaseURL(slice, function(baseurl){
					var data = {};
					var url = baseurl;
					data.email = $("#email").val();
					data.password = $("#password").val();
					data.fullname = $("#fullname").val();
					data.passwordrepeat = $("#passwordrepeat").val();
					data.location = url;
					$.ajax({
						type: 'POST',
						data: JSON.stringify(data),
						contentType: 'application/json',
						url: url + 'register',	
						success: function(data) {
							if(data.success){
								$("#overlay").remove();
					   			$("#lightBox").remove();
					   	   		$("#wrapper").append('<div id="overlay"></div>');
					   	    	$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div id="lightBoxMain"><div class="headline"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/user-32.png" class="headlineImage" alt="Register"><h1>Registration Successfull</h1></div><div class="content">\
					   	    						<label>Please check your E-mail to complete the registration.</label></div></div></div>');
								$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
						   		$(".close").click(function(){
						   			$("#overlay").remove();
						   			$("#lightBox").remove();
						   		});
							}else{
//								console.log(data.error);
								$("#formEtherpadRegister input").each(function(){
									if($(this).next().hasClass("errorRight"))
										$(this).next().remove();
									if($(this).is('#email') && !$(this).next().hasClass("errorRight") && (data.error == 'User already Exists' ||  data.error == 'No valid E-Mail')) {
										$(this).parent().append('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');
										$(".errorRight").delay(2000).fadeOut(1000);
									}
									if($(this).is('#password') && !$(this).next().hasClass("errorRight") && (data.error == 'Passwords do not agree' || data.error =='Password is empty')) {
										$(this).parent().append('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');
										$(".errorRight").delay(2000).fadeOut(1000);
									}
								});
							}
						},
						error: function (xhr, ajaxOptions, thrownError) {
							//console.log(thrownError);
						}
					});
				});
			});
    	});
    	
    });
   	
	$('#openPublicPad').click(function(e){
		e.preventDefault();
		var padname = $('#padName').val();
		if(padname.length > 0) {
			window.location = "public_pad/" + padname; 
		} else {
			//$("#padName").css("border-color","#B82349");
			$("#padName").parent().append('<div class="errorUp" style="margin-left:92px"><span class="arrowUp"></span><span lang="en">Please enter a name</span></div>');
			$(".errorUp").delay(2000).fadeOut(1000);
		}
	});
	
	
	
    function randomPadName() 
    {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var string_length = 10;
        var randomstring = '';
        for (var i = 0; i < string_length; i++) 
        {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    }
    
   	/*
   	 * Minimize and Maximize of the Header, groupNav und Footer Element in Pad View
   	 * 
   	 */
   	
   	// minimize the elements
	$("#minimize").click(function(){
    	$('header').delay(0).slideUp(800);
   		$('#groupNav').delay(0).slideUp(800);
    	$('footer').delay(0).slideUp(800);
    	$('#minimize').delay(0).slideUp(800);
    	$('#maximize').delay(1200).slideDown(800);
    	
    	$("#iframePad").animate({height: $(window).height()-4}, 800);
		$("#iframePad").css("display","block");
   	});
       	
   	// maximize the elements		
  	$("#maximize").click(function(){
   		$('header').delay(300).slideDown(800);
   		$('#groupNav').delay(300).slideDown(800);
   		$('footer').delay(300).slideDown(800);
   		$('#minimize').delay(1500).slideDown(800);
    	$('#maximize').delay(0).slideUp(800);
    	
    	$("#iframePad").delay(300).animate({height: $(window).height()-$("header").height()-$("#groupNav").height()-$("footer").height()-8}, 800);
   	});
   	
   	// adjust the height of the iframe 			
    $("#iframePad").css("height",$(window).height()-$("header").height()-$("#groupNav").height()-$("footer").height()-8);
    $(window).resize(function() {
    	if($("header").css("display") != "none")
   			$("#iframePad").css("height",$(window).height()-$("header").height()-$("#groupNav").height()-$("footer").height()-8);
   		else 
   			$("#iframePad").css("height",$(window).height()-4);
    });
    			
   // adjust the height of main > inside for the iframe (border of 4px )
   $("#iframePad").parent().css("height",$(window).height()-$("header").height()-$("#groupNav").height()-$("footer").height()-4);
   $(window).resize(function() {
   		$("#iframePad").parent().css("height",$(window).height()-$("header").height()-$("#groupNav").height()-$("footer").height()-4);
   });
    
	$('#createPublicPad').click(function(e){
		e.preventDefault();
//		console.log('here created');
		window.location = "public_pad/" + randomPadName();
	});
    			
    // Validate function, checks if the input field is empty
    // @tag: name of the tag
    function validate(tag) {
		$(tag + " input").each(function(){
			if($(this).val().length < 1) {
				if(!$(this).next().hasClass("errorRight")) {
					$(this).parent().append('<div class="errorRight"><span class="arrowRight"></span><span lang="en">Field is required!</span></div>');
				}
			} else {
				$(this).next().remove();
			}
		});
		return false;
	}
    
});
