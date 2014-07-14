# Cameron Fulton
# gateway_api.py
# Backend API for integration with client

import endpoints
from protorpc import messages
from protorpc import message_types
from protorpc import remote
from datetime import datetime
from google.appengine.ext import ndb
from google.appengine.api import search
from google.appengine.api import mail
import logging
import hashlib

# Online ID
WEB_CLIENT_ID = '609564210575-hv0i5mf6cleccjikfre5kl6uc2jamrsl.apps.googleusercontent.com'
# Local ID
#WEB_CLIENT_ID = '609564210575-k5g1qq23gg5d4li2qbqbc47c2cbuq6gp.apps.googleusercontent.com'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
ANDROID_AUDIENCE = WEB_CLIENT_ID

# User defined package
package = 'gateway'

# Entire database will use one index for now
# TODO: Depracate this
listIndex = search.Index(name="myListings")
userIndex = search.Index(name="myUsers")

### Class definitions ###

## ndb entities ##
class user(ndb.Model):
	username = ndb.StringProperty()
	email = ndb.StringProperty()
	password = ndb.StringProperty()

class modelListing(ndb.Expando):
	# TODO: change this
	date = ndb.StringProperty()
	title = ndb.StringProperty(required=True)
	location = ndb.StringProperty()
	description = ndb.StringProperty(required=True)
	list_id = ndb.IntegerProperty()
	owner = ndb.StringProperty(required=True)
	providers = ndb.StringProperty(repeated=True)

class instMsg(ndb.Model):
	origin=ndb.StringProperty()
	dest=ndb.StringProperty()
	content=ndb.StringProperty()

## Message subclasses ##

# Define a message to return the index
class ListingIdx(messages.Message):
	idx = messages.StringField(1)

# Define a class for each listing
class Listing(messages.Message):
	date = messages.StringField(1)
	title = messages.StringField(2, required=True)
	location = messages.StringField(3)
	description = messages.StringField(4, required=True)
	owner = messages.StringField(6, required=True)
	providers = messages.StringField(7,repeated=True)
	boolResult = messages.IntegerField(8)
	list_id = messages.IntegerField(9)

# Set of listings
class ListingList(messages.Message):
	listings = messages.MessageField(Listing,1,repeated=True)
	boolResult = messages.IntegerField(2)

# Used for ordering listings
class ListingListRequest(messages.Message):
	class order(messages.Enum):
		newest = 1
		oldest = 2
	
	maxResults = messages.IntegerField(1,default=100)
	sortOrder = messages.EnumField(order,2,default=order.newest)

# Define a user id
class UserId(messages.Message):
	id = messages.StringField(1)

# Submission form of a new user
class UserFormMessage(messages.Message):
	username = messages.StringField(1,required=True)
	email = messages.StringField(2,required=True)
	password = messages.StringField(3,required=True)

class LoginFormMessage(messages.Message):
	username=messages.StringField(1,required=True)
	password=messages.StringField(2,required=True)

# Subclass of message just for returning booleans
class messageBool(messages.Message):
	boolResult=messages.IntegerField(1)

class instantMessage(messages.Message):
	userId = messages.StringField(1,required=True)
	content = messages.StringField(2,required=True)
	origin = messages.StringField(3,required=True)

class messageList(messages.Message):
	instMsgs = messages.MessageField(instantMessage,1,repeated=True)
	boolResult = messages.IntegerField(2)

class emailMessage(messages.Message):
	user = messages.StringField(1,required=True)
	recip = messages.StringField(2,required=True)
	

## Function definitions
def inst_msg_to_rpc(im):
	return instantMessage(userId=im.dest,content=im.content,origin=im.origin)

# Remove all documents in the doc
# TODO: depracate this
def delete_all_documents(index_name):

   	doc_index = search.Index(name=index_name)

    	# looping because get_range by default returns up to 100 documents at a time
    	while True:
        	# Get a list of documents populating only the doc_id field and extract the ids.
        	document_ids = [document.doc_id
                        for document in doc_index.get_range(ids_only=True)]
        	if not document_ids:
            		break
        	# Delete the documents for the given ids from the Index.
        	doc_index.delete(document_ids)

	return ListingIdx(idx=doc_index)

# Method to convert a listing to a message so it may be returned
def list_to_message(message):
	return Listing(         date=message.date,
				title=message.title,
				location=message.location,
				description=message.description,
				owner=message.owner,
				providers=message.providers,
				list_id=message.list_id,
				boolResult=1 )

# Post the document to the index given a message
def put_list_from_message(message):
	post_listing = modelListing(date=message.date,
				    title=message.title,
				    location=message.location,
				    description=message.description,
				    owner=message.owner,
				    providers=message.providers)

	# Post to the ndb
	post_key = post_listing.put()
	post_listing.list_id = post_key.id()
	# Bit hackish, probably better way to do this
	post_listing.put()

# Method to convert to a message so it may be returned
def user_to_message(message):
	return LoginFormMessage(  username=message.username,
				  password=message.password
		      )

# Add a user to the database
def put_user_from_message(message):
	temp = message.username
	temp = user(username=message.username,
		    email=message.email,
		    password=getDigest(message.password))
	temp_key = temp.put()
	return message

# Post the message
def put_inst_message(message):
	thisInstMsg = instMsg(origin=message.origin,
			      dest=message.userId,
			      content=message.content)
	temp_key = thisInstMsg.put()

# Hash the password
def getDigest(password):
	return hashlib.sha256(password).hexdigest()
	
###############################################################################
# Endpoints gateway API
@endpoints.api(name='gateway', version='v1',
               allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID,
                                   IOS_CLIENT_ID, endpoints.API_EXPLORER_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE],
               scopes=[endpoints.EMAIL_SCOPE])

# Main API class
class GatewayApi(remote.Service):
    """Gateway API v1."""

    # Resource container for created posting
    POST_METHOD_RESOURCE = endpoints.ResourceContainer(Listing)

    ## Listing endpoints ##
    # Endpoints method for posting a listing
    @endpoints.method(POST_METHOD_RESOURCE, messageBool,
                      path='post', http_method='POST',
                      name='listings.postListing')
    def post_listing(self,request):
	# Post the listing to ndb
	try:
		put_list_from_message(request)
		return messageBool(boolResult=1)
	except	Exception,e:
		logging.exception('Listing post failed.')
		raise endpoints.BadRequestException('Bad post request')

	return messageBool(boolResult=0)

    # Endpoints method for printing out the current listings
    # Depracate this
    @endpoints.method(ListingListRequest, ListingList,
                      path='listlistings', http_method='GET',
                      name='listings.getListings')
    def get_doc_list(self,request):
	# Query the ndb	
	try:
		curListings = modelListing.query()
		items = [list_to_message(entity) for entity in curListings]
	# Catch an exception in case calling the search API failed	
	except Exception,e:
		logging.exception('Print current listings failed.')
		raise endpoints.BadRequestException('Items cannot be retrieved')

	# Calling search API failed or no listings present	
	if items is None:
		return ListingList(listings=None,boolResult=0)
	# Found some listings, print them	
	else:
		return ListingList(listings=items,boolResult=1)

    # Resource container for search field
    KEYWORD_RESOURCE = endpoints.ResourceContainer(
		message_types.VoidMessage,
		search_keyword=messages.StringField(1),
		num_search_listings=messages.IntegerField(2))

    # Endpoints method for getting listings based on keyword search
    @endpoints.method(KEYWORD_RESOURCE, ListingList,
                      path='searchlistings/{search_keyword}/{num_search_listings}', http_method='GET',
                      name='listings.searchListings')
    # Search by keyword using Google API
    def keyword_search(self,request):
	q = modelListing.query(modelListing.title.IN([request.search_keyword]))
	# Try searching given the query above	
	try:
		#results = q.get()
		listResults = [list_to_message(entity) for entity in q]
	# Calling the API failed
	# TODO: check this works	
	except search.Error:
		logging.exception('Search failed')
		raise endpoints.BadRequestException('Bad search request')

	# Even if there are no listings, want to indicate search call worked
	return ListingList(listings=listResults,boolResult=1)

    # Endpoints method for deleting all listings
    # TODO: depracate this after we delete all docs from ndb
    @endpoints.method(message_types.VoidMessage, messageBool,
                      path='deleteall', http_method='DELETE',
                      name='listings.deleteAll')
    def delete_all_listings(self,request):
	try:
		delete_all_documents("myListings")
	except Exception,e:
		logging.exception('Delete failed.')
		raise endpoints.BadRequestException('Bad request')

	return messageBool(boolResult=1)


    # Resource containter for deletion
    DELETE_RESOURCE = endpoints.ResourceContainer(
		kind=messages.StringField(1),
		id=messages.IntegerField(2) )

    # Endpoints method for deleting an element by its ID
    @endpoints.method(DELETE_RESOURCE, messageBool,
	path='delete-element/{kind}/{id}', http_method='DELETE',
	name='deleteElement')
    def delete_element(self,request):
	if request.kind == 'listing':
		ndb.Key('modelListing',int(request.id)).delete()
		return messageBool(boolResult=1)
	if request.kind == 'user':
		ndb.Key('user',int(request.id)).delete()
		return messageBool(boolResult=1)
	else:
		raise endpoints.BadRequestException('Bad request. Check fields')
	
    
    # Endpoints method for getting a listing from its ID
    @endpoints.method(ListingIdx, Listing,
                      path='get-doc-by-id/{idx}', http_method='GET',
                      name='listings.getListById')
    def get_doc_by_id(self,request):
	try:
		listing = ndb.Key( 'modelListing',int(request.idx) ).get()
	except Exception,e:
		raise endpoints.BadRequestException('Cannot retrieve listing')

	if listing is None:
		raise endpoints.NotFoundException('No listing with that ID')
	else:
		return list_to_message(listing)

    # Endpoints method for getting current listings for a user
    @endpoints.method(UserId, ListingList,
                      path='get-list-by-user/{id}', http_method='GET',
                      name='listings.getListByUser')
    def get_listings_by_user(self,request):	
	try:
		results = modelListing.query(modelListing.owner == request.id)
	except search.Error:
		logging.exception('Search for listings failed')
		raise endpoints.BadRequestException('Cannot retrieve listings')

	listResults = [list_to_message(entity) for entity in results]
	return ListingList(listings=listResults,boolResult=1)


    ## User endpoints ##
    # Endpoints method for adding a user to the database
    @endpoints.method(UserFormMessage, messageBool,
                      path='new-user', http_method='POST',
                      name='users.newUser')
    def new_user(self,request): 
	q = user.query(user.username == request.username)
	results = q.get()
	if results is None:
		#if(validate_email(request.email)):	
			put_user_from_message(request)
			return messageBool(boolResult=1) 
	return messageBool(boolResult=0)

    # Endpoints method for logging in
    @endpoints.method(LoginFormMessage, messageBool,
                      path='login-user', http_method='POST',
                      name='users.loginUser')
    def login_user(self,request):
	try:
		result = user.query(user.username == request.username)
	except Exception,e:
		logging.exception('Search for username failed')

	for entity in result:
			userResult = user_to_message(entity)
			if (userResult.username == request.username) and (userResult.password == getDigest(request.password)):
				return messageBool(boolResult=1)
			else:
				return messageBool(boolResult=0)

	return messageBool(boolResult=0)

    ## Messaging endpoints ##
    # TODO: doesn't work, take it out if getting rid of messaging service
    # Endpoints method for posting a message
    @endpoints.method(instantMessage, messageBool,
		path='send-message', http_method='POST',	
		name='messages.send')
    def send_message(self,request):
	try:
		put_inst_message(request)
	except Exception,e:
		logging.exception('Message failed')
		raise endpoints.BadRequestException('Cannot post message')

	return messageBool(boolResult=1)

    USER_MSG_CONT = endpoints.ResourceContainer(
		origin=messages.StringField(1),
		dest=messages.StringField(2))

    # Endpoints method for getting messages with another party
    @endpoints.method(USER_MSG_CONT, messageList,
		path='get-messages', http_method='GET',	
		name='messages.get')
    def get_messages(self,request):	
	try:
		results = instMsg.query( ndb.OR((instMsg.origin == request.origin and instMsg.dest == request.dest),(instMsg.origin == request.dest and instMsg.dest == request.origin)) )
	except Exception,e:
		logging.exception('Message fetch failed')
		raise endpoints.BadRequestException('Cannot retrieve messages')

	#return messageList(instMsgs=None,boolResult=0)
	if results.count() == 0:
		raise endpoints.NotFoundException('User not found')
	else:
		messageResults = [inst_msg_to_rpc(entity) for entity in results]
		return messageList(instMsgs=messageResults,boolResult=1)

    # Resource for adding user to provider list
    USER_WATCH_RESOURCE = endpoints.ResourceContainer(
		user=messages.StringField(1),
		listing_id=messages.IntegerField(2))

    # Endpoints method for adding a user to the watch list of a listing
    @endpoints.method(USER_WATCH_RESOURCE,messageBool,
		      path='add-watch-user/{user}/{listing_id}',
		      http_method='POST', name='listings.addWatchUser')
    def add_watch_user(self,request):
	# Add the given user to the list of providers for that listing
	# Find listing by ID
	try:
		listing = ndb.Key( 'modelListing',int(request.listing_id) ).get()
	except Exception,e:
		raise endpoints.BadRequestException('Cannot retrieve listing')

	listing.providers.append(request.user)
	listing.put()
	return messageBool(boolResult=1)


    # Endpoints method for sending a notification email
    @endpoints.method(emailMessage,messageBool,
		      path='send-mail',
		      http_method='POST', name='sendMail')
    def email_user(self,request):
	# Find the owner's email
	q = user.query(user.username == request.recip)
	recipResult = q.get()
	q = user.query(user.username == request.user)
	userResult = q.get()
	try:
		mail.send_mail(sender=userResult.email,
			to=recipResult.email,
			subject=request.user+" responded to your post!",
			body=""" This is a notification from the Gateway team. Someone has responded to your posting. """)
		return messageBool(boolResult=1)
	except Exception,e:
		raise endpoints.BadRequestException('Cannot send e-mail.')

    # Endpoints method for getting the watched posts for the current user
    @endpoints.method(UserId, ListingList,
                      path='get-watch-by-user/{id}', http_method='GET',
                      name='listings.getWatchByUser')
    def get_watch_by_user(self,request):	
	try:
		results = modelListing.query( modelListing.providers.IN(request.id) )
	except search.Error:
		logging.exception('Search for listings failed')
		raise endpoints.BadRequestException('Cannot retrieve listings')

	listResults = [list_to_message(entity) for entity in results]
	return ListingList(listings=listResults,boolResult=1)

APPLICATION = endpoints.api_server([GatewayApi])
