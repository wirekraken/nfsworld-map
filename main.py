from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def map():
	return render_template('map.html')

if __name__ == '__main__':
	app.run(debug=True)