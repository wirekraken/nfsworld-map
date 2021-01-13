from flask import Flask, render_template, request
from admin_ch import set_changes

app = Flask(__name__)

@app.route('/')
def map():
	return render_template('map.html')

@app.route('/admin', methods=['POST', 'GET'])
def map_admin():

	if request.method == 'POST':
		selected_team = request.form.get('selected-team')
		area_id = request.form.get('area-id')

		set_changes(selected_team, int(area_id))
		
	return render_template('map.html')

if __name__ == '__main__':
	app.run(debug=True)