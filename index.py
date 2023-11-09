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
from werkzeug.security import generate_password_hash, check_password_hash
import paypalrestsdk
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

paypalrestsdk.configure({
  "mode": "sandbox", 
  "client_id": "AbjKwdLo3BCZGYEwe6RV2AOv8YfZHQp_mw22SIjZ3BgERdAlYirlRD4_If5a7Ig8H3-NezemnblSpOPI",
  "client_secret": "EOxAlD-DUhFnD9QOZnhtCxQhEjwWijOcOe5tx5gpZj4t1uB3UGFB3mOyN3Z1bIIB2SOtQK-UL2eTTSg2" })

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

@app.route("/scheduleEntry")
def schedulePage():
    return render_template('schedulePage.html')

@app.route("/adminRegistrationPage")
def adminRegistrationPage():
    return render_template('adminRegistrationPage.html')

@app.route("/adminLoginPage")
def adminloginPage():
    return render_template('adminLoginPage.html')

@app.route("/adminPage")
def adminPage():
    return render_template('adminPage.html')

@app.route("/userRegistration")
def userRegistrationPage():
    return render_template('userRegistrationPage.html')

@app.route("/loginPage")
def loginPage():
    return render_template('userLoginPage.html')

@app.route("/paymentProcessing")
def paymentProcessing():
    return render_template('paymentProcessing.html')

adminCollection = db['savedAdminData']

class User:
    def __init__(self, username, firstName, lastName, email, password, role='user'):
        self.username = username
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.password = generate_password_hash(password)
        self.role = role

    def to_json(self):
        return {
            "username": self.username,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "email": self.email,
            "password": self.password,
            "role": self.role
        }
    
adminCollection = db['savedAdminData']
class AdminUser:
    def __init__(self, username, firstName, lastName, email, password):
        self.username = username
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.password = generate_password_hash(password)
        
    def toJson(self):
        return {
            "username": self.username,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "email": self.email,
            "password": self.password
        }

@app.route('/signupAdmin', methods=['POST'])
def adminSignup():
    data = request.get_json()
    admin_username = data.get('adminUsername')
    admin_first_name = data.get('adminFirstName')
    admin_last_name = data.get('adminLastName')
    admin_email = data.get('adminEmail')
    admin_confirm_email = data.get('adminConfirmEmail')
    admin_password = data.get('adminPassword')
    admin_confirm_password = data.get('adminConfirmPassword')
    
    if admin_email != admin_confirm_email:
        return jsonify({'status': 'fail', 'message': 'Emails do not match.'})
    if admin_password != admin_confirm_password:
        return jsonify({'status': 'fail', 'message': 'Passwords do not match.'})

    existing_admin = db.users.find_one({'email': admin_email})
    if existing_admin is None:
        new_admin = User(admin_username, admin_first_name, admin_last_name, admin_email, admin_password, 'admin')
        db.users.insert_one(new_admin.to_json())
        session['adminUsername'] = admin_username
        session['role'] = 'admin'
        return jsonify({'status': 'success', 'message': 'Admin successfully registered.'})
    else:
        return jsonify({'status': 'fail', 'message': 'Admin already exists.'})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()  
    username = data.get('username')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    
    if email != data.get('confirmEmail'):
        return jsonify({'status': 'fail', 'message': 'Emails do not match.'})
    if password != confirm_password:
        return jsonify({'status': 'fail', 'message': 'Passwords do not match.'})

    existing_user = db.users.find_one({'email': email})
    if existing_user is None:
 
        new_user = User(username, first_name, last_name, email, password)
        db.users.insert_one(new_user.to_json())

        return jsonify({'status': 'success', 'message': 'User successfully registered.', 'redirect': url_for('loginPage')})
    else:
        return jsonify({'status': 'fail', 'message': 'User already exists.'})


@app.route('/adminLogin', methods=['POST'])
def adminLogin():
    data = request.get_json() 
    adminEmail = data.get('adminEmail')
    adminPassword = data.get('adminPassword')
    adminUser = db.users.find_one({'email': adminEmail})

    if adminUser and check_password_hash(adminUser['password'], adminPassword):
        adminUsername = adminUser.get('username', None)
        if adminUsername:
            session['adminUsername'] = adminUsername
            return jsonify({'status': 'success', 'message': 'Successfully logged in.', 'redirect': url_for('adminPage')})
        else:
            return jsonify({'status': 'fail', 'message': 'Username does not exist.'})
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid email or password.'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = db.users.find_one({'email': email})
    
    if user and check_password_hash(user['password'], password):
        session['username'] = user['username']
        session['role'] = user.get('role', 'user')  
        redirect_url = 'adminPage' if session['role'] == 'admin' else 'home'
        return jsonify({'status': 'success', 'message': 'Successfully logged in.', 'redirect': url_for(redirect_url)})
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid email or password.'})

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

datesCollection = db['savedDatesData']

@app.route('/api/addDate', methods=['POST'])
def addSavedDate():
    if 'username' in session:
        user_id = session['username']
        date = request.form['date']
        name = request.form['name-entry']
        lastName = request.form['last-name-entry']
        visitors = request.form['visitorsCuantity']
        guided_tour = request.form.get('guidedTourConfirmation', 'Have fun!')
        newDateAdded = {
            "user_id": user_id,
            "fecha": date,
            "name": name,
            "lastName": lastName,
            "visitors": visitors,  
            "guidedTour": guided_tour  
        }
        
        datesCollection.insert_one(newDateAdded)
        session['reservation_info'] = {
            "date": date,
            "name": name,
            "lastName": lastName,
            "visitors": visitors,
            "guidedTour": guided_tour  
        }
        return jsonify({'status': 'success', 'message': 'Date added successfully.'})
    else:
        return jsonify({'status': 'fail', 'message': 'Usuario no autenticado.'})

@app.route('/api/getDates', methods=['GET'])
def getDates():
    if 'username' in session:
        user_id = session['username']
        dates = datesCollection.find({"user_id": user_id})
        events = []
        for date in dates:
            name = date.get('name', '')
            last_name = date.get('lastName', '')
            title = f"{name} {last_name}".strip() if name or last_name else "Zoo Visit"
            event_id = str(date.get('_id', ''))
            events.append({
                'id': event_id,
                'title': title,
                'start': date['fecha'],
                'color': 'green',
                'extendedProps': {
                    'visitors': date.get('visitors', 'Not available'), 
                    'guidedTour': date.get('guidedTour', 'Not available')  
                }
            })
        return jsonify(events)
    else:
        return jsonify([])

@app.route('/payment', methods=['POST'])
def payment():

    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"},
        "redirect_urls": {
            "return_url": "http://localhost:5000/payment/execute",
            "cancel_url": "http://localhost:5000/"},
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "testitem",
                    "sku": "12345",
                    "price": "1000.00",
                    "currency": "USD",
                    "quantity": 1}]},
            "amount": {
                "total": "1000.00",
                "currency": "USD"},
            "description": "This is the payment transaction description."}]})

    if payment.create():
        print('Payment success!')
    else:
        print(payment.error)

    return jsonify({'paymentID' : payment.id})

@app.route('/execute', methods=['POST'])
def execute():
    success = False

    payment = paypalrestsdk.Payment.find(request.form['paymentID'])

    if payment.execute({'payer_id' : request.form['payerID']}):
        print('Execute success!')
        success = True
    else:
        print(payment.error)

    return jsonify({'success' : success})

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
