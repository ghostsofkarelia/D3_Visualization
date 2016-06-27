from flask import (
request,
render_template
)
import json
from get_govdata import (get_gov_data,format_JSON_data)
from __init__ import app

@app.route('/')
def index():
	return render_template('index.html')
	
@app.route('/getData')
def return_JSON():
	response=get_gov_data()
	valid_response=format_JSON_data(response)
	return json.dumps(valid_response).encode('utf8')
	

	
	
