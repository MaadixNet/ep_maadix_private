/*Author: Maadix.net - https://github.com/MaadixNet

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.
This program is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
     GNU General Public License for more details.

     see <http://www.gnu.org/licenses/>.
*/

/* Scripts that need or can  be run at the end of the page
 * */


var setPw = function(groupId, padName, Password){
//      console.log(groupId);


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
//                              console.log('success'); 
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

jQuery(document).ready(function(){
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


        $("#formEtherpadEditProfile").submit(function(e) {
                e.preventDefault();
                var url;
                        var data = {};
                        //url = baseurl;
                        url = $("#baseurl").val();
                        data.userid = $("#userid").val();
                        data.email = $("#email").val();
                        data.username =$("#username").val();
                        data.password = $("#password").val();
                        data.fullname = $("#fullname").val();
                        data.passwordrepeat = $("#passwordrepeat").val();
                        data.location = url;
                        console.log(data.location);
                        console.log(document.location);
                        post(data, url+'/updateprofile' ,function(data){
                                        if(data.success){
                                                window.location = document.location;
                                        } else{
                                                console.log(data.error);
                                                $("#wrapper").find(".errorRight").remove();
                                                $("#formEtherpadEditProfile input").each(function(){
                                                        if($(this).is('#email') && (data.error == 'No valid E-Mail' || data.error == 'There is another account with this email' )) {
                                                                $(this).after('<div class="errorRight"><span class="arrowRight"></span>><span lang="en">' + data.error +'</span></div>');
                                                        }
                                                        if($(this).is('#username') && (data.error == 'Username not available' )) {
                                                                $(this).after('<div class="errorRight"><span class="arrowRight"></span>><span lang="en">' + data.error +'</span></div>');
                                                        }

                                                        if($(this).is('#password') && ( data.error == 'Passwords do not match' || data.error == 'Password is empty' ) ) {
                                                                $(this).after('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');
                                                        }

                                                });
                                                if(data.error == 'Unable to update user' || data.error == 'You are not allowed to edit this user'){
                                                     $("#inner").before('<div class="errorRight"><span class="arrowRight"></span><span lang="en">' + data.error +'</span></div>');

                                                }


//                                              console.log(data);
                                        }
                        });
        });



        //Function to create a new Group. Used in dashboard.ejs
        $('#createPrivateGroupForm').submit(function(e){
                e.preventDefault();
                var data = {};
                var url;
                getBaseURL(1,function(baseurl){
                        url = baseurl;
                        data.location = url;
                        data.groupName = $("#groupName").val();
//                      console.log(url);
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

        //Function to add a private pad to a group, used in group.ejs
        $('#createPrivateGroupPad').click(function(e){
                e.preventDefault();
//              console.log('test');
                var data = {};
                var url;
                var loc;
                getBaseURL(2,function(baseurl){
                        loc = document.location;
                        url = baseurl;
//                      console.log("heraöjdfö");
                        data.location = url;
                        data.padName = $("#createGroupPad").val();
                        data.groupId = $("#createPrivateGroupPad").data('groupid');
//                      console.log(data);
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

        //Function to go to pad iframe - Used in group.ejs
        $('.padClick').click(function(e){
                e.preventDefault();
//              console.log('here we are');
                var groupId = $(this).data('groupid');
//              console.log(groupId);
                var padname = $(this).data('name');
//              console.log(padname);
                var data = {};
                var url;
                getBaseURL(2,function(baseurl){
//                      console.log('adfklöajk');
                        url = baseurl;
//                      console.log(url);
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
                        data.UserRole =$('input[name=userRole]:radio:checked').val();
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
      
      $('select#changeRole').on('change', function() {
          $(this).after("<span class='updatestatus inprogress'>Loading</span>");
          var data = {};
          data.userid=$(this).data('userid');
          data.groupId=$(this).data('groupid');
          data.newrole= $(this).val();
          data.baseurl=$('#baseurl').val();
          var loc=  document.location;
          post(data, data.baseurl +'/updateUserRole' ,function(data){
             
                if(data.success){
                        //window.location =  loc;
                        $('span.updatestatus').addClass("success").html("Role changed").delay(2000).fadeOut(1000);
                } else{
                  console.log(data.error);
                        $('span.updatestatus').addClass("error").html(data.error).delay(2000).fadeOut(1000);
                }
 
          });

          console.log('Sata are ' + data);
     });

      $("option.newrole").each(function(){

          var roleid = $(this).val();
          var textrole = userRole(Number(roleid));
          
          $(this).html('');
          $(this).html(textrole);
      });  



      $('td.userGroupRole').each(function(){
          var roleid = $(this).data('usergrouprole');

          var textrole = userRole(roleid);
            var span = $(this).find (".textrole");
            $(span).addClass(textrole);
            $(span).html('');
            $(span).html(textrole);
      });





    $(':input').each(function(){
      $(this).removeAttr('readonly');
    });


});
