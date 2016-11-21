This Node JS script was heavily used when testing the Amazon MWS API integration.
Given you've got the valid SellerId, AWSAccessKeyId and SecretKey in credentials.json, it's possible to set an action in config.json with the appropriate parameters and run it with "Node main.js"

It sends a properly signed request, receives a result as xml, then transforms it into json, and saves it in to the results/ folder.
