/* Copyright 2014 Alexander Oberegger
 * Copyright 2017 Pablo Castellano

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

var path = require('path');
var eejs = require('ep_etherpad-lite/node/eejs');
var padManager = require('ep_etherpad-lite/node/db/PadManager');
var db = require('ep_etherpad-lite/node/db/DB').db;
var ERR = require("ep_etherpad-lite/node_modules/async-stacktrace");
var groupManager = require('ep_etherpad-lite/node/db/GroupManager');
var Changeset = require('ep_etherpad-lite/static/js/Changeset');
var mysql = require('mysql');
var email = require('emailjs');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
var sessionManager = require('ep_etherpad-lite/node/db/SessionManager');
var crypto = require('crypto');
var pkg = require('./package.json');
var formidable = require("formidable");

var eMailAuth = require(__dirname + '/email.json');
var dbAuth = settings.dbSettings;
var dbAuthParams = {
    host: dbAuth.host,
    user: dbAuth.user,
    password: dbAuth.password,
    database: dbAuth.database,
    insecureAuth: true,
    stringifyObjects: true
};

var DEBUG_ENABLED = false;

encryptPassword = function (password, salt, cb) {
    var encrypted = crypto.createHmac('sha256', salt).update(password).digest('hex');
    cb(encrypted);
};

/*
 *  Common Utility Functions
 */
var log = function (type, message) {
    if (typeof message == 'string') {
        if (type == 'error') {
            console.error(pkg.name + ': ' + message);
        } else if (type == 'debug') {
            if (DEBUG_ENABLED) {
                console.log('(debug) ' + pkg.name + ': ' + message);
            }
        } else {
            console.log(pkg.name + ': ' + message);
        }
    }
    else console.log(message);
};

var mySqlErrorHandler = function (err) {
    log('debug', 'mySqlErrorHandler');
    // TODO: Review error handling
    var msg;
    if ('fileName' in err && lineNumber in err) {
        msg = 'MySQLError in ' + err.fileName + ' line ' + err.lineNumber + ': ';
    } else {
        msg = 'MySQLError: ';
    }
    if (err.fatal) {
        msg += '(FATAL) ';
    }
    msg += err.message;
    log('error', msg);
};

var connectFkt = function (err) {
    if (err) {
        log('error', "failed connecting to database");
    } else {
        log('info', "connected");
    }
};

var connection = mysql.createConnection(dbAuthParams);
var connection2 = mysql.createConnection(dbAuthParams);
connection.connect(connectFkt);
connection2.connect(connectFkt);


function createSalt(cb) {
    var mylength = 10;
    var myextraChars = '';
    var myfirstNumber = true;
    var myfirstLower = true;
    var myfirstUpper = true;
    var myfirstOther = false;
    var mylatterNumber = true;
    var mylatterLower = true;
    var mylatterUpper = true;
    var mylatterOther = false;

    var rc = "";
    if (mylength > 0) {
        rc += getRandomChar(myfirstNumber, myfirstLower, myfirstUpper, myfirstOther, myextraChars);
    }
    for (var idx = 1; idx < mylength; ++idx) {
        rc += getRandomChar(mylatterNumber, mylatterLower, mylatterUpper, mylatterOther, myextraChars);
    }
    cb(rc);

}


function getRandomNum(lbound, ubound) {
    return (Math.floor(Math.random() * (ubound - lbound)) + lbound);
}

function getRandomChar(number, lower, upper, other, extra) {
    var numberChars = "0123456789";
    var lowerChars = "abcdefghijklmnopqrstuvwxyz";
    var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var otherChars = "`~!@#$%^&*()-_=+[{]}\|;:'\",<.>/? ";
    var charSet = extra;
    if (number == true)
        charSet += numberChars;
    if (lower == true)
        charSet += lowerChars;
    if (upper == true)
        charSet += upperChars;
    if (other == true)
        charSet += otherChars;
    return charSet.charAt(getRandomNum(0, charSet.length));
}

function getPassword(cb) {
    var mylength = 8;
    var myextraChars = '';
    var myfirstNumber = true;
    var myfirstLower = true;
    var myfirstUpper = true;
    var myfirstOther = false;
    var mylatterNumber = true;
    var mylatterLower = true;
    var mylatterUpper = true;
    var mylatterOther = false;

    var rc = "";
    if (mylength > 0) {
        rc += getRandomChar(myfirstNumber, myfirstLower, myfirstUpper, myfirstOther, myextraChars);
    }
    for (var idx = 1; idx < mylength; ++idx) {
        rc += getRandomChar(mylatterNumber, mylatterLower, mylatterUpper, mylatterOther, myextraChars);
    }
    cb(rc);
}

function setSetting(key, value, cb) {
    log('debug', 'set setting ' + key + ' to value ' + value);
    var setSettingsSql = "UPDATE Settings SET Settings.value = ? WHERE Settings.key = ?";
    var setSettingsQuery = connection2.query(setSettingsSql, [value, key]);

    setSettingsQuery.on('error', function(err) {
        mySqlErrorHandler(err);
        var retval = {
            success: false
        };
        cb(retval);
    });
    setSettingsQuery.on('end', function () {
        var retval = {
            success: true
        };
        cb(retval);
    });
}

function getPadsSettings(cb) {
    var getSettingsSql = "Select * from Settings";
    var getSettingsQuery = connection2.query(getSettingsSql);
    var settings = {};

    getSettingsQuery.on('error', mySqlErrorHandler);
    getSettingsQuery.on('result', function (result) {
        settings[result.key] = result.value;
    });
    getSettingsQuery.on('end', function () {
        cb(settings);
    });
}

function getEtherpadGroupFromNormalGroup(id, cb) {
    var getMapperSql = "Select * from store where store.key = ?";
    var getMapperQuery = connection2.query(getMapperSql, ["mapper2group:" + id]);
    getMapperQuery.on('error', mySqlErrorHandler);
    getMapperQuery.on('result', function (mapper) {
        cb(mapper.value.replace(/"/g, ''));
    });
}

function deleteGroupFromEtherpad(id, cb) {
    getEtherpadGroupFromNormalGroup(id, function (group) {
        groupManager.deleteGroup(group, function (err) {
            if (err) {
                log('error', 'Something went wrong while deleting group from etherpad');
                log('error', err);
                cb();
            } else {
                log('debug', "Group deleted");
                cb();
            }
        });
    });
}

function addPadToEtherpad(padName, groupId, cb) {
    getEtherpadGroupFromNormalGroup(groupId, function (group) {
        groupManager.createGroupPad(group, padName, function (err) {
            if (err) {
                log('error', 'something went wrong while adding a group pad');
                log('error', err);
            } else {
                log('debug', "Pad added");
                cb();
            }
        });
    });
}

function deletePadFromEtherpad(name, groupid, cb) {
    getEtherpadGroupFromNormalGroup(groupid, function (group) {
        padManager.removePad(group + "$" + name);
        log('debug', "Pad deleted");
        cb();
    });
}

function addUserToEtherpad(userName, cb) {
    authorManager.createAuthorIfNotExistsFor(userName, null, function (err, author) {
        if (err) {
            log('error', 'something went wrong while creating author');
            cb();
        } else {
            log('debug', "author created: ");
            log('debug', author);
            cb(author);
        }
    });
}

function mapAuthorWithDBKey(mapperkey, mapper, callback) {
    //try to map to an author
    db.get(mapperkey + ":" + mapper, function (err, author) {
        if (ERR(err, callback)) return;

        //there is no author with this mapper, so create one
        if (author == null) {
            exports.createAuthor(null, function (err, author) {
                if (ERR(err, callback)) return;

                //create the token2author relation
                db.set(mapperkey + ":" + mapper, author.authorID);

                //return the author
                callback(null, author);
            });
        }
        //there is a author with this mapper
        else {
            //update the timestamp of this author
            db.setSub("globalAuthor:" + author, ["timestamp"], new Date().getTime());

            //return the author
            callback(null, {authorID: author});
        }
    });
}

function deleteUserFromEtherPad(userid, cb) {
    mapAuthorWithDBKey("mapper2author", userid, function (err, author) {
        db.remove("globalAuthor:" + author.authorID);
        var mapper2authorSql = "DELETE FROM store where store.key = ?";
        var mapper2authorQuery = connection2.query(mapper2authorSql, ["mapper2author:" + userid]);
        mapper2authorQuery.on('error', mySqlErrorHandler);
        mapper2authorQuery.on('end', function () {
            var token2authorSql = "DELETE FROM store where store.value = ? and store.key like 'token2author:%'";
            var token2authorQuery = connection2.query(token2authorSql, ['"' + author.authorID] + '"');
            token2authorQuery.on('error', mySqlErrorHandler);
            token2authorQuery.on('end', function () {
                log('debug', "User deleted");
                cb();
            });
        });
    });
}

var userAuthenticated = function (req, cb) {
    log('debug', 'userAuthenticated');
    if (req.session.username && req.session.userId) {
        cb(true);
    } else {
        cb(false);
    }
};

var userAuthentication = function (username, password, cb) {
    log('debug', 'userAuthentication');
    var userSql = "Select * from User where User.name = ?";
    var sent = false;
    var userFound = false;
    var confirmed = false;
    var active = true;
    var queryUser = connection.query(userSql, [username]);
    queryUser.on('error', mySqlErrorHandler);
    queryUser.on('result', function (foundUser) {
        userFound = true;
        encryptPassword(password, foundUser.salt, function (encrypted) {
            if (foundUser.password == encrypted && foundUser.confirmed && foundUser.active) {
                sent = true;
                cb(true, foundUser, null, confirmed);
            } else if (!foundUser.active) {
                active = false;
            }
            else {
                confirmed = foundUser.confirmed;
            }
        });
    });
    queryUser.on('end', function () {
        if (!sent) {
            cb(false, null, userFound, confirmed, active);
        }
    });
};

var emailserver = email.server.connect({
    user: eMailAuth.user,
    password: eMailAuth.password,
    host: eMailAuth.host,
    port: eMailAuth.port,
    ssl: eMailAuth.ssl
});

exports.expressCreateServer = function (hook_name, args, cb) {
    args.app.get('/admin/userpadadmin', function (req, res) {

        var render_args = {
            errors: []
        };
        res.send(eejs.require("ep_maadix/templates/admin/user_pad_admin.ejs", render_args));
    });
    args.app.get('/admin/userpadadmin/groups', function (req, res) {
        var render_args = {
            errors: []
        };
        res.send(eejs.require("ep_maadix/templates/admin/user_pad_admin_groups.ejs", render_args));
    });
    args.app.get('/admin/userpadadmin/groups/group', function (req, res) {
        var render_args = {
            errors: []
        };
        res.send(eejs.require("ep_maadix/templates/admin/user_pad_admin_group.ejs", render_args));
    });
    args.app.get('/admin/userpadadmin/users', function (req, res) {
        var render_args = {
            errors: []
        };
        res.send(eejs.require("ep_maadix/templates/admin/user_pad_admin_users.ejs", render_args));
    });
    args.app.get('/admin/userpadadmin/users/user', function (req, res) {
        var render_args = {
            errors: []
        };
        res.send(eejs.require("ep_maadix/templates/admin/user_pad_admin_user.ejs", render_args));
    });
    args.app.get('/logout', function (req, res) {
        req.session.userId = null;
        req.session.username = null;
        res.redirect("/");
    });
    args.app.get('/login', function (req, res) {
        userAuthenticated(req, function (authenticated) {
            if (authenticated) {
                 res.redirect("/dashboard");
            } else {
                var render_args = {
                    errors: []
                };
                res.send(eejs.require("ep_maadix/templates/login.ejs", render_args));
            }
        });
    });
    args.app.post('/login', function (req, res) {
        new formidable.IncomingForm().parse(req, function (err, fields) {

            var render_args = {
                errors: []
            };

            if (!fields.email || !fields.password) {
                res.send(eejs.require("ep_maadix/templates/login.ejs", render_args));
                return false;
            }

            var retVal = userAuthentication(fields.email, fields.password, function (success, user, userFound, confirmed, active) {
                if (success) {
                    req.session.userId = user.userID;
                    req.session.username = user.name;
                    res.redirect('/dashboard');
                    return true;
                } else {
                    if (!active) {
                        render_args['errors'].push('User is inactive');
                        res.send(eejs.require("ep_maadix/templates/login.ejs", render_args));
                    }
                    else if (!userFound || confirmed) {
                        render_args['errors'].push('Wrong user or password!');
                        res.send(eejs.require("ep_maadix/templates/login.ejs", render_args));
                    }
                    else if (userFound && !confirmed) {
                        render_args['errors'].push('You have to confirm your registration first!');
                        res.send(eejs.require("ep_maadix/templates/login.ejs", render_args));
                    }
                    return false;
                }
            });
            return retVal;
        });
    });
    args.app.get('/group/:groupid', function (req, res) {
        userAuthenticated(req, function (authenticated) {
            if (authenticated) {
                getPadsOfGroup(req.params.groupid, '', function (pads) {
                    getUser(req.session.userId, function (found, currUser) {
                        getGroup(req.params.groupid, function (found, currGroup) {
                            getUserGroup(req.params.groupid, req.session.userId, function (found, currUserGroup) {
                                var render_args;
                                if (!currUserGroup) {
                                    render_args = {
                                        errors: [],
                                        msg: "This group does not exist! Perhaps someone has deleted the group."
                                    };
                                    res.send(eejs
                                        .require("ep_maadix/templates/msgtemplate.ejs",
                                            render_args));
                                    return;
                                }
                                var isown = currUserGroup[0].Role == 1;
                                if (currGroup && currUser && currUserGroup) {
                                    render_args = {
                                        errors: [],
                                        id: currGroup[0].name,
                                        groupid: currGroup[0].groupID,
                                        username: req.session.username,
                                        isowner: isown,
                                        pads: pads
                                    };
                                    res.send(eejs.require("ep_maadix/templates/group.ejs", render_args));
                                } else {
                                    render_args = {
                                        errors: [],
                                        msg: "This group does not exist! Perhabs anyone has deleted the group."
                                    };
                                    res.send(eejs.require("ep_maadix/templates/msgtemplate.ejs",
                                        render_args));
                                }
                            });
                        });
                    });

                });
            } else {
                res.redirect("../../index.html");
            }
        });
    });
    args.app.post('/createGroup', function (req, res) {
        new formidable.IncomingForm().parse(req, function (err, fields) {
            userAuthenticated(req, function (authenticated) {
                var data = {};
                if (authenticated) {
                    if (!fields.groupName) {
                        sendError("Group Name not defined", res);
                        return;
                    }
                    var existGroupSql = "SELECT * from Groups WHERE Groups.name = ?";
                    getOneValueSql(existGroupSql, [fields.groupName], function (found) {
                        if (found) {
                            sendError('Group already exists', res);
                            return;
                        } else {
                            var addGroupSql = "INSERT INTO Groups VALUES(null, ?)";
                            var addGroupQuery = connection.query(addGroupSql, [fields.groupName]);
                            addGroupQuery.on('error', mySqlErrorHandler);
                            addGroupQuery.on('result', function (group) {
                                data.groupid = group.insertId;
                                connection.pause();
                                var addUserGroupSql = "INSERT INTO UserGroup Values(?,?,1)";
                                var addUserGroupQuery = connection2.query(addUserGroupSql, [req.session.userId, group.insertId]);
                                addUserGroupQuery.on('error', mySqlErrorHandler);
                                addUserGroupQuery.on('result', function () {
                                    groupManager.createGroupIfNotExistsFor(group.insertId.toString(), function (err, val) {
                                        if (err) {
                                            log('error', 'failed to createGroupIfNotExistsFor');
                                        }
                                    });
                                });
                                addUserGroupQuery.on('end', function() {
                                    connection.resume();
                                })
                            });
                        }
                        addGroupQuery.on('end', function () {
                            data.success = true;
                            data.error = null;
                            res.send(data);
                        });
                    });
                } else {
                    res.send("You are not logged in!!");
                }
            });
        });
  });
 args.app.post('/createPad', function (req, res) {
        new formidable.IncomingForm().parse(req, function (err, fields) {
            if (err) {
                log('error', 'formidable parsing error in ' + req.path);
                res.send(err);
                return;
            }
            userAuthenticated(req, function (authenticated) {
                if (authenticated) {
                    if (!fields.groupId) {
                        sendError('Group-Id not defined', res);
                        return;
                    } else if (!fields.padName) {
                        sendError('Pad Name not defined', res);
                        return;
                    }
                    var existPadInGroupSql = "SELECT * from GroupPads where GroupPads.GroupID = ? and GroupPads.PadName = ?";
                    getOneValueSql(existPadInGroupSql, [fields.groupId, fields.padName], function (found) {
                        if (found || (fields.padName.length == 0)) {
                            sendError('Pad already Exists', res);
                        } else {
                            var addPadToGroupSql = "INSERT INTO GroupPads VALUES(?, ?)";
                            var addPadToGroupQuery = connection.query(addPadToGroupSql, [fields.groupId, fields.padName]);
                            addPadToGroupQuery.on('error', mySqlErrorHandler);
                            addPadToGroupQuery.on('end', function () {
                                addPadToEtherpad(fields.padName, fields.groupId, function () {
                                    var data = {};
                                    data.success = true;
                                    data.error = null;
                                    res.send(data);
                                });
                            });
                        }
                    });
                } else {
                    res.send("You are not logged in!!");
                }
            });
        });
});
    args.app.get('/dashboard', function (req, res) {
        userAuthenticated(req, function (authenticated) {
            if (authenticated) {
		 var sql = "Select Groups.* from Groups inner join UserGroup on(UserGroup.groupID = Groups.groupID) where UserGroup.userID = ?";
		 getAllSql(sql, [req.session.userId], function (groups) {
                 var render_args = {
                    username: req.session.username,
		    groups: groups,
                };
                 res.send(eejs.require("ep_maadix/templates/dashboard.ejs", render_args));
	    });
            } else {
                res.redirect("/login");
            }
        });
    });
    return cb();
};

exports.eejsBlock_adminMenu = function (hook_name, args, cb) {
    var hasAdminUrlPrefix = (args.content.indexOf('<a href="admin/') != -1)
        , hasOneDirDown = (args.content.indexOf('<a href="../') != -1)
        , hasTwoDirDown = (args.content.indexOf('<a href="../../') != -1)
        , urlPrefix = hasAdminUrlPrefix ? "admin/" : hasTwoDirDown ? "../../" : hasOneDirDown ? "../" : ""
        ;
    args.content = args.content + '<li><a href="' + urlPrefix + 'userpadadmin">Users and groups</a> </li>';
    return cb();
};

exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {
    args.content = eejs.require("ep_maadix/templates/index.ejs");
    return cb();
};

exports.eejsBlock_styles = function (hook_name, args, cb) {
    args.content = args.content + eejs.require("ep_maadix/templates/styles.ejs", {}, module);
    return cb();
};

function existValueInDatabase(sql, params, cb) {
    connection.query(sql, params, function (err, found) {
        if (err) {
            log('error', 'existValueInDatabase error, sql: '+ sql);
            cb(false);
        } else if (!found || found.length == 0) {
            cb(false);
        } else {
            cb(true);
        }
    });
}

function getOneValueSql(sql, params, cb) {
    log('debug', 'getOneValueSql');
    var qry = connection.query(sql, params, function (err, found) {
        if (err) {
            log('error', 'getOneValueSql error, sql: ' + sql);
            cb(false);
        } else if (!found || found.length == 0) {
            cb(false, null);
        } else {
            cb(true, found);
        }
    });
    qry.on('error', mySqlErrorHandler)
}

function getAllSql(sql, params, cb) {
    log('debug', 'getAllSql');
    var allInstances = [];
    var queryInstances = connection.query(sql, params);
    queryInstances.on('error', mySqlErrorHandler);
    queryInstances.on('result', function (foundInstance) {
        connection.pause();
        allInstances.push(foundInstance);
        connection.resume();
    });
    queryInstances.on('end', function () {
        cb(allInstances);
    });
}

function getPadsOfGroup(id, padname, cb) {
    var allPads = [];
    var allSql = "Select * from GroupPads where GroupPads.GroupID = ?";
    var queryPads = connection.query(allSql, [id]);
    queryPads.on('error', mySqlErrorHandler);
    queryPads.on('result', function (foundPads) {
        log('debug', 'getPadsOfGroup result');
        connection.pause();
        var pad = {};
        pad.name = foundPads.PadName;
        if (pad.name != "") {
            getEtherpadGroupFromNormalGroup(id, function (group) {
                log('debug', 'getEtherpadGroupFromNormalGroup cb');
                padManager.getPad(group + "$" + pad.name, null, function (err, origPad) {
                    if (err) log('error', err);
                    pad.isProtected = origPad.isPasswordProtected();
                    origPad.getLastEdit(function (err, lastEdit) {
                        pad.lastedit = converterPad(lastEdit);
                        allPads.push(pad);
                        connection.resume();
                    });
                });
            });
        } else {
            connection.resume();
        }
    });
    queryPads.on('end', function () {
        cb(allPads);
    });
}

function getUser(userId, cb) {
    log('debug', 'getUser');
    var sql = "Select * from User where userID = ?";
    getOneValueSql(sql, [userId], cb);
}

function getGroup(groupId, cb) {
    log('debug', 'getGroup');
    var sql = "Select * from Groups where groupID = ?";
    getOneValueSql(sql, [groupId], cb);
}

function getUserGroup(groupId, userId, cb) {
    log('debug', 'getUserGroup');
    var sql = "Select * from UserGroup where groupID = ? and userID = ?";
    getOneValueSql(sql, [groupId, userId], cb);
}
var converterPad = function (UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = (( a.getHours() < 10) ? "0" : "") + a.getHours();
    var min = ((a.getMinutes() < 10) ? "0" : "") + a.getMinutes();
    return date + '. ' + month + ' ' + year + ' ' + hour + ':' + min + ' Uhr';
};

exports.socketio = function (hook_name, args, cb) {
    var io = args.io.of("/pluginfw/admin/user_pad");
    io.on('connection', function (socket) {
        if (!socket.request.session.user || !socket.request.session.user.is_admin) return;

        socket.on("set-setting", function (key, value, cb) {
            setSetting(key, value, function (retval) {
                cb(retval);
            });
        });

        socket.on("get-settings", function (cb) {
            getPadsSettings(function (settings) {
                cb(settings);
            });
        });

        socket.on("get-etherpad-group-name", function (groupid, cb) {
            getEtherpadGroupFromNormalGroup(groupid, function (group) {
                cb(group);
            });
        });

        socket.on("get-user-name", function (userId, cb) {
		var userName;
		var userNameSql = "Select name from User where User.userID = ? LIMIT 1";
		var queryUserName = connection.query(userNameSql, [userId]);
		queryUserName.on('error', mySqlErrorHandler);
            queryUserName.on('result', function (result) {
                userName = result.name;
            });
            queryUserName.on('end', function () {
                cb(userName);
            });
        });

        socket.on("get-group-name", function (groupId, cb) {
		var groupName;
		var groupNameSql = "Select name from Groups where Groups.groupID = ? LIMIT 1";
		var queryGroups = connection.query(groupNameSql, [groupId]);
		queryGroups.on('error', mySqlErrorHandler);
            queryGroups.on('result', function (result) {
                groupName = result.name;
            });
            queryGroups.on('end', function () {
                cb(groupName);
            });
        });

        socket.on("search-group", function (searchTerm, cb) {
            var allGroups = [];
            var allSql = "Select * from Groups where Groups.name like ?";
            var queryGroups = connection.query(allSql, ["%" + searchTerm + "%"]);
            queryGroups.on('error', mySqlErrorHandler);
            queryGroups.on('result', function (foundGroup) {
                connection.pause();
                group = {};
                group.id = foundGroup.groupID;
                group.name = foundGroup.name;
                var sqlAmAuthors = 'Select count(userID) as amount from UserGroup Where groupID = ?';
                var queryAuthors = connection2.query(sqlAmAuthors, [group.id]);
                queryAuthors.on('error', mySqlErrorHandler);
                queryAuthors.on('result', function (authors) {
                    group.amAuthors = authors.amount;
                    allGroups.push(group);
                    connection.resume();
                });
            });
            queryGroups.on('end', function () {
                cb(allGroups);
            });

        });

        socket.on("search-pads", function (searchTerm, cb) {
            var allPads = [];
            var allSql = "Select * from GroupPads where GroupPads.GroupID = ? and GroupPads.PadName like ?";
            var queryPads = connection.query(allSql, [searchTerm.id, "%" + searchTerm.term + "%"]);
            queryPads.on('error', mySqlErrorHandler);
            queryPads.on('result', function (foundPads) {
                var pad = {};
                pad.name = foundPads.PadName;
                allPads.push(pad);
            });
            queryPads.on('end', function () {
                cb(allPads);
            });
        });

        socket.on("search-all-users-not-in-group", function (vals, cb) {
            var allUser = [];
            var allSql = "select distinct User.name, User.userID from User left join UserGroup on(UserGroup.userID = User.userID) where User.userId NOT IN " +
                "(Select distinct UserGroup.userID from UserGroup where UserGroup.groupID = ?) and User.name like ?";
            var queryUser = connection.query(allSql, [vals.groupid, "%" + vals.name + "%"]);
            queryUser.on('error', mySqlErrorHandler);
            queryUser.on('result', function (user) {
                var use = {};
                use.name = user.name;
                use.id = user.userID;
                allUser.push(user);
            });
            queryUser.on('end', function () {
                cb(allUser);
            });
        });


        socket.on("search-group-user", function (searchTerm, cb) {
            var allUser = [];
            var allSql = "Select * from UserGroup where UserGroup.groupID = ?";
            var queryUser = connection.query(allSql, [searchTerm.id]);
            queryUser.on('error', mySqlErrorHandler);
            queryUser.on('result', function (foundUser) {
                connection.pause();
                var userNameSql = "Select * from User where User.userID = ? and User.name like ?";
                var User = {};
                var queryUserName = connection2.query(userNameSql, [foundUser.userID, "%" + searchTerm.term + "%"]);
                queryUserName.on('error', mySqlErrorHandler);
                queryUserName.on('result', function (foundUserName) {
                    User.id = foundUser.userID;
                    User.name = foundUserName.name;
                    User.active = foundUserName.active;
                });
                queryUserName.on('end', function () {
                    allUser.push(User);
                    connection.resume();
                });
            });
            queryUser.on('end', function () {
                cb(allUser);
            });
        });

        socket.on("delete-group", function (id, cb) {
            var deleteGroupSql = "DELETE FROM Groups WHERE Groups.groupID = ?";
            var deleteGroupQuery = connection.query(deleteGroupSql, [id]);
            deleteGroupQuery.on('error', mySqlErrorHandler);
            deleteGroupQuery.on('result', function () {
                connection.pause();
                var deleteUserGroupSql = "DELETE FROM UserGroup where UserGroup.groupID = ?";
                var deleteUserGroupQuery = connection2.query(deleteUserGroupSql, [id]);
                deleteUserGroupQuery.on('error', mySqlErrorHandler);
                deleteUserGroupQuery.on('end', function () {
                    var deleteGroupPadsSql = "DELETE FROM GroupPads where GroupPads.groupID = ?";
                    var deleteGroupPadsQuery = connection2.query(deleteGroupPadsSql, [id]);
                    deleteGroupPadsQuery.on('error', mySqlErrorHandler);
                    deleteGroupPadsQuery.on('end', function () {
                        deleteGroupFromEtherpad(id, function () {
                            connection.resume();
                        });

                    });
                });
            });
            deleteGroupQuery.on('end', function () {
                cb();
            });
        });

        socket.on("delete-pad", function (name, groupid, cb) {
            var deletePadSql = "DELETE FROM GroupPads WHERE GroupPads.PadName = ? and GroupPads.GroupID = ?";
            var deletePadQuery = connection.query(deletePadSql, [name, groupid]);
            deletePadQuery.on('error', mySqlErrorHandler);
            deletePadQuery.on('result', function (pad) {});
            deletePadQuery.on('end', function () {
                deletePadFromEtherpad(name, groupid, function () {
                    cb();
                });

            });
        });

        socket.on("suspend-user-from-group", function (usergroup, cb) {
            var deleteUserSql = "DELETE FROM UserGroup where UserGroup.userID = ? and UserGroup.groupID = ?";
            var deleteUserQuery = connection.query(deleteUserSql, [usergroup.userid, usergroup.groupid]);
            deleteUserQuery.on('error', mySqlErrorHandler);
            deleteUserQuery.on('end', function () {
                cb();
            });
        });

        socket.on("add-group", function (name, cb) {
            var existGroupSql = "SELECT * from Groups WHERE Groups.name = ?";
            existValueInDatabase(existGroupSql, [name], function (bool) {
                if (bool) {
                    cb(false);
                } else {
                    var addGroupSql = "INSERT INTO Groups VALUES(null, ?)";
                    var addGroupQuery = connection.query(addGroupSql, [name]);
                    addGroupQuery.on('error', mySqlErrorHandler);
                    addGroupQuery.on('result', function (group) {
                        connection.pause();
                        groupManager.createGroupIfNotExistsFor(group.insertId.toString(), function (err) {
                            if (err) {
                                log('error', err);
                            }
                            connection.resume();
                        });
                    });
                    addGroupQuery.on('end', function () {
                        cb(true);
                    });
                }
            });

        });

        socket.on("add-pad-to-group", function (padGroup, cb) {
            if (padGroup.groupid == "" || padGroup.padName == "")
                cb(false);
            var existPadInGroupSql = "SELECT * from GroupPads where GroupPads.GroupID = ? and GroupPads.PadName = ?";
            existValueInDatabase(existPadInGroupSql, [padGroup.groupid, padGroup.padName], function (bool) {
                if (bool) {
                    cb(false);
                } else {
                    var addPadToGroupSql = "INSERT INTO GroupPads VALUES(?, ?)";
                    var addPadToGroupQuery = connection.query(addPadToGroupSql, [padGroup.groupid, padGroup.padName]);
                    addPadToGroupQuery.on('error', mySqlErrorHandler);
                    addPadToGroupQuery.on('end', function () {
                        addPadToEtherpad(padGroup.padName, padGroup.groupid, function () {
                            cb(true);
                        });
                    });
                }
            });
        });

        socket.on("add-user-to-group", function (userGroup, cb) {
            var existPadInGroupSql = "SELECT * from UserGroup where UserGroup.groupID = ? and UserGroup.userId = ?";
            existValueInDatabase(existPadInGroupSql, [userGroup.groupid, userGroup.userID], function (bool) {
                if (bool) {
                    cb(false);
                } else {
                    var addPadToGroupSql = "INSERT INTO UserGroup VALUES(?, ?,2)";

                    var addPadToGroupQuery = connection.query(addPadToGroupSql, [userGroup.userID, userGroup.groupid]);
                    addPadToGroupQuery.on('error', mySqlErrorHandler);
                    addPadToGroupQuery.on('end', function () {
                        cb(true);
                    });
                }
            });
        });

        socket.on("search-all-user", function (searchTerm, cb) {
            var allUsers = [];
            var allSql = "Select * from User where User.name like ?";
            var queryUsers = connection.query(allSql, ["%" + searchTerm + "%"]);
            queryUsers.on('error', mySqlErrorHandler);
            queryUsers.on('result', function (foundUser) {
                connection.pause();
                user = {};
                user.id = foundUser.userID;
                user.name = foundUser.name;
                user.active = foundUser.active;
                var sqlAmGroups = 'Select count(groupID) as amount from UserGroup Where UserGroup.userID = ?';
                var queryGroups = connection2.query(sqlAmGroups, [user.id]);
                queryGroups.on('error', mySqlErrorHandler);
                queryGroups.on('result', function (groups) {
                    user.amGroups = groups.amount;
                    allUsers.push(user);
                    connection.resume();
                });
            });
            queryUsers.on('end', function () {
                cb(allUsers);
            });

        });

        socket.on("add-user", function (user, cb) {
            var existUser = "SELECT * from User where User.name = ?";
            existValueInDatabase(existUser, [user.name], function (exists) {
                if (exists) {
                    cb(false, 'User already exisits!');
                } else {
                    var addUserSql = "";
                    createSalt(function (salt) {
                        encryptPassword(user.pw, salt, function (encrypted) {
                            addUserSql = "INSERT INTO User VALUES(null, ?,?,1,'','klfdsa',?,1)";
                            var addUserQuery = connection.query(addUserSql, [user.name, encrypted, salt]);
                            addUserQuery.on('error', mySqlErrorHandler);
                            addUserQuery.on('result', function (newUser) {
                                connection.pause();
                                addUserToEtherpad(newUser.insertId, function () {
                                    connection.resume();
                                });
                            });
                            addUserQuery.on('end', function () {
                                cb(true);
                            });
                        });
                    });

                }
            });
        });

        socket.on("deactivate-user", function (user, cb) {
            var sqlUpdate = "UPDATE User SET User.active = 0 where User.userID = ?";
            var updateQuery = connection.query(sqlUpdate, [user.id]);
            updateQuery.on('error', function(err) {
                mySqlErrorHandler(err);
                var retval = {
                    success: false
                };
                cb(retval);
            });
            updateQuery.on('end', function () {
                var retval = {
                    success: true
                };
                log('debug', "User deactivated");
                cb(retval);
            });
        });

        socket.on("activate-user", function (user, cb) {
            var sqlUpdate = "UPDATE User SET User.active = 1 where User.userID = ?";
            var updateQuery = connection.query(sqlUpdate, [user.id]);

            updateQuery.on('error', function(err) {
                mySqlErrorHandler(err);
                var retval = {
                    success: false
                };
                cb(retval);
            });
            updateQuery.on('end', function () {
                var retval = {
                    success: true
                };
                log('debug', "User activated");
                cb(retval);
            });
        });

        socket.on("reset-pw-user", function (vals, cb) {
            getPassword(function (pw) {
                var userSql = "SELECT * from User where User.userID = ?";
                var queryUser = connection.query(userSql, [vals.id]);
                queryUser.on('error', mySqlErrorHandler);
                queryUser.on('result', function (user) {
                    var msg = eMailAuth.resetpwmsg;
                    msg = msg.replace(/<password>/, pw);
                    var message = {
                        text: msg,
                        from: "NO-REPLY <" + eMailAuth.resetfrom + ">",
                        to: user.name + " <" + user.name + ">",
                        subject: eMailAuth.resetsubject
                    };
                    var nodemailer = require('nodemailer');
                    var transport = nodemailer.createTransport("sendmail");
                    createSalt(function (salt) {
                        encryptPassword(pw, salt, function (encrypted) {
                            if (eMailAuth.smtp == 'false') {
                                transport.sendMail(message);
                                var retval = {};
                                retval.id = vals.id;
                                retval.row = vals.row;
                                var sqlUpdate = "UPDATE User SET User.password = ?, User.salt = ? where User.userID = ?";
                                var updateQuery = connection.query(sqlUpdate, [encrypted, salt, retval.id]);
                                updateQuery.on('error', mySqlErrorHandler);
                                updateQuery.on('end', function () {
                                    retval.success = true;
                                    log('debug', "User password reset");
                                    cb(retval);
                                });
                            }
                            else {
                                emailserver.send(message, function (err) {
                                    var retval = {};
                                    retval.id = vals.id;
                                    retval.row = vals.row;
                                    if (err) {
                                        retval.success = false;
                                        cb(retval);
                                    } else {
                                        var sqlUpdate = "UPDATE User SET User.password = ?, User.salt = ? where User.userID = ?";
                                        var updateQuery = connection.query(sqlUpdate, [encrypted, salt, retval.id]);
                                        updateQuery.on('error', mySqlErrorHandler);
                                        updateQuery.on('end', function () {
                                            retval.success = true;
                                            log('debug', "User password reset");
                                            cb(retval);
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });

        socket.on("delete-user", function (userid, hard, cb) {
            var isOwner = "SELECT * from UserGroup where UserGroup.userId = ? and UserGroup.Role = 1";
            existValueInDatabase(isOwner, [userid], function (exist) {
                if (exist && !hard) {
                    cb(false);
                } else if (!exist || (exist && hard)) {
                    var userSQL = "DELETE FROM User where User.userID = ?";
                    var queryDeleteUser = connection.query(userSQL, [userid]);
                    queryDeleteUser.on('error', mySqlErrorHandler);
                    queryDeleteUser.on('end', function () {
                        var userGroupSQL = "DELETE FROM UserGroup where UserGroup.userID = ?";
                        var queryDeleteUserGroup = connection.query(userGroupSQL, [userid]);
                        queryDeleteUserGroup.on('error', mySqlErrorHandler);
                        queryDeleteUserGroup.on('end', function () {
                            deleteUserFromEtherPad(userid, function () {
                                cb(true);
                            });
                        });
                    });
                }
            });
        });

        socket.on("search-pads-of-user", function (searchTerm, cb) {
            var allPads = [];
            var allSql = "Select * from UserGroup where UserGroup.userID = ?";
            var queryGroups = connection.query(allSql, [searchTerm.id]);
            queryGroups.on('error', mySqlErrorHandler);
            queryGroups.on('result', function (foundGroup) {
                connection.pause();
                var allPadsOfGroupSql = "Select * from GroupPads where GroupPads.GroupID = ? and GroupPads.PadName like ?";
                var allPadsOfGroupQuery = connection2.query(allPadsOfGroupSql, [foundGroup.groupID, searchTerm.term]);
                allPadsOfGroupQuery.on('error', mySqlErrorHandler);
                allPadsOfGroupQuery.on('result', function (foundPad) {
                    var pad = {};
                    pad.name = foundPad.PadName;
                    allPads.push(pad);
                });
                allPadsOfGroupQuery.on('end', function () {
                    connection.resume();
                });
            });
            queryGroups.on('end', function () {
                cb(allPads);
            });
        });

        socket.on("search-groups-of-user", function (searchTerm, cb) {
            var allGroups = [];
            var allSql = "Select * from UserGroup where UserGroup.userID = ?";
            var queryGroup = connection.query(allSql, [searchTerm.id]);
            queryGroup.on('error', mySqlErrorHandler);
            queryGroup.on('result', function (foundGroup) {
                connection.pause();
                var groupNameSql = "Select * from Groups where Groups.groupID = ? and Groups.name like ?";
                var queryGroupName = connection2.query(groupNameSql, [foundGroup.groupID, "%" + searchTerm.name + "%"]);
                queryGroupName.on('error', mySqlErrorHandler);
                var group = {};
                queryGroupName.on('result', function (foundGroupName) {
                    group.id = foundGroup.groupID;
                    group.name = foundGroupName.name;
                });
                queryGroupName.on('end', function () {
                    allGroups.push(group);
                    connection.resume();
                });
            });
            queryGroup.on('end', function () {
                cb(allGroups);
            });
        });

        socket.on("add-group-to-user", function (userGroup, cb) {
            var existGroupInUserSql = "SELECT * from UserGroup where UserGroup.groupID = ? and UserGroup.userId = ?";
            existValueInDatabase(existGroupInUserSql, [userGroup.groupid, userGroup.userID], function (bool) {
                if (bool) {
                    cb(false);
                } else {
                    var addGroupToUserSql = "INSERT INTO UserGroup VALUES(?,?,2)";
                    var addGroupToUserQuery = connection.query(addGroupToUserSql, [userGroup.userID, userGroup.groupid]);
                    addGroupToUserQuery.on('error', mySqlErrorHandler);
                    addGroupToUserQuery.on('end', function () {
                        cb(true);
                    });
                }
            });
        });

        socket.on("search-groups-not-in-user", function (vals, cb) {
            var allGroups = [];
            var allSql = "select distinct Groups.name, Groups.groupID from Groups left join UserGroup on(UserGroup.groupID = Groups.groupID) where Groups.groupId NOT IN " +
                "(Select distinct UserGroup.groupID from UserGroup where UserGroup.userID = ?) and Groups.name like ?";
            var queryGroups = connection.query(allSql, [vals.id, "%" + vals.name + "%"]);
            queryGroups.on('error', mySqlErrorHandler);
            queryGroups.on('result', function (group) {
                var grou = {};
                grou.name = group.name;
                grou.id = group.groupID;
                allGroups.push(grou);
            });
            queryGroups.on('end', function () {
                cb(allGroups);
            });
        });

        socket.on("direct-to-group-pad", function (author, groupid, pad_name, cb) {
            getEtherpadGroupFromNormalGroup(groupid, function (group) {
                addUserToEtherpad(author, function (etherpad_author) {
                    sessionManager.createSession(group, etherpad_author.authorID, Date.now() + 7200000,
                        function (err, session) {
                            cb(session.sessionID, group, pad_name);
                        });
                });
            });
        });
    });
    cb();
};


