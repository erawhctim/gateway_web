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



WEB_CLIENT_ID = 'replace this with your web client application ID'

ANDROID_CLIENT_ID = 'replace this with your Android client ID'

IOS_CLIENT_ID = 'replace this with your iOS client ID'

ANDROID_AUDIENCE = WEB_CLIENT_ID



# User defined package

package = 'gateway'



# Entire database will use one index for now
# TODO: Can hold unlimited amount of documents up to 10GB, probably enough
#       but may alter in the future.

index = search.Index(name="myListings")



# Remove all documents in the DB

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

	return DocumentIdx(idx=doc_index)


# Method to convert to a message so it may be returned

def doc_to_message(self):

	return Listing(date=self.field('date').value,

				title=self.field('title').value,

				location=self.field('location').value,

				description=self.field('description').value,
				doc_id=self.doc_id)

# Post the document to the index given a message

def put_doc_from_message(message):

	post_document = search.Document( fields=[

			    search.TextField(name='date',value=message.date),

			    search.TextField(name='title',value=message.title),

			    search.TextField(name='location',value=message.location),

			    search.TextField(name='description',value=message.description)])



	index.put(post_document)

	return post_document

# Define a message to return the index
class DocumentIdx(messages.Message):
	idx = messages.StringField(1)


# Define a class for each listing

class Listing(messages.Message):

	date = messages.StringField(1)

	title = messages.StringField(2, required=True)

	location = messages.StringField(3)

	description = messages.StringField(4, required=True)

	doc_id = messages.StringField(5)



# Set of listings

class ListingList(messages.Message):

	listings = messages.MessageField(Listing,1,repeated=True)



class ListingListRequest(messages.Message):

	class order(messages.Enum):

		newest = 1

		oldest = 2

	

	maxResults = messages.IntegerField(1,default=100)

	sortOrder = messages.EnumField(order,2,default=order.newest)


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



    # Endpoints method for posting a listing

    @endpoints.method(POST_METHOD_RESOURCE, Listing,

                      path='post', http_method='POST',

                      name='listings.postListing')

    def post_listing(self,request):

	# Post the document to DB

	post_document = put_doc_from_message(request)

	return doc_to_message(post_document)



    # Endpoints method for printing out the current listings

    @endpoints.method(ListingListRequest, ListingList,

                      path='listlistings', http_method='GET',

                      name='listings.getListings')

    def get_doc_list(self,request):

	docs = index.search(search.Query(""))

	items = [doc_to_message(entity) for entity in docs]

	return ListingList(listings=items)



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

	q = search.Query(request.search_keyword,options=search.QueryOptions(request.num_search_listings))

	try:

		results = index.search(q)

		listResults = [doc_to_message(entity) for entity in results]

	except search.Error:

		logging.exception('Search failed')



	return ListingList(listings=listResults)



    # Endpoints method for deleting all listings

    @endpoints.method(message_types.VoidMessage, DocumentIdx,

                      path='deleteall', http_method='DELETE',

                      name='listings.deleteAll')

    def delete_all_listings(self,request):

	try:

		doc_idx = delete_all_documents("myListings")

	except Exception,e:

		logging.exception('Delete failed.')
		return DocumentIdx(idx='NULL')

	else:
		return doc_idx





APPLICATION = endpoints.api_server([GatewayApi])
