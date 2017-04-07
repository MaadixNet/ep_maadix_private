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

var setPw = function(groupId, padName, Password){
//	console.log(groupId);
	
	
};

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
	console.log(">>>>>");
	//console.log(url);
        console.log(baseURL);
	console.log("<<<<<<<<<");
	cb(url);
};

var first = true;



function post(data,url , cb){
	//console.log(data);
	//console.log(url);
	//console.log(cb);
	$.ajax({
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			url: url,	
			success: function(data) {
//				console.log('success');	
				cb(data);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				//console.log('no success');
				//console.log(xhr);
				//console.log(ajaxOptions);
				//console.log(thrownError);
				cb(null);
			}
	});	
};

function getSlice(cb){
	var slice;
	if(window.location.href.indexOf("$") > -1)
		slice = 4;
	else if(window.location.href.indexOf("group.html") > -1)
		slice = 2;
	else if(window.location.href.indexOf("public_pad") > -1)
		slice = 2;
	else
		slice = 1;
	cb(slice);
}
var userRole = function (numrole) {
  var textrole = '';
  switch (numrole) {
    case 1:
      textrole = 'Admin';
      break;
    case 2:
      textrole = 'Editor';
      break;
    case 3:
      textrole = 'User';
      break;
    default:
      textrole = 'Undefined';
  }
  return textrole;
}

$(document).ready(function() {
//	console.log("---------------READY FUNCTION CALLED");
	/*
	 * User Profile
	 * 
	 */
	
	
	// when the user name is clicked, the lightbox with the profile data appears
        
        //remove readonly attribute to input fields
        //taht has been set to avoid firefox autofill them


	$("#userProfile").click(function() {
		getSlice(function(slice){
			getBaseURL(slice, function(baseurl){
				post({},baseurl+'getUser', function(user){
//					console.log(user.user[0].name);
					$("#wrapper").append('<div id="overlay"></div>');
					$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close">'+
    						'<img src="./../../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png">'+
    						'</span></div><div id="lightBoxMain"><div class="headline"><img src="./../../../static/plugins/ep_user_pad_frontend/static/images/user-32.png"'+
    						' class="headlineImage" alt="User Details"><h1 lang="en">User Details</h1></div><div class="content">'+
    						'<h3 lang="en">Full Name</h3><form id="formUsername"><div class="inputField"><input type="text" '+
    						'lang="en" placeholder="'+ user.user[0].FullName +'" id="newUserName" class="marginRight longInput smallMarginBottom">'+
    						'</div><button type="submit" class="marginBottom">Change</button></form><h3 lang="en">E-Mailaddress</h3>'+
    						'<form id="formUseremail"><div class="inputField"><input type="text" id="newEmail" lang="en" placeholder="'+ user.user[0].name +'"'+
    						' class="marginRight longInput smallMarginBottom"></div><button type="submit" class="marginBottom">Change</button>'+
    						'</form><h3 lang="en">Change Password</h3><form id="formUserpassword"><div class="inputField"><input type="password" '+
    						'lang="en" placeholder="Old Password" id="oldPW" class="marginRight longInput smallMarginBottom"></div><div class="inputField">'+
    						'<input type="password" lang="en" placeholder="New Password" id="newPW" class="marginRight longInput smallMarginBottom">'+
    						'</div><div class="inputField"><input type="password" lang="en" placeholder="Repeat Password" id="newRepPW" class="marginRight '+
    						'longInput smallMarginBottom"></div><button type="submit" lang="en" class="marginBottom">Change</button></form>'+
    						'<h3 lang="en" class="clearMargin">Delete Account & Data</h3><span lang="en" class="deleteInfo">'+
    						'Deletes all your Groups and Pads</span><button id="deleteData">Delete</button></div></div></div>');
					
					$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
			    	
			    	// click-event for the closing of the lightBox		
			    	$(".close").click(function(){
			    		$("#overlay").remove();
			   			$("#lightBox").remove();
			   		});
			    	
			    	// confirmation for delete data			
			   		$("#deleteData").click(function() {
			    		$("#lightBox").remove();
			    				
						//$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"></span></div><div id="lightBoxMain"><div class="headline"><img src="images/close-red-32.png" class="headlineImage" alt="Delete"><h1 lang="en" class="red">Delete not possible</h1></div><div class="content"><p>Delete not possible, because you have groups where you are owner.<br>Change ownership!</p></div></div></div>');
			    		$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close">'+
			    							'<img src="./../../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png">'+
			    							'</span></div><div id="lightBoxMain"><div class="headline">'+
			    							'<img src="./../../../static/plugins/ep_user_pad_frontend/static/images/close-red-32.png" class='+
			    							'"headlineImage" alt="Delete"><h1 lang="en"'+
			    							'class="red">Delete all your groups and pads</h1></div><div class="content"><button id="deleteBtn" lang="en"'+
			    							'class="marginRight">Delete</button><button id="cancelBtn" lang="en">Cancel</button></div></div></div>');
			    		$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
			    		
			    		$("#deleteBtn").click(function(e){
			    			e.preventDefault();
			        		getSlice(function(slice){
			        			getBaseURL(slice,function(baseurl){
			        				var data = {};
			        				var url = baseurl;
			        				post(data, url+'deleteUser' ,function(data){
			        					if(data.success){
			        						document.location.reload();
			        					}else{
//			        						console.log(data.error);
			    		    				$("#lightBox").append('<div class="errorRight"><span class="arrowRight"></span><span lang="en">'+data.error+'</span></div>');
											$(".errorRight").delay(2000).fadeOut(1000);
			        					}
			        				});
			        			});
			        		});
			    			
			    		});
			    		
			    		$("#cancelBtn").click(function(){
			    			$("#overlay").remove();
			       			$("#lightBox").remove();
			    		});
			    		
			    		// click-event for the closing of the lightBox		
			    		$(".close").click(function(){
			    			$("#overlay").remove();
			    			$("#lightBox").remove();
			    		});
			    		

			   		});
		        	// validation of the login
		        	// TODO: correct reaction on the validation			
		        	$("#formUsername").submit(function(e) {
		        		e.preventDefault();
		        		validate("#formUsername");
//		        		console.log("here");
		        		var data = {};
		        		getSlice(function(slice){
		        			getBaseURL(slice,function(baseurl){
		        	   			data.newUserName = $("#newUserName").val();
		        				url = baseurl;
		        				data.location = url;
//		        				console.log(data);
//		        				console.log(url+'setPassword');
		        				post(data, url+'changeUserName' ,function(data){
		        					if(data.success){
		        						document.location.reload();
		        					}else{
		        						//console.log(data.error);
		        						//console.log("Error while Updating Database");
		        					}
		        				});
		        			});
		        		});


		       		});
		        	
		        	// validation of the login
		        	// TODO: correct reaction on the validation			
		        	$("#formUseremail").submit(function(e) {
		        		e.preventDefault();
		        		validate("#formUseremail");
		        		var data = {};
		        		getSlice(function(slice){
		        			getBaseURL(slice, function(baseurl){
		        				data.newEmail = $("#newEmail").val();
		        				url = baseurl;
		        				data.location = url;
		        				post(data, url+'changeEmail', function(data){
		        					if(data.success){
		        						document.location.reload();
		        					}else{
		        						//console.log("Error while Updating Database");
		        					}
		        				});
		        			});
		        			
		        		});
		        	});
		        	
		        	// validation of the login
		       		// TODO: correct reaction on the validation			
		        	$("#formUserpassword").submit(function(e) {
		        		e.preventDefault();
		        		validate("#formUserpassword");
		        		var data = {};
		        		if($("#newPW").val() != $("#newRepPW").val()){
		    				if(!$("#newRepPW").next().hasClass("errorRight")) {
		    					$("#newRepPW").parent().append('<div class="errorRightLong"><span class="arrowRight"></span><span lang="en">Passwords do not agree!</span></div>');
		  						$(".errorRightLong").delay(2000).fadeOut(1000);
		    				}
		        		}else{
		        			$("#newPW").next().remove();
		        			getSlice(function(slice){
		        				getBaseURL(slice, function(baseurl){
		            				data.newPW = $("#newPW").val();
		            				data.oldPW = $("#oldPW").val();
		            				url = baseurl;
		            				data.location = url;
		            				post(data, url+'changeUserPw', function(data){
		            					if(data.success){
		            						document.location.reload();
		            					}else{
		            						if(!$("#newRepPW").next().hasClass("errorRight")) {
		            							$("#newRepPW").parent().append('<div class="errorRightLong"><span class="arrowRight"></span><span lang="en">'+ data.error + '</span></div>');
												$(".errorRightLong").delay(2000).fadeOut(1000);		            							
		            						}
		            						//console.log(data.error);
		            					}
		            				});
		            			});
		            		});
		        		}
		        	});
				});
			});
   		});
   	}); 
    
    // Validate function, checks if the input field is empty
    // @tag: name of the tag			
   	function validate(tag) {
   		$(tag + " input").each(function(){
			if($(this).val().length < 1) {
				if(!$(this).next().hasClass("errorRight")) {
					$(this).parent().append('<div class="errorRightLong"><span class="arrowRight"></span><span lang="en">Field is required!</span></div>');
					$(".errorRightLong").delay(2000).fadeOut(1000);
				}
			} else {
				$(this).next().remove();
			}
		});
		//return false;
	}
	
	/*
	 * Groups
	 * 
	 */
   	

   	
/*   	function createUserManagement(users, selectedUserVal,groupID, cb){
   		var value = "";
   		value += '<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="./static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"'+
		'></span></div><div id="lightBoxMain" data-groupid= "'+groupID+'" ><div class="headline"><img src="./static/plugins/ep_user_pad_frontend/static/images/user-32.png" class="'+
		'headlineImage" alt="Login"><h1 lang="en">User Management</h1></div><div class="content"><h3 lang="en">Add User</h3><div id= "wait"><form id = "selUsersForm"><input type="text"'+
		'lang="en" placeholder="E-Mailaddress(es)" ';
//		console.log(selectedUserVal);
   		if(!selectedUserVal == "")
			value += 'value="'+ selectedUserVal + '"';
		value += 'id="selectedUsers" class="marginRight" longInput><button id="invitebtn" type="submit">Add User</button><span lang="en" class="inviteInfo"'+
				 '>If there are more than one, separate with ;</span></form></div><h3 lang="en">Manage User</h3>';
		if(users.length == 0){
			value += '<h4 class="red" lang="en">No user in this group.</h4>';
		} else {
			value += '<form style="margin-bottom:5px"><input type="text" id="searchU" placeholder="Search"></form><div class="tableview" style="height: 157px; overflow: hidden"><table>';	
			
			for (var i = 0; i < users.length; i++) {
				if(!(i%2 ==1)){
					if(users[i].notRegistered){
						value+='<tr id="User' + users[i].userID + '" class="grey visible">\
							<td class="first"><span id="userEmail" data-toinvite="1" data-mail="'+users[i].name+'" data-userid="'+users[i].userID+'">' + users[i].name + ' <span class="smallFont"> (Invited)</span></span></td>\
							<td class="last right" id="options"  data-groupid="'+groupID+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/options-16.png" class="options" data-groupid="'+groupID+'" data-userid="'+ users[i].userID +'"></td>\
						</tr>';
					}
					else if(users[i].Role == 1){
						value += '<tr class="odd visible" id="User' + users[i].userID + '" >'+
									'<td class = "first"><span id="userEmail"  data-mail="'+users[i].name+'" data-userid="'+users[i].userID+'" >' + users[i].FullName + ' <span class="smallFont">(Owner)</span></span></td>' +
									'<td class="last right" id="options"  data-groupid="'+groupID+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/options-16.png" class = "options" data-groupid="'+groupID+'" data-userid="'+ users[i].userID +'"> </td>';
					}else if(users[i].invited){
						value += '<tr  class="grey visible" id="User' + users[i].userID + '">'+
									'<td class="first"><span id="userEmail" data-mail="'+users[i].name+'" data-userid="'+users[i].userID+'" >' + users[i].name + ' <span class="smallFont"> (Invited)</span></span></td>' +
									'<td class="last right" id="options"  data-groupid="'+groupID+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/options-16.png" class = "options" data-groupid="'+groupID+'" data-userid="'+ users[i].userID +'"> </td>';		 
					}else{
						value += '<tr  class="odd visible" id="User' + users[i].userID + '">'+
									'<td class = "first"><span id="userEmail" data-mail="'+users[i].name+'" data-userid="'+users[i].userID+'" >' + users[i].FullName + '</span></td>' +
									'<td class="last right" id="options"  data-groupid="'+groupID+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/options-16.png" data-groupid="'+groupID+'" class = "options" data-userid="'+ users[i].userID +'" ></td>';
					}
					value += '</tr>';
				}else{
					if(users[i].notRegistered){
						value+='<tr id="User' + users[i].userID + '" class="grey visible" >\
							<td class="first"><span id="userEmail" data-toinvite="1" data-mail="'+users[i].name+'" data-userid="'+users[i].userID+'">' + users[i].name + '<span class="smallFont"> (Invited)</span></span></td>\
							<td class="last right" id="options"  data-groupid="'+groupID+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/options-16.png" class="options" data-groupid="'+groupID+'" data-userid="'+ users[i].userID +'"></td>\
						</tr>';
					}
					else if(users[i].Role == 1){
						value += '<tr  class="visible" id="User' + users[i].userID + '">'+
									'<td class = "first"><span id="userEmail" data-mail="'+users[i].name+'" data-userid="'+users[i].userID+'" >' + users[i].FullName + ' <span class="smallFont">(Owner)</span></span></td>' +
									'<td class="last right" id="options" data-groupid="'+groupID+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/options-16.png" class = "options" data-groupid="'+groupID+'" data-userid="'+ users[i].userID +'"> </td>';
					}else if(users[i].invited){
						value += '<tr  class="grey visible" id="User' + users[i].userID + '>'+
									'<td class = "first"><span id="userEmail" data-mail="'+users[i].name+'" data-userid="'+users[i].userID+'" >' + users[i].name + ' <span class="smallFont"> (Invited)</span></span></td>' +
									'<td class="last right" id="options" data-groupid="'+groupID+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/options-16.png" class = "options" data-groupid="'+groupID+'" data-userid="'+ users[i].userID +'"> </td>';		 
					}else{
						value += '<tr  class="visible" id="User' + users[i].userID + '">'+
									'<td class = "first"><span id="userEmail" data-mail="'+users[i].name+'" data-userid="'+users[i].userID+'" >' + users[i].FullName + '</span></td>' +
									'<td class="last right" id="options" data-groupid="'+groupID+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/options-16.png" class = "options" data-groupid="'+groupID+'" data-userid="'+ users[i].userID +'"> </td>';
					}
						value += '</tr>';
				}
				
			
			}
			value += '</table></div><div class="navigationInfo"><span id="previousPageU"><<</span> <span id="currentPageU"></span> to <span id="currentPageCountU"></span> of <span id="pageCountU"></span> Users <span id="nextPageU">>></span></div>';
		}
		value += '</div></div></div>';
//		console.log(value);
		cb(value);
   	};
 */  	
   	function submitHandler(){
   		$("#selUsersForm").submit(function(e){
   			e.preventDefault();
   			var data = {};
			getBaseURL(1,function(baseurl){
	   			var users = $("#selectedUsers").val();
	   			users = users.split(';');
				url = baseurl;
				data.users = users;
//				console.log(document.domain);
				data.location = url;
				var groupID = $("#lightBoxMain").data('groupid');
				data.groupID = groupID;
				post(data, url+'inviteUsers' ,function(data){
					if(data.success){
						$("#overlay").remove();
			   			$("#lightBox").remove();
			   	   		$("#wrapper").append('<div id="overlay"></div>');
			   	   		if(!data.success){
			   	   			$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div id="lightBoxMain"><div class="headline"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/user-32.png" class="headlineImage" alt="Register"><h1>Failure</h1></div><div class="content">\
			   	    						<label>'+ data.error +'</label></div></div></div>');
			   	   		}else{
			   	   			$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div id="lightBoxMain"><div class="headline"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/user-32.png" class="headlineImage" alt="Register"><h1>User Successfully added</h1></div><div class="content">\
	   	    						<label>The given User are now added to the group.</label></div></div></div>');
			   	   		}
						$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
				   		$(".close").click(function(){
				   			window.location.reload();
				   		});
					}else{
						$("#waitImg").remove();
						$("#err").remove();
						$("#invitebtn").after('<div id="err" class="errorUp"><span class="arrowUp"></span><span lang="en">' + data.error +'</span></div>');
						$(".errorUp").delay(2000).fadeOut(1000);
						//console.log(data.error);
					}
				});
			});
   			
   			
   		});
   		
   		
   	};
   	
    function  handler2 (){
   		$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
   		
   		$(".close").click(function(){
   			first = true;
   			document.location.reload();
			$("#overlay").remove();
			$("#lightBox").remove();
		});
			
		$(".options").click(function(){
//			console.log($(this).parent().parent().find('#userEmail').data('mail'));
			//console.log();
			if(!($("#overlayOptions").length > 0)) {
				if($(this).parent().parent().find('#userEmail').data('toinvite')){
					$(this).parent().append('<div id="overlayOptions" data-groupid="'+$(this).parent().parent().find('#options').data('groupid')+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/arrow.png"'+
							'class="arrow"><ul><li><a href="mailto:'+$(this).parent().parent().find('#userEmail').data('mail') +'" id="mail"><img src="./static/plugins/ep_user_pad_frontend/static/images/mail-16.png" '+
							'alt="Send a Mail" class="smallIcon" >Mail</a></li><li><a href="" id="reinvite" data-groupid="'+$(this).parent().parent().find('#options').data('groupid')+'" data-username="'+ $(this).parent().parent().find('#userEmail').data('mail')+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/backarrow-16.png" class="smallIcon">Reinvite</a></li><li><a href="" id="deleteNotRegUser" data-groupid="'+$(this).parent().parent().find('#options').data('groupid')+'" data-username="'+ $(this).parent().parent().find('#userEmail').data('mail') +'"><img src="./static/plugins/ep_user_pad_frontend/static/images/close-red-16.png"'+
							'alt="Delete User" class="smallIcon" ><span class="red">Delete<span></a></li></ul></div></div>');
				}
				else if($('#Gruppe' + $(this).data('groupid')).data('role') == 1){
					$(this).parent().append('<div id="overlayOptions" data-groupid="'+$(this).parent().parent().find('#options').data('groupid')+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/arrow.png"'+
							'class="arrow"><ul><li><a href="mailto:'+$(this).parent().parent().find('#userEmail').data('mail') +'" id="mail"><img src="./static/plugins/ep_user_pad_frontend/static/images/mail-16.png" '+
							'alt="Send a Mail" class="smallIcon" >Mail</a></li><li><a href="" id="makeOwner" data-userid="'+ $(this).parent().parent().find('#userEmail').data('userid') +'">'+
							'<img src="./static/plugins/ep_user_pad_frontend/static/images/flag-16.png" alt="Make this person Owner" '+
							'class="smallIcon" >Make Owner</a></li><li><a href="" id="deleteUser" data-userid="'+ $(this).parent().parent().find('#userEmail').data('userid') +'"><img src="./static/plugins/ep_user_pad_frontend/static/images/close-red-16.png"'+
							'alt="Delete User" class="smallIcon" ><span class="red">Delete<span></a></li></ul></div></div>');
				}else if($('#Gruppe' + $(this).data('groupid')).data('role') == 2){
					$(this).parent().append('<div id="overlayOptions" data-groupid="'+$(this).parent().parent().find('#options').data('groupid')+'"><img src="./static/plugins/ep_user_pad_frontend/static/images/arrow.png"'+
							'class="arrow"><ul><li><a href="mailto:'+$(this).parent().parent().find('#userEmail').data('mail') +'" id="mail"><img src="./static/plugins/ep_user_pad_frontend/static/images/mail-16.png" '+
							'alt="Send a Mail" class="smallIcon" >Mail</a></li></ul></div></div>');					
				}
				$("#reinvite").click(function(e){
					e.preventDefault();
					var username = $(this).data('username');
					var groupID = $(this).data('groupid');
					var data = {};
					var url;
					getBaseURL(1,function(baseurl){
						url = baseurl;
						data.username= username;
						data.groupID = groupID;
						data.location = url;
						post(data, url+'reinviteUser' ,function(data){
							if(data.success){
								document.location.reload();
							}else{
								//console.log(data.error);
			    				$("#overlay").remove();
			    				$("#lightBox").remove();
							}
						});
					});
				});
				
				$("#deleteNotRegUser").click(function(e){
					e.preventDefault();
					var username = $(this).data('username');
					var groupID = $(this).data('groupid');
					var data = {};
					var url;
					getBaseURL(1,function(baseurl){
						url = baseurl;
						data.username= username;
						data.groupID = groupID;
						post(data, url+'deleteNotRegUser' ,function(data){
							if(data.success){
								document.location.reload();
							}else{
								//console.log(data.error);
			    				$("#overlay").remove();
			    				$("#lightBox").remove();
							}
						});
					});
				});
				
				
				
				$("#makeOwner").click(function(e){
					e.preventDefault();
					var userID = $(this).data('userid');
					var userFullName = $(this).parent().parent().parent().parent().parent().find('#userEmail').html();
					var groupID = $(this).parent().parent().parent().parent().find('#overlayOptions').data('groupid');
					$("#lightBox").remove();
    				
					//$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"></span></div><div id="lightBoxMain"><div class="headline"><img src="images/close-red-32.png" class="headlineImage" alt="Delete"><h1 lang="en" class="red">Delete not possible</h1></div><div class="content"><p>Delete not possible, because you have groups where you are owner.<br>Change ownership!</p></div></div></div>');
		    		$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close">'+
		    							'<img src="./../../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png">'+
		    							'</span></div><div id="lightBoxMain"><div class="headline">'+
		    							'</h1>Note: If you make the user \'' + userFullName + '\' to the owner of this group, you loose the possibility to delete the group, its users and its pads. Are you sure?</div><div class="content"><button id="makeOwnBtn" lang="en"'+
		    							'class="marginRight">Yes</button><button id="cancelBtn" lang="en">Cancel</button></div></div></div>');
		    		$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
		    		
		    		$("#makeOwnBtn").click(function(e){
						e.preventDefault();
						var data = {};
						var url;
						getBaseURL(1,function(baseurl){
							url = baseurl;
							data.userID= userID;
							data.groupID = groupID;
							post(data, url+'makeOwner' ,function(data){
								if(data.success){
									document.location.reload();
								}else{
									//console.log(data.error);
				    				$("#overlay").remove();
				    				$("#lightBox").remove();
								}
							});
						});
		    			
		    		});
		    		
		    		$("#cancelBtn").click(function(){
		    			$("#overlay").remove();
		       			$("#lightBox").remove();
		       			document.location.reload();
		    		});
		    		
		    		// click-event for the closing of the lightBox		
		    		$(".close").click(function(){
		    			$("#overlay").remove();
		    			$("#lightBox").remove();
		    			document.location.reload();
		    		});
				});
				
				$("#deleteUser").click(function(e){
					e.preventDefault();
					var userID = $(this).data('userid');
					var groupID = $(this).parent().parent().parent().parent().find('#overlayOptions').data('groupid');
					var data = {};
					var url;
					getBaseURL(1,function(baseurl){
						url = baseurl;
						data.userID= userID;
						data.groupID = groupID;
						post(data, url+'deleteUserFromGroup' ,function(data){
							
							if(data && data.success){
								document.location.reload();
							}else{
								//console.log(data.error);
			    				$("#overlay").remove();
			    				$("#lightBox").remove();
							}
						});
					});
				});
				
				$("#reinvite").click(function(e){
					e.preventDefault();
					//var userID = $(this).data('title');
					//var groupID = $(this).parent().parent().parent().parent().find('#overlayOptions').attr('title');
//					console.log(userID);
//					console.log(groupID);
				});
				
			} else {
				$("#overlayOptions").remove();
			}
   		}); 
   			
   		$(document).click(function(e){
   			if(!$(".options").is(e.target)) {
   				$("#overlayOptions").remove();
   			}
   		});    		
   	};
   	
   	function handler(){
		
				
		$('#searchU').keyup(function(){
		/// search
    	$(".content table tr").each(function(){
    		if($(this).children("td.first").children("a").html().match($("#searchU").val())) {
    			$(this).show();
    			$(this).addClass("visible")
    		} else {
    			$(this).removeClass("visible")
    			$(this).hide();
    		}
    	});
    				
    	// set color of the rows new after the search results are showen
    	i = 0;
    	$(".content table tr").each(function(){
    		$(this).removeClass("odd");
    		if($(this).css("display") == "table-row") {
    			if(i % 2 == 0) {
    				$(this).addClass("odd")
    			}
    			i++;
    		}
    	});
    		
    	if($('#searchU').val().length == 0) {
			buildPage(0);	
		}
		
		initPaging(6);
		/*e.preventDefault();
//		console.log('enter');
		var data = {};
			
		var url;
		getBaseURL(1,function(baseurl){
			url = baseurl;
			data.searchterm= $('#search').val();
			data.location = url;
			post(data, url+'groupsSearchTerm' ,function(data){
				$('#table').html(data);
				$(document).ready();
			});
		});*/
		
	});
	
	/*
	 * Pageing
	 *
	 */
	 
	rowsize = 6;
    			
    initPaging(rowsize);
    			
    // jump to the next page
    $("#nextPageU").click(function(){
    	page++;
    	buildPage(page);
		
    	if($(".content table tr.visible").length <= (page+1)*rowsize){
    		$("#nextPageU").hide();
    	}
    	
    	$("#previousPageU").show();
    	if($(".content table tr.visible").length > rowsize+page*rowsize){
    		updatePaging(page*rowsize+1,rowsize+page*rowsize)
    	}else{
    		updatePaging(page*rowsize+1,$(".content table tr.visible").length)
    	}
    });
    			
    // jump to the previous page
    $("#previousPageU").click(function(){
    	page--;
    	buildPage(page);
		
    	if(page == 0) {
    		$("#previousPageU").hide();
    	}
   		
    	$("#nextPageU").show();
    	updatePaging(page*rowsize+1,rowsize+page*rowsize)
    });
	
	/*
	 * Build the Page depending on the pageview number
	 */
	function buildPage(page){
		i=0;
		$(".content table tr.visible").each(function(){
    		if(i >= (page*rowsize) && i <= ((rowsize-1) + page*rowsize)) {
    			$(this).show();
    		}else {
    			$(this).hide();
    		}
    		i++;
    	});
	}
			
	/*
	 * Update the value for the Paging
	 */
	function updatePaging(currentPage,currentPageCount) {
		$("#currentPageU").html(currentPage);
		$("#currentPageCountU").html(currentPageCount);
	}
	
	/*
	 * Initalize the Paging
	 */
	function initPaging(rowsize) {
		// initalize the paging view
		//console.log(rowsize);
		page = 0;
		$("#nextPageU").hide();
		$("#previousPageU").hide();	
		
		// set the correct start value for the pagging
		if($(".content table tr.visible").length > rowsize){
			$("#nextPageU").show();
			updatePaging(1,rowsize)
		} else if($(".content table tr.visible").length == 0){
			updatePaging(0,$(".content table tr.visible").length)
		} else {		
			updatePaging(1,$(".content table tr.visible").length)
		}
				
		// build first page
		buildPage(page);
				
		// set the value for the number of rows
		$("#pageCountU").html($(".content table tr.visible").length);
	}
		/*$('#searchUser').keypress(function(e){
//			console.log('clicked herer jköfdsföa');
			if(e.which == 13){
				e.preventDefault();
				var data = {};
				var url;
				getBaseURL(1,function(baseurl){
					url = baseurl;
					data.searchterm= $('#searchUser').val();
					data.location = url;
					var groupID = $("#lightBoxMain").data('groupid');
					var selectUsers = $("#selectedUsers").val();
					
					data.groupID = groupID;
					post(data, url+'userSearchTerm' ,function(data){
						if(data.success){
							createUserManagement(data.users, selectUsers, groupID ,function(val){
								$("#overlay").remove();
			    				$("#lightBox").remove();
								$("#wrapper").append('<div id="overlay"></div>');
								$("#wrapper").append(val);
								handler();
								handler2();
								$(document).ready();
							});
						}else{
							console.log(data.error);
		    				$("#overlay").remove();
		    				$("#lightBox").remove();
						}
					});
				});
			}else{
//				console.log('not enter');
			}
		});*/ 		
   		
   	};
		
   	
	$(".groupDetails").click(function(e){
		if(first){
//			console.log('clicked the groupDetails');
			var data = {};
			var url;
			getBaseURL(1,function(baseurl){
				url = baseurl;
				data.searchterm= '';
				data.location = url;
				var groupID = $(e.currentTarget).data('groupid');
				data.groupID = groupID;
				post(data,url+'userSearchTerm',function(data){
//					console.log(data);
					if(data.success){
						createUserManagement(data.users, "", groupID , function(val){
							$("#wrapper").append('<div id="overlay"></div>');
							$("#wrapper").append(val);
							handler();
							handler2();
							submitHandler();
							first = false;
							$(document).ready();
						});
					}else{
//						console.log('user not owner');
		    			$("#overlay").remove();
		    			$("#lightBox").remove();
					}
				});
			});
		}else{
			handler();
			handler2();
			submitHandler();
		}
    });
    
    /*
     * Group
     * 
     */
	
	
//    $(".unlock").click(function(){
//    	$("#wrapper").append('<div id="overlay"></div>');
//   		$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="./static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div id="lightBoxMain">'+
//   				'<div class="headline"><img src="./../static/plugins/ep_user_pad_frontend/static/images/lock-cyan-32.png" '+
//   				'class="headlineImage" alt="Set Password"><h1 lang="en">Set Password</h1></div><div class="content">'+
//   				'<h3 lang="en">Set Password for "' + $(this).attr('title') + '"</h3><form id="unlockPadSubmit" title="'+$(this).attr('title')+'" name="'+$(this).attr('id')+
//   				'"><input id="passwordval" type="password" lang="en" placeholder="Password"'+
//   				'class="marginRight"><button  >'+
//   				'Set</button></form></div></div></div>');
//   		
//   		$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
//   		
//  		$(".close").click(function(){
//   			$("#overlay").remove();
//   			$("#lightBox").remove();
//    	});
//  		
//  	    $("#unlockPadSubmit").submit(function(e){
//  	    	e.preventDefault();
//  	    	var data = {};
//  			data.groupId = $(this).attr('name');
//  			data.padName = $(this).attr('title');
//  			data.pw = $("#passwordval").val();
////  			console.log(data);
//  	    	
//			var url;
//			getBaseURL(2,function(baseurl){
//				url = baseurl;
//				data.location = url;
////				console.log(url+'setPassword');
//				post(data, url+'setPassword' ,function(data){
//					if(data.success){
////							console.log('here!!');
//							window.location.reload();
//							
//						}else{
//							console.log(data.error);
//					}	
//				});
//			});
//  	    });
//    });
//    
//
//		
//   	$(".lock").click(function(){
//   		$("#wrapper").append('<div id="overlay"></div>');
//   		$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="./static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div'+
//   				'id="lightBoxMain"><div class="headline"><img src="./../static/plugins/ep_user_pad_frontend/'+
//   				'static/images/close-red-32.png" class="headlineImage" alt="Delete"><h1 lang="en" class="red">Delete'+
//   				' Password</h1></div><div class="content"><button lang="en" class="marginRight" id="lockPadButton"'+
//   				'title="'+$(this).attr('title')+'" name="'+$(this).attr('id')+
//   				'">Delete</button><button '+
//   				'lang="en" id = "cancelUnlock">Cancel</button></div></div></div>');
//    	$("#lightBox").css("margin-top",-$("#lightBox").height()/2);
//   		
//   		$(".close").click(function(){
//   			$("#overlay").remove();
//   			$("#lightBox").remove();
//   		});
//   		
//   		$("#cancelUnlock").click(function(){
////   			console.log("clicked");
//   			$("#overlay").remove();
//   			$("#lightBox").remove();
//   		});
//   		
//  	    $("#lockPadButton").click(function(){
////  	    	console.log('clicked here');
//  	    	var data = {};
//  			data.groupId = $(this).attr('name');
//  			data.padName = $(this).attr('title');
//  			data.pw = null;
////  			console.log(data);
//  			var url;
//			getBaseURL(2,function(baseurl){
//				url = baseurl;
//				data.location = url;
////				console.log(url+'setPassword');
//				post(data, url+'setPassword' ,function(data){
//					if(data.success){
//  						window.location.reload();	
//  					}else{
//  						console.log(data.error);
//  					}	
//				});
//			});
//  	    });
//   	});
   	
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
  	
	$('#logout').click(function(e){
		e.preventDefault();
//	    console.log('logging out');
		var data = {};
		var url;
		getSlice(function(slice){
			getBaseURL(slice,function(baseurl){
				url = baseurl;
				data.location = url;
//				console.log(url + 'logout');
				post(data, url+'logout' ,function(data){
//					console.log(data);
//					console.log('here');
					if(data){
//						console.log('here');
						window.location = url+"index.html";
						//window.location.reload();
					}else{
						console.log("Something went wrong");
					}	
				});
			});
		});


	});
	
	$('#search').keyup(function(){
		/// search
    	$(".inputBlock table tr").each(function(){
    		if($(this).children("td.first").children("a").html().match($("#search").val())) {
    			$(this).show();
    			$(this).addClass("visible")
    		} else {
    			$(this).removeClass("visible")
    			$(this).hide();
    		}
    	});
    				
    	// set color of the rows new after the search results are showen
    	i = 0;
    	$(".inputBlock table tr").each(function(){
    		$(this).removeClass("odd");
    		if($(this).css("display") == "table-row") {
    			if(i % 2 == 0) {
    				$(this).addClass("odd")
    			}
    			i++;
    		}
    	});
    		
    	if($('#search').val().length == 0) {
			buildPage(0);	
		}
		
		initPaging(rowsize);
		/*e.preventDefault();
//		console.log('enter');
		var data = {};
			
		var url;
		getBaseURL(1,function(baseurl){
			url = baseurl;
			data.searchterm= $('#search').val();
			data.location = url;
			post(data, url+'groupsSearchTerm' ,function(data){
				$('#table').html(data);
				$(document).ready();
			});
		});*/
		
	});
	
	/*
	 * Pageing
	 *
	 */
	 
	rowsize = 6;
    			
    initPaging(rowsize);
    			
    // jump to the next page
    $("#nextPage").click(function(){
    	page++;
    	buildPage(page);
		
    	if($(".inputBlock table tr.visible").length <= (page+1)*rowsize){
    		$("#nextPage").hide();
    	}
    	
    	$("#previousPage").show();
    	if($(".inputBlock table tr.visible").length > rowsize+page*rowsize){
    		updatePaging(page*rowsize+1,rowsize+page*rowsize)
    	}else{
    		updatePaging(page*rowsize+1,$(".inputBlock table tr.visible").length)
    	}
    });
    			
    // jump to the previous page
    $("#previousPage").click(function(){
    	page--;
    	buildPage(page);
		
    	if(page == 0) {
    		$("#previousPage").hide();
    	}
   		
    	$("#nextPage").show();
    	updatePaging(page*rowsize+1,rowsize+page*rowsize)
    });
	
	/*
	 * Build the Page depending on the pageview number
	 */
	function buildPage(page){
		i=0;
		$(".inputBlock table tr.visible").each(function(){
    		if(i >= (page*rowsize) && i <= ((rowsize-1) + page*rowsize)) {
    			$(this).show();
    		}else {
    			$(this).hide();
    		}
    		i++;
    	});
	}
			
	/*
	 * Update the value for the Paging
	 */
	function updatePaging(currentPage,currentPageCount) {
		$("#currentPage").html(currentPage);
		$("#currentPageCount").html(currentPageCount);
	}
	
	/*
	 * Initalize the Paging
	 */
	function initPaging(rowsize) {
		// initalize the paging view
		page = 0;
		$("#nextPage").hide();
		$("#previousPage").hide();	
		
		// set the correct start value for the pagging
		if($(".inputBlock table tr.visible").length > rowsize){
			$("#nextPage").show();
			updatePaging(1,rowsize)
		} else if($(".inputBlock table tr.visible").length == 0){
			updatePaging(0,$(".inputBlock table tr.visible").length)
		} else {		
			updatePaging(1,$(".inputBlock table tr.visible").length)
		}
				
		// build first page
		buildPage(page);
				
		// set the value for the number of rows
		$("#pageCount").html($(".inputBlock table tr.visible").length);
	}
	
	$('#searchPads').keypress(function(e){
		
		if(e.which == 13){
			e.preventDefault();
//			console.log('enter');
			var data = {};
			var url;
			getBaseURL(2,function(baseurl){
				url = baseurl;
				data.searchterm= $('#searchPads').val();
				data.groupId = $('#searchPads').data('groupid');
				data.location = url;
				post(data, url+'padSearchTerm' ,function(data){
					if(data.success){
						$('#tablePads').html(data.html);
						$(document).ready();
					}else{
						console.log(data.error);
					}
				});
			});
		}else{
//			console.log('not enter');
		}
	});
	
	$('#openPublicPad').click(function(e){
		e.preventDefault();
		var padname = $('#openPadName').val();
//		console.log('here');
		if(padname.length > 0) {
			window.location = "public_pad/" + padname;
		} else {
			$("#openPadName").parent().append('<div class="errorUp"><span class="arrowUp"></span><span lang="en">Please enter a name</span></div>');
			$(".errorUp").delay(2000).fadeOut(1000);
		}
	});
	
	$('#createPublicPadByName').click(function(e){
		e.preventDefault();
		var padname = $('#createPadName').val();
		if(padname.length > 0) {
			window.location = "public_pad/" + padname;
		} else {
			$("#createPublicPadByName").after('<div class="errorUp"><span class="arrowUp"></span><span lang="en">Please enter a name</span></div>');
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
    
	$('#createPublicPadRandomName').click(function(e){
		e.preventDefault();
		//console.log('here created');
		window.location = "public_pad/" + randomPadName();
	});
    
	$('#createPrivateGroupForm').submit(function(e){
		e.preventDefault();
		var data = {};
		var url;
		getBaseURL(1,function(baseurl){
			url = baseurl;
			data.location = url;
			data.groupName = $("#groupName").val();
//			console.log(url);
			post(data, url+'createGroup' ,function(data){
				if(!data.success){
					if(data.error == "Group Name not defined"){
						console.log(data.error);
					}
					$("#createPrivateGroupForm input").each(function(){
						if($(this).next().hasClass("errorUp"))
							$(this).next().remove();
						//if($(this).is('#createPrivateGroup') && !$(this).next().hasClass("errorUp") && data.error == 'Group already exists');
							$(this).parent().append('<div class="errorUp"><span class="arrowUp"></span><span lang="en">' + data.error +'</span></div>');
							$("#createPrivateGroupForm .errorUp").delay(2000).fadeOut(1000);
					});
				}else{
                                    //console.log(data);
                                    $("#groupName").val('');
                                    $("#wrapper").append('<div id="overlay"></div>');
                                    $("#wrapper").append('<div id="lightBox">'+
                                            '<div id="lightBoxMain" data-groupid= "'+ data.groupid+'" ><div class="headline"></div><div class="content"><h3 lang="en">Creando Grupo</h3></div></div></div>');
                                        
                                    $("#lightBox").css("margin-top",-$("#lightBox").height()/2);

                                    window.location.reload();
				};
			});
		});
	});
	$('#createPrivateGroupPad').click(function(e){
		e.preventDefault();
//		console.log('test');
		var data = {};
		var url;
		var loc;
		getBaseURL(2,function(baseurl){
			loc = document.location;
			url = baseurl;
//			console.log("heraöjdfö");
			data.location = url;
			data.padName = $("#createGroupPad").val();
			data.groupId = $("#createPrivateGroupPad").data('groupid');
//			console.log(data);
			post(data, url+'createPad' ,function(data){
				if(!data.success){
					console.log(data.error);
					$("#createPrivatePadForm input").each(function(){
						if($(this).next().hasClass("errorUp"))
							$(this).next().remove();
						//if($(this).is('#createPrivateGroup') && !$(this).next().hasClass("errorUp") && data.error == 'Group already exists');
							$(this).parent().append('<div class="errorUp"><span class="arrowUp"></span><span lang="en">' + data.error +'</span></div>');
							$("#createPrivatePadForm .errorUp").delay(2000).fadeOut(1000);
					});
				}else{
                                    $("#groupName").val('');
                                    $("#wrapper").append('<div id="overlay"></div>');
                                    $("#wrapper").append('<div id="lightBox">'+
                                            '<div id="lightBoxMain" data-groupid= "'+ data.groupid+'" ><div class="headline"></div><div class="content"><h3 lang="en">Creando Pad</h3></div></div></div>');

                                    $("#lightBox").css("margin-top",-$("#lightBox").height()/2);

					window.location = loc;
				}						
			});
		});
	});
	
	

	
	$('.padClick').click(function(e){
		e.preventDefault();
//		console.log('here we are');
		var groupId = $(this).data('groupid');
//		console.log(groupId);
		var padname = $(this).data('name');
//		console.log(padname);
		var data = {};
		var url;
		getBaseURL(2,function(baseurl){
//			console.log('adfklöajk');
			url = baseurl;
//			console.log(url);
			data.location = url;
			data.groupId = groupId;
			data.padname = padname;
			console.log(data);
			post(data, url+'directToPad' ,function(data){
				document.cookie = "sessionID="+ data.session +"; path=/";
				window.location = window.location + "/pad/" + data.group + "$" + data.pad_name;
			});
		});
	});



/*************************USERS FUNCTIONS***********************/



        $('#InviteUserForm').submit(function(e){
                e.preventDefault();
//              console.log('test');
                var data = {};
                var url;
                var loc;
                getBaseURL(2,function(baseurl){
                        loc = document.location;
                        url = baseurl;
                      console.log(url);
                        data.location = url;
                        data.userEmail = $("#email").val();
                        data.groupId = $("#InviteUserToGroupForm").data('groupid');
                        data.UserRole = $("#userRole").val();
//                      console.log(data);
                        post(data, url+'inviteUsers' ,function(data){
                                if(!data.success){
                                        console.log(data.error);
                                        $("#InviteUserForm input").each(function(){
                                                if($(this).next().hasClass("errorUp"))
                                                        $(this).next().remove();
                                                        $(this).parent().append('<div class="errorUp"><span class="arrowUp"></span><span lang="en">' + data.error +'</span></div>');
                                                        $("#InviteUserForm .errorUp").delay(2000).fadeOut(1000);
                                        });
                                }else{
//                                    $("#groupName").val('');
                                    $("#wrapper").append('<div id="overlay"></div>');
                                    $("#wrapper").append('<div id="lightBox">'+
                                            '<div id="lightBoxMain" data-groupid= "'+ data.groupId+'" ><div class="headline"></div><div class="content"><h3 lang="en"class="center">Sending invitation</h3></div></div></div>');

                                    $("#lightBox").css("margin-top",-$("#lightBox").height()/2);

                                        window.location = loc;
                                }
                        });
                });
        });


        $("#formEtherpadConfirm").submit(function(e) {
                e.preventDefault();
                var url;
                getBaseURL(2,function(baseurl){
                        var data = {};
                        url = baseurl;
                        data.email = $("#email").val();
                        data.username =$("#username").val();
                        data.password = $("#password").val();
                        data.fullname = $("#fullname").val();
                        data.passwordrepeat = $("#passwordrepeat").val();
                        data.tok = $("#tok").val();
                        data.location = url;
                        console.log(data.location); 
                        console.log(document.location);
                        post(data, url+'confirminvitation' ,function(data){
                                        if(data.success){
                                                window.location = url + "login?act=ok";
                                        } else{
                                                console.log(data.error);
                                                $("#wrapper").find(".errorRight").remove();
                                                $("#formEtherpadConfirm input").each(function(){
                                                        if($(this).is('#email') && (data.error == 'No valid E-Mail' || data.error == 'You need a valid invitation' )) {
                                                                $(this).after('<div class="errorRight"><span class="arrowRight"></span>><span lang="en">' + data.error +'</span></div>');
                                                        }
                                                        if($(this).is('#username') && (data.error == 'Username not available' )) {
                                                                $(this).after('<div class="errorRight"><span class="arrowRight"></span>><span lang="en">' + data.error +'</span></div>');
                                                        }

                                                        if($(this).is('#password') && ( data.error == 'Passwords do not match' || data.error == 'Password is empty' ) ) {
                                                                $(this).after('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');
                                                        }

                                                });
                                                if(data.error == 'Unable to activate user'){
                                                     $("#inner").before('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');

                                                }


//                                              console.log(data);
                                        }
                        });
        });
        });


      $('td.userGroupRole').each(function(){
          var roleid = $(this).data('usergrouprole');
          
          var textrole = userRole(roleid)
            $(this).addClass(textrole);
            $(this).html('');
            $(this).html(textrole);
            console.log('textrole ' + textrole + ' idrole ' + roleid );  
      });
            






/***************************END USER FUNCTIONS****************************/


	
   	$("#register").click(function(){
   		$("#wrapper").append('<div id="overlay"></div>');
    	$("#wrapper").append('<div id="lightBox"><div id="lightBoxHeader"><span class="close"><img src="../../static/plugins/ep_user_pad_frontend/static/images/close-cyan-12.png"></span></div><div id="lightBoxMain"><div class="headline"><img src="./../../static/plugins/ep_user_pad_frontend/static/images/user-32.png" class="headlineImage" alt="Register"><h1>Register</h1></div><div class="content">\
   							  <form id="formEtherpadRegister">\
    						  <label for="fullname">Full Name</label><div class="inputfield marginBottom"><input type="text" name="fullname" id="fullname" class="smallMarginBottom"></div>\
    						  <label for="email">E-Mailaddress</label><div class="inputfield marginBottom"><input type="text" name="email" id="email" class="smallMarginBottom"></div>\
    						  <label for="password">Password</label><div class="inputfield"><input type="password" name="password" id="password" placeholder="Password" class="smallMarginBottom"></div><div class="inputfield marginBottom"><input type="password" name="passwordrepeat" id="passwordrepeat" placeholder="Repeat Password" class="smallMarginBottom"></div>\
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
    		getBaseURL(function(baseurl){
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
					if(data.success)
						window.location = "index.html";
					else{
						console.log(data.error);
						$("#formEtherpadRegister input").each(function(){
							if($(this).next().hasClass("errorRight"))
								$(this).next().remove();
							if($(this).is('#email') && !$(this).next().hasClass("errorRight") && (data.error == 'User already Exists' || data.error == 'No valid E-Mail')) {
								$(this).parent().append('<div class="errorRight"><span class="arrowRight"></span>><span lang="en">' + data.error +'</span></div>');
								$(".errorRight").delay(2000).fadeOut(1000);
							}
							if($(this).is('#password') && !$(this).next().hasClass("errorRight") && data.error == 'Passwords do not agree') {
								$(this).parent().append('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');
								$(".errorRight").delay(2000).fadeOut(1000);
							}

						});
//						console.log(data);
					}
				},
				error: function (xhr, ajaxOptions, thrownError) {
					console.log(thrownError);
				}
			});
    	});
    	});
    	
    });
	
	
});


