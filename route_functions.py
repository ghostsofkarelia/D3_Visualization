from flask import (
Flask,
request,
render_template
)
import json
from get_govdata import (getGovData,formatJSONData)

app=Flask(__name__,static_url_path='')
app.config['DEBUG'] = True

@app.route('/')
def returnIndex():
	return render_template('index.html')
	
@app.route('/getData')
def returnJSONResponse():
	response=getGovData()
	valid_response=formatJSONData(response)
	return json.dumps(valid_response).encode('utf8')
	
"""Running an instance of the flask application"""
if __name__ == '__main__':
	app.run()

	
	