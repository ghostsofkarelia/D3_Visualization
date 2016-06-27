from flask import (
Flask,
request,
render_template
)
import json
from get_govdata import (get_gov_data,format_JSON_data)

app=Flask(__name__,static_url_path='')
app.config['DEBUG'] = True

@app.route('/')
def index():
	return render_template('index.html')
	
@app.route('/getData')
def return_JSON():
	response=get_gov_data()
	valid_response=format_JSON_data(response)
	return json.dumps(valid_response).encode('utf8')
	
"""Running an instance of the flask application"""
if __name__ == '__main__':
	app.run()

	
	
