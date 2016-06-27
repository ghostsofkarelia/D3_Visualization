import requests

def get_gov_data():
	response = requests.get('https://data.seattle.gov/resource/i2xy-tcyk.json')
	return response.json()
	
def format_JSON_data(response):
	expenditure={}
	for item in response:
		program_list=[]
		dept_name=item.get('department','Misc')
		bcl_name=item.get('bcl','Misc')
		program_name=item['program']
		proposed=int(item.get('_2014_proposed',0))
		endorsed=int(item.get('_2014_endorsed',0))
		check_var=expenditure.get(dept_name)
		if check_var!= None:
			check_bcl_var=expenditure[dept_name].get(bcl_name)
			if check_bcl_var!= None:
				temp=expenditure[dept_name][bcl_name]
				temp_dict={}
				temp_dict['name']=program_name
				temp_dict['proposed']=proposed
				temp_dict['endorsed']=endorsed
				temp.append(temp_dict)
		else:
			if dept_name!='':
				bcl={}
				temp_dict={}
				temp_dict['name']=program_name
				temp_dict['proposed']=proposed
				temp_dict['endorsed']=endorsed
				program_list.append(temp_dict)
				bcl[bcl_name]=program_list
				expenditure[dept_name]=bcl
				
	return expenditure
