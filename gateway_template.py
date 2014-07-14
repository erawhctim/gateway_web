# Cameron Fulton
# gateway_api.py
# Backend API for integration with client

# Update 6/23/14: Post method works for adding listings to the database. Get
# method works for returning a list of current listings.
# 6/24/14 Added "delete all", search function
# 6/25/14 Clean up code, remove old data structure, alter explicit returns

# TODO: add some way of getting the users listings based on some input, add a
# login feature/user scheme, 
# Date structure verified on client side for now, would be good to add to 
# back end.

import endpoints
from protorpc import messages
from protorpc import message_types
from protorpc import remote
from datetime import datetime
from google.appengine.ext import ndb
from google.appengine.api import search
import logging

class user(ndb.Model):
	username = ndb.StringProperty()
	email = ndb.StringProperty()
	password = ndb.StringProperty()

class modelListing(ndb.Model):
	date = messages.StringField(1)
	title = messages.StringField(2, required=True)
	location = messages.StringField(3)
	description = messages.StringField(4, required=True)
	doc_id = messages.StringField(5)
	owner = messages.StringField(6,required=True)
	providers = messages.StringField(7)

