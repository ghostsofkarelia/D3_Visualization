from flask import Flask
from flask_flatpages import FlatPages
from flask_frozen import Freezer

app=Flask(__name__,static_url_path='')
app.config.from_pyfile('settings.py')
pages = FlatPages(app)
freezer = Freezer(app)

import route_functions
	

	
	
