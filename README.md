ep_maadix
=========

This plugin adds the following features to etherpad-lite:

- User-Management System
- Group-Management System
- Optionally allow register of new users
- Optionally allow public pads
- Opyionally allow users to recover their password
- Administration interface

Installation
------------

In order to use this plugin you have to [configure Etherpad Lite to use MySQL as backend database](https://github.com/ether/etherpad-lite/wiki/How-to-use-Etherpad-Lite-with-MySQL).

At the moment you still cannot install the plugin from the administrator interface so you have to clone it:

Fron the root folder of your etherpad installation run

    npm install https://github.com/MaadixNet/ep_maadix.git

Copy email.json.template to email.json and edit it using your email preferences

Then use the provided [SQL script](/sql_listing.sql) to create the schema:

    mysql -u USER -p < sql_listing.sql

This pluging has been developed for an etherpad-lite installation with reverse proxy under a subpath (e.g. mydomain.com/etherpad/ )
For now you still need  to add the following line in your Vhost config, in order to redirect properly non-logged in users  

    RedirectMatch Permanent ^/login$ /etherpad/login  

where /etherpad/ is the name of your subpath.  

It should also work for an installation without Reverse Proxy, but it has not been tested.

Usage
-----------

Once installed the plugin login as admin into your etherpad installation e.g. https://youretherpadinstallation/admin  
Click on 'Users and groups' tab on the left column.  

From this area you can create groups, invite users and define settings for the installation.  
Users will be able to manage groups, invitations and pads from the front end.   

Credits
-------

It is based in these other plugins that were unmaintained at the time of the development:

- https://github.com/aoberegg/ep_user_pad/
- https://github.com/aoberegg/ep_user_pad_frontend/

Known alternatives to this plugin
---------------------------------

- https://github.com/framasoft/ep_mypads
- https://github.com/vltugraz/ep_user_pads
- https://github.com/reality/ep_frontend_community


