import requests
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from pymongo import MongoClient
from flask_moment import Moment
import calendar
from flask_mail import Mail, Message
from datetime import datetime
from google.cloud import storage
from google.oauth2 import service_account
from bson import json_util
import json
import os
from dotenv import load_dotenv
app = Flask(__name__)
load_dotenv()
mail_username = os.getenv('MAIL_USERNAME')
mail_password = os.getenv('MAIL_PASSWORD')
mongo_client_string = os.getenv('MONGO_CLIENT')
secret_key = os.getenv('SECRET_KEY')
app.secret_key = secret_key
app.config['MAIL_USERNAME'] = mail_username
app.config['MAIL_PASSWORD'] = mail_password
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
mail = Mail(app)
moment = Moment(app)
client = MongoClient(mongo_client_string)
db = client.Animals
collection = db['data']
collectionReptile = db['Reptile']
collectionBird = db['Birds']
collectionAmphibian = db['Amphibians']
collectionMammal = db['Mammals']

class CustomHTMLCalendar(calendar.HTMLCalendar):
    def __init__(self, year, month, day):
        super().__init__()
        self.year = year
        self.month = month
        self.day = day

    def formatday(self, day, weekday):
        if day == 0:
            return '<td class="noday">&nbsp;</td>'
        elif day == self.day:
            return f'<td class="{self.cssclasses[weekday]} current-day">{day}</td>'
        else:
            return f'<td class="{self.cssclasses[weekday]}">{day}</td>'


@app.route("/")
@app.route("/", methods=['GET', 'POST'])
def home():
    searchTerm = request.args.get('search', '')
    animalData = None
    
    if searchTerm:
        searchFilter = {"name": {"$regex": searchTerm, "$options": "i"}}
        results = collection.find(searchFilter)
        animalData = []
        for result in results:
            name = result.get("name", "No name available")
            image = result.get("image", result.get("Image", "No image available"))
            interestingFact = result.get("interesting-fact", "No interesting fact available")
            animalData.append({"name": name, "image": image, "interestingFact": interestingFact})

    # The calendar logic here
    currentYear = datetime.now().year
    currentMonth = datetime.now().month
    currentDay = datetime.now().day
    cal = CustomHTMLCalendar(currentYear, currentMonth, currentDay)
    calendarHtml = cal.formatmonth(currentYear, currentMonth)
    currentDate = datetime.now().strftime("%B, %d %Y")

    return render_template('home.html', calendarHtml=calendarHtml, currentDate=currentDate, searchTerm=searchTerm, results=animalData)


def header():
    return render_template('headerBlock.html')

def carouselNavBar():
    return render_template('carouselNavbarBlock.html')

def newsCalendarBlock():
    return render_template('scheduleCalendarBlock.html')

def newsBlock():
    return render_template('newsBlock.html')

def videoBlock():
    return render_template('videoBlock.html')

def buyBlock():
    return render_template('buyBlock.html')

def fundraiseBlock():
    return render_template('fundraiseBlock.html')

def testimonialsAndfeedBackBlock():
    return render_template('testimonialsAndfeedBackBlock.html')

def socialMediaBlock():
    return render_template('socialMediaBlock.html')

def aboutUsBlock():
    return render_template('aboutUsBlock.html')

@app.route("/api/mammals")
def get_mammals():
    mammals = collectionMammal.find({})
    mammalsJson = json.loads(json_util.dumps(mammals))
    return jsonify(mammalsJson)


@app.route("/api/reptile")
def get_reptile():
    reptile = collectionReptile.find({})
    reptileJson = json.loads(json_util.dumps(reptile))
    return jsonify(reptileJson)


@app.route("/api/amphibian")
def get_amphibian():
    amphibian = collectionAmphibian.find({})
    amphibianJson = json.loads(json_util.dumps(amphibian))
    return jsonify(amphibianJson)


@app.route("/api/bird")
def get_bird():
    bird = collectionBird.find({})
    birdJson = json.loads(json_util.dumps(bird))
    return jsonify(birdJson)


@app.route('/sendEmail', methods=['POST'])
def sendEmail():
    name = request.form['firstname']
    email = request.form['lastname']
    country = request.form['country']
    subject = request.form['subject']
    message_body = f"Name: {name}\nEmail: {email}\nCountry: {country}\nSubject: {subject}"
    message = Message(subject="Feedback from my page", body=message_body,
                      sender='alfredsnk@gmail.com', recipients=['alfredsnk@gmail.com'])
    mail.send(message)

    return "Message sent!"


class User:
    def __init__(self, userName, email, password):
        self.email = email
        self.password = password
        self.userName = userName

    def to_json(self):
        return {
            "userName": self.userName,
            "email": self.email,
            "password": self.password
        }


@app.route('/signup', methods=['POST'])
def signup():
    email = request.form['email']
    password = request.form['password']
    userName = request.form['userName']
    existingUser = db.users.find_one({'email': email})

    if existingUser is None:
        session['username'] = userName
        newUser = User(userName, email, password)
        db.users.insert_one(newUser.to_json())
        return jsonify({'status': 'success', 'message': 'Successfully registered user.'})
    else:
        return jsonify({'status': 'fail', 'message': 'User already exists.'})


@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']
    user = db.users.find_one({'email': email})

    if user and 'password' in user and user['password'] == password:
        username = user.get('userName', None)
        if username is not None:
            session['username'] = username
            return jsonify({'status': 'success', 'message': 'Successfully logged in.', 'redirect': url_for('home')})
        else:
            return jsonify({'status': 'fail', 'message': 'Username does not exist.'})
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid email or password.'})


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))


googleCredentialsPath = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
creds = service_account.Credentials.from_service_account_file(
    googleCredentialsPath)

client = storage.Client(project='My First Project', credentials=creds)
bucket = client.bucket('zoo-imagestest')

storageClient = storage.Client()

bucket_name = 'zoo-imagestest'
bucket = storageClient.bucket(bucket_name)

if __name__ == '__main__':

    app.run(debug=True)
