import requests
from bson.errors import InvalidId
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from bson.objectid import ObjectId
from functools import wraps
from pymongo import MongoClient
from flask_moment import Moment
import calendar
from flask_mail import Mail, Message
from datetime import datetime, timedelta, date
from google.cloud import storage
from google.oauth2 import service_account
from bson import json_util
import json
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import paypalrestsdk
app = Flask(__name__, static_folder='static')
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
  "client_id": os.getenv("PAYPAL_CLIENT_ID"),
  "client_secret": os.getenv("PAYPAL_CLIENT_SECRET")
})
newsCollection = db['newsData']
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


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'adminUsername' in session and session['role'] == 'admin':
            return f(*args, **kwargs)
        else:
            return jsonify({'message': 'Unauthorized access'}), 403
    return decorated_function

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

    currentYear = datetime.now().year
    currentMonth = datetime.now().month
    currentDay = datetime.now().day
    cal = CustomHTMLCalendar(currentYear, currentMonth, currentDay)
    calendarHtml = cal.formatmonth(currentYear, currentMonth)
    currentDate = datetime.now().strftime("%B, %d %Y")
    is_logged_in = 'username' in session

    return render_template('home.html', is_logged_in=is_logged_in, calendarHtml=calendarHtml, currentDate=currentDate, searchTerm=searchTerm, results=animalData)


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

def newsPage():
    return render_template('newsPage.html')

def scrollUpButton():
    return render_template('scrollUpButton.html')

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
    if 'adminUsername' in session and session['role'] == 'admin':
        return render_template('adminPage.html')
    else:
        return redirect(url_for('home')), 403

@app.route("/userRegistration")
def userRegistrationPage():
    return render_template('userRegistrationPage.html')

@app.route("/loginPage")
def loginPage():
    return render_template('userLoginPage.html')

@app.route("/paymentProcessing")
def paymentProcessing():
    return render_template('paymentProcessing.html')

@app.route("/navbarView")
def NavbarView():
    return render_template('navbarBlock.html')

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
    if adminUser and adminUser.get('role') == 'admin' and check_password_hash(adminUser['password'], adminPassword):
        session['adminUsername'] = adminUser.get('username')
        session['role'] = 'admin'
        return jsonify({'status': 'success', 'message': 'Successfully logged in.', 'redirect': url_for('adminPage')})
    else:
        return jsonify({'status': 'fail', 'message': 'Unauthorized access or invalid password.'})


@app.route('/login', methods=['POST'])
def login():
    if 'adminUsername' in session and session['role'] == 'admin':
        return jsonify({'status': 'fail', 'message': 'You cannot log in as a user as an administrator.'}), 403

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = db.users.find_one({'email': email})
    
    if user and check_password_hash(user['password'], password):
        session['username'] = user['username']
        session['role'] = user.get('role', 'user')
        redirect_url = 'home'
        return jsonify({'status': 'success', 'message': 'Successfully logged in.', 'redirect': url_for(redirect_url)})
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid email or password.'})


@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('adminUsername', None)
    return redirect(url_for('home'))

datesCollection = db['savedDatesData']

@app.route('/api/addDate', methods=['POST'])
def addSavedDate():
    if 'username' in session:
        user_id = session['username']
        reservation_date_str = request.form['date']
        reservation_date = datetime.strptime(reservation_date_str, '%Y-%m-%d').date()
        max_reservation_date = date.today() + timedelta(days=30)
        if reservation_date < date.today():
            return jsonify({'status': 'fail', 'message': 'Cant do reservations for past days'}), 400
        if reservation_date > max_reservation_date:
            return jsonify({'status': 'fail', 'message': 'Cant do reservations with more of 30 days.'}), 400
        name = request.form['name-entry']
        lastName = request.form['last-name-entry']
        visitors = request.form['visitorsCuantity']
        guided_tour = request.form.get('guidedTourConfirmation', 'Have fun!')
        newDateAdded = {
            "user_id": user_id,
            "fecha": reservation_date_str,
            "name": name,
            "lastName": lastName,
            "visitors": visitors,
            "guidedTour": guided_tour,
            "confirmed": False
        }
        timestamp = datetime.now()
        newDateAdded['reservationTimestamp'] = timestamp
        result = db.savedDatesData.insert_one(newDateAdded)
        reservation_id = str(result.inserted_id)
        session['reservation_info'] = {
            "date": reservation_date_str,
            "name": name,
            "lastName": lastName,
            "visitors": visitors,
            "guidedTour": guided_tour,
            "reservationId": reservation_id
        }
        return jsonify({'status': 'success', 'message': 'Date added successfully.', 'reservationId': reservation_id})
    else:
        return jsonify({'status': 'fail', 'message': 'Unauthenticated user.'})

@app.route('/api/cancelDate', methods=['POST'])
def cancelDate():
    try:
        user_id = session.get('username')
        if not user_id:
            return jsonify({'status': 'fail', 'message': 'unauthenticated user.'}), 401
        
        event_id = request.json.get('event_id')
        if not event_id:
            return jsonify({'status': 'fail', 'message': 'Event ID not provided.'}), 400

        event = datesCollection.find_one({'_id': ObjectId(event_id), 'user_id': user_id})
        if not event:
            return jsonify({'status': 'fail', 'message': 'Reservation not found.'}), 404
        
        reservation_time = event.get('reservationTimestamp')
        if not isinstance(reservation_time, datetime):
            return jsonify({'status': 'fail', 'message': 'Not valid Timestamp entry.'}), 400

        time_elapsed = (datetime.now() - reservation_time).total_seconds()

        if time_elapsed <= 60:
            datesCollection.delete_one({'_id': ObjectId(event_id)})
            return jsonify({'status': 'success', 'message': 'Reservation successfully canceled.'})
        else:
            return jsonify({'status': 'fail', 'message': 'Reservation cannot be canceled after 24 hours.'})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'fail', 'message': 'Internal server error'}), 500

@app.route('/api/changeDate', methods=['POST'])
def changeDate():
    if 'username' not in session:
        return jsonify({'status': 'fail', 'message': 'Unauthenticated user.'}), 401

    data = request.json
    ticket_id = data.get('ticketId')
    new_date_str = data.get('newDate')

    if not ticket_id or not new_date_str:
        return jsonify({'status': 'fail', 'message': 'Incomplete data.'}), 400

    try:
        new_date = datetime.strptime(new_date_str, '%Y-%m-%d').date()
        today = date.today()
        max_date = today + timedelta(days=30)

        if new_date < today:
            return jsonify({'status': 'fail', 'message': 'The new date cannot be earlier than the current date.'}), 400

        if new_date > max_date:
            return jsonify({'status': 'fail', 'message': 'The new date cannot be later than 30 days from today.'}), 400

        update_result = datesCollection.update_one(
            {'_id': ObjectId(ticket_id), 'user_id': session['username']},
            {'$set': {'fecha': new_date_str}}
        )

        if update_result.modified_count == 1:
            return jsonify({'status': 'success', 'message': 'Date updated successfully.'})
        else:
            return jsonify({'status': 'fail', 'message': 'Could not update date.'}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'fail', 'message': 'Server error'}), 500
    
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

@app.route('/api/confirmPayment', methods=['POST'])
def confirmPayment():
    if 'username' not in session:
        return jsonify({'status': 'fail', 'message': 'Unauthenticated user.'}), 401

    reservation_id = request.json.get('reservationId')
    if not reservation_id:
        return jsonify({'status': 'fail', 'message': 'Reservation ID not provided.'}), 400
    
    reservation = datesCollection.find_one({'_id': ObjectId(reservation_id), 'user_id': session['username']})
    if not reservation:
        return jsonify({'status': 'fail', 'message': 'Reservation not found or does not correspond to the user.'}), 404

    update_result = datesCollection.update_one(
        {'_id': ObjectId(reservation_id)},
        {'$set': {'confirmed': True}}
    )

    if update_result.modified_count == 1:
        return jsonify({'status': 'success', 'message': 'Payment confirmed, schedule updated.'})
    else:
        return jsonify({'status': 'fail', 'message': 'The entry cant be updated.'}), 500

@app.route('/api/getUsers', methods=['GET'])
def getUsers():
    if 'adminUsername' in session:
        users = db.users.find({})
        user_list = [{'username': user['username'], 'role': user['role'], '_id': str(user['_id'])} for user in users]
        return jsonify(user_list)
    else:
        return jsonify({'message': 'Unauthorized access'}), 403
    
@app.route('/api/updateUserRole', methods=['POST'])
def updateUserRole():
    if 'adminUsername' in session:
        data = request.json
        user_id = data['user_id']
        new_role = data['new_role']
        db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'role': new_role}})
        
        # Verificar si el usuario actual cambió su propio rol
        if session['adminUsername'] == user_id:
            session['role'] = new_role

        return jsonify({'message': 'Rol updated successfully'})
    else:
        return jsonify({'message': 'Unauthorized access'}), 403

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'adminUsername' in session and session.get('role') == 'admin':
            return f(*args, **kwargs)
        else:
            return jsonify({'message': 'Unauthorized access'}), 403
    return decorated_function


@app.route('/api/news', methods=['GET'])
def getAllNews():
        newsItems = newsCollection.find({})
        newsList = [json.loads(json_util.dumps(newsItem)) for newsItem in newsItems]
        return jsonify(newsList)

@app.route('/api/news/<newsId>', methods=['GET'])
def getSingleNews(newsId):
    if 'adminUsername' in session:
        newsItem = newsCollection.find_one({'_id': ObjectId(newsId)})
        if newsItem:
            return json_util.dumps(newsItem)
        else:
            return jsonify({'message': 'News not found'}), 404
    else:
        return jsonify({'message': 'Unauthorized access'}), 403

@app.route('/api/news/<newsId>', methods=['PUT'])
def updateNews(newsId):
    if 'adminUsername' in session:
        data = request.json
        updateResult = newsCollection.update_one({'_id': ObjectId(newsId)}, {'$set': data})
        if updateResult.modified_count == 1:
            return jsonify({'message': 'News updated succesfully'})
        else:
            return jsonify({'message': 'News cant be updated'}), 500
    else:
        return jsonify({'message': 'Unauthorized access'}), 403

@app.route('/api/news/<newsId>', methods=['DELETE'])
def deleteNews(newsId):
    if 'adminUsername' in session:
        deleteResult = newsCollection.delete_one({'_id': ObjectId(newsId)})
        if deleteResult.deleted_count == 1:
            return jsonify({'message': 'News successfully deleted'})
        else:
            return jsonify({'message': 'The news could not be deleted'}), 404
    else:
        return jsonify({'message': 'Unauthorized access'}), 403
    
def get_all_news():
    try:
        news_items = newsCollection.find({})
        return [json.loads(json_util.dumps(news_item)) for news_item in news_items]
    except Exception as e:
        print(f"Error getting all news: {e}")
        return None

def get_news_by_id(news_id):
    try:
        return newsCollection.find_one({'_id': ObjectId(news_id)})
    except Exception as e:
        print(f"Error when obtaining the news with ID {news_id}: {e}")
        return None

@app.route('/api/news/<news_id>', methods=['PUT'])
@admin_required
def update_news(news_id, update_data):
    try:
        update_result = newsCollection.update_one({'_id': ObjectId(news_id)}, {'$set': update_data})
        return update_result.modified_count == 1
    except Exception as e:
        print(f"Error updating news with ID {news_id}: {e}")
        return False
    pass

@app.route('/api/news', methods=['POST'])
@admin_required
def create_news(news_data):
    try:
        insert_result = newsCollection.insert_one(news_data)
        return str(insert_result.inserted_id)
    except Exception as e:
        print(f"Error when creating a new news: {e}")
        return None
    pass
@app.route('/api/news/<news_id>', methods=['DELETE'])
@admin_required
def delete_news(news_id):
    try:
        delete_result = newsCollection.delete_one({'_id': ObjectId(news_id)})
        return delete_result.deleted_count == 1
    except Exception as e:
        print(f"Error when deleting the news with ID {news_id}: {e}")
        return False
    pass

@app.route('/api/news/updateMultiple', methods=['PUT'])
@admin_required
def update_multiple_news():
    try:
        data = request.get_json()
        updated_news_list = data['updatedNews'] 
        news_ids = data['newsIds']           
        updated_count = 0
        for news_id, news_data in zip(news_ids, updated_news_list):
            try:
                update_result = newsCollection.update_one(
                    {'_id': ObjectId(news_id)}, 
                    {'$set': news_data}
                )
                if update_result.modified_count == 1:
                    updated_count += 1
            except InvalidId:
                print(f"ID invalid id founded: {news_id}")
        if updated_count == len(news_ids):
            return jsonify({'status': 'success', 'message': 'Changes saved succesfully'})
        elif updated_count > 0:
            return jsonify({'status': 'partial_success', 'message': f'Updated {updated_count} from {len(news_ids)} noticias'})
        else:
            return jsonify({'status': 'fail', 'message': 'No news could be updated'}), 500

    except Exception as e:
        print(f"Error updating news: {e}")
        return jsonify({'status': 'fail', 'message': str(e)}), 500
    
print(update_multiple_news)

@app.route('/api/news/updateImage/<newsId>', methods=['PUT'])
def update_news_image(newsId):
    try:
        newImageUrl = request.json.get('newImageUrl')
        updateResult = newsCollection.update_one(
            {'_id': ObjectId(newsId)}, 
            {'$set': {'image': newImageUrl}}
        )
        if updateResult.modified_count == 1:
            return jsonify({'status': 'success', 'message': 'Image updated successfully'})
        else:
            return jsonify({'status': 'fail', 'message': 'Could not update image'}), 500
    except Exception as e:
        print(f"Error updating image: {e}")
        return jsonify({'status': 'fail', 'message': str(e)}), 500

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
