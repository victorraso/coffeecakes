from flask import Flask, render_template, g, jsonify, send_from_directory, request, redirect, url_for, flash, session
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from dotenv import load_dotenv

import json
import os
import random
import sqlite3
import string
import stripe
import time

load_dotenv()

# token animals list
animal_names = ['ox', 'cat', 'dog', 'bat', 'fox', 'owl', 'cow', 'lion', 'bear', 'wolf', 'frog', 'goat', 'duck', 'deer', 'seal', 'moose', 'crab', 'tiger', 'horse', 'zebra', 'shark', 'panda', 'koala', 'hyena', 'sloth', 'rabbit', 'monkey', 'squirrel', 'jaguar', 'bison', 'goose', 'unicorn', 'dragon', 'eagle', 'hawk']

app = Flask(__name__)

# Path to your SQLite database
DATABASE = 'coffeecakes.db'

# Stripe Keys
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

#Flask Secret Key
app.secret_key = os.getenv('FLASK_SECRET_KEY')

# DATABASE CONNECTION
# connect to sqlite database
def get_db_connection():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

# close the database connection
@app.teardown_appcontext
def close_db_connection(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()


# ROUTES
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/payorder')
def payorder():
    return render_template('payorder.html')

@app.route('/waiting')
def waiting():
    return render_template('waiting.html')

@app.route('/employee')
def employee():
    if 'employee_id' not in session:
        return redirect(url_for('employee_login'))
    return render_template('employee.html')

@app.route('/employee-login')
def employee_login():
    return render_template('employee-login.html')

@app.route('/manager')
def manager():
    if 'manager_logged_in' not in session:
        return redirect(url_for('manager_login'))
    return render_template('manager.html')

@app.route('/manager-sales')
def manager_sales():
    if 'manager_logged_in' not in session:
        return redirect(url_for('manager_login'))
    return render_template('manager-sales.html')

@app.route('/manager-prices')
def manager_prices():
    if 'manager_logged_in' not in session:
        return redirect(url_for('manager_login'))
    return render_template('manager-prices.html')

@app.route('/manager-register')
def manager_register():
    if 'manager_logged_in' not in session:
        return redirect(url_for('manager_login'))
    return render_template('manager-register.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')


# PAYMENT INTENT
# calculate total amount
def calculate_order_total(items):
    total = 0
    for item in items:
        total += item['amountPrice']
    return total

# create a stripe payment intent
@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
    try:
        data = json.loads(request.data)

        intent = stripe.PaymentIntent.create(
            amount=calculate_order_total(data['items']),
            currency='usd',
            # In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'items': json.dumps(data['items']),
            },
        )
        return jsonify({
            'clientSecret': intent['client_secret'],
            # [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
            'dpmCheckerLink': 'https://dashboard.stripe.com/settings/payment_methods/review?transaction_id={}'.format(intent['id']),
        })
    except Exception as e:
        return jsonify(error=str(e)), 403


# CREATE ORDER
@app.route("/create-order", methods=["POST"])
def create_order():
    # create order after successful payment
    data = request.json
    payment_intent_id = data.get("paymentIntentId")

    # Verify payment intent from Stripe
    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
    
    if payment_intent["status"] == "succeeded":
        # Simulate saving order to database
        token = save_order_to_database(payment_intent)
        return jsonify({"success": True, "token": token})
    else:
        return jsonify({"success": False, "error": "Payment not successful"}), 400


def generate_token():
    #generate a unique token
    timestamp = int(time.time())
    # generate a random animal name
    animal = random.choice(animal_names)
    # Generate 4 random digits
    random_numbers = ''.join(random.choices(string.digits, k=4))

    token = f"{timestamp}-{animal.upper()}-{random_numbers}"
    return token

def save_order_to_database(payment_intent):
    # Save order to the databse and return order ID
    db = get_db_connection()
    items = json.loads(payment_intent["metadata"]["items"])

    token = generate_token()

    local_time = datetime.now() 

    db.execute(
        "INSERT INTO orders (token, amount, payment_intent_id, items, created_at) VALUES (?, ?, ?, ?, ?)",
        (token, payment_intent["amount"], payment_intent["id"], json.dumps(items), local_time)
    )
    db.commit()
    db.close()

    return token  # Return the order id to the caller


# STRIPE WEBHOOK
@app.route("/webhook", methods=["POST"])
def stripe_webhook():
    # handles stripe webhooks
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get("Stripe-Signature")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        return jsonify({"error": str(e)}), 400

    # Handle the event
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]

         # Save the order and generate a token
        token = save_order_to_database(payment_intent)

    return jsonify({"status": "success"}), 200


# ITEM PRICE AND SIZE
@app.route('/get-price/<item_name>')
def get_price(item_name):
    db = get_db_connection()
    try:
        price = db.execute('SELECT price FROM items WHERE name = ?', (item_name,)).fetchone()
        if price:
            return jsonify({'price': price['price']})
        else:
            return jsonify({'error': 'Item not found'}), 404
    finally:
        db.close()

@app.route('/get-size/<item_size>')
def get_size(item_size):
    db = get_db_connection()
    try:
        size = db.execute('SELECT extra_cost FROM sizes WHERE size = ?', (item_size,)).fetchone()
        if size:
            return jsonify({'sizeCost': size['extra_cost']})
        else:
            return jsonify({'error': 'Size not found'}), 404
    finally:
        db.close()


# GET ALL ORDERS FROM DB
@app.route('/get-orders', methods=['GET'])
def get_orders():
    db = get_db_connection()
    orders = db.execute("SELECT * FROM orders").fetchall()
    db.close()

    return jsonify({
        'success': True,
        'orders': [
            {
                'id': order['id'],
                'token': order['token'],
                'price': order['amount'],
                'paymentId': order['payment_intent_id'],
                'status': order['status'],
                'date': order['created_at'],
                'ready': order['ready_at'],
                'items': json.loads(order['items']),
            }
            for order in orders
        ]
    })


# UPDATE DB STATUS
@app.route('/update-order-status/<token>', methods=['POST'])
def update_order_status(token):
    db = get_db_connection()
    local_time = datetime.now()
    db.execute('UPDATE orders SET status = "done", ready_at = ? WHERE token = ?', (local_time, token,))
    db.commit()
    db.close()

    return jsonify({'success': True})


# CHECK IF ORDER IS READY TO PICK UP
@app.route('/is-order-ready/<token>', methods=['GET'])
def is_order_ready(token):
    db = get_db_connection()
    try:
        ready = db.execute('SELECT status FROM orders WHERE token = ?', (token,)).fetchone()
        if ready and ready['status'] == 'done':
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Order not ready'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        db.close()


# FETCH ITEMS TABLE FOR MANAGEMENT
@app.route('/get-all-items', methods=['GET'])
def get_all_items():
    db = get_db_connection()
    items = db.execute('SELECT * FROM items').fetchall()
    db.close()

    return jsonify({
        'success': True,
        'items': [
            {
                'id': item['id'],
                'name': item['name'],
                'price': item['price'],
                'category': item['category_id'],
            }
            for item in items
        ]
    })

# FETCH SIZES TABLE
@app.route('/get-all-sizes', methods=['GET'])
def get_all_sizes():
    db = get_db_connection()
    sizes = db.execute('SELECT * FROM sizes').fetchall()
    db.close()

    return jsonify({
        'success': True,
        'sizes': [
            {
                'id': size['id'],
                'name': size['size'],
                'price': size['extra_cost'],
            }
            for size in sizes
        ]
    })
    

# UPDATE NEW PRICES
@app.route('/update-item-price', methods=['POST'])
def update_item_price():
    data = request.get_json()
    item_id = data['item_id']
    item_name = data['item_name']
    new_price = data['new_price']

    if not item_id or not item_name or new_price is None:
        return jsonify({'success': False, 'message': 'Invalid Data'})
    
    db = get_db_connection()

    
    try:
        if item_name in ['Medium', 'Large']:
            db.execute(
                'UPDATE sizes SET extra_cost = ? WHERE id = ? AND size = ?',
                (new_price, item_id, item_name.lower())
            )
        else:  
            db.execute(
                'UPDATE items SET price = ? WHERE id = ? AND name = ?',
                (new_price, item_id, item_name)
            )

        db.commit()  
        return jsonify({'success': True})

    except Exception as e:
        db.rollback() 
        return jsonify({'success': False, 'message': str(e)}), 500

    finally:
        db.close()


# MANAGER LOGIN
def get_manager_credentials(username):
    db = get_db_connection()
    manager = db.execute('SELECT username, password FROM manager WHERE username = ?', (username,)).fetchone()
    db.close()
    return manager

@app.route('/manager-login', methods=['GET', 'POST'])
def manager_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        manager = get_manager_credentials(username)

        if manager:
            db_username, db_password_hash = manager
            if check_password_hash(db_password_hash, password):
                session['manager_logged_in'] = True
                session['manager_username'] = username
                return redirect(url_for('manager'))
            else:
                flash('Invalid password')
        else:
            flash('Username not found')

        return redirect(url_for('manager_login'))
    
    return render_template('manager-login.html')

@app.route('/manager-logout')
def manager_logout():
    session.pop('manager_logged_in', None)
    session.pop('manager_username', None)
    return redirect(url_for('manager_login'))


# REGISTER NEW EMPLOYEE
@app.route('/register-employee', methods=['POST'])
def register_employee():
    username = request.form['username']
    registration_code = request.form['registration_code']
    
    db = get_db_connection()
    try:
        db.execute(
            "INSERT INTO employees (username, registration_code) VALUES (?, ?)",
            (username, registration_code)
        )
        db.commit()
        response = {
            'status': 'success',
            'message': f'Employee registered successfully!'
        }
    except sqlite3.IntegrityError:
        response = {
            'status': 'error',
            'message': 'Employee already exists.'
        }
    finally:
        db.close()
    return jsonify(response)


@app.route('/get-employees')
def get_employees():
    
    db = get_db_connection()
    employees = db.execute('SELECT id, username, registration_code FROM employees').fetchall()
    db.close()

    return jsonify([{
        'id': employee['id'],
        'username': employee['username'],
        'registration_code': employee['registration_code']
    } for employee in employees])


@app.route('/delete-employee/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    db = get_db_connection()
    db.execute('DELETE FROM employees WHERE id = ?', (employee_id,))
    db.commit()
    db.close()

    return '', 204


# EMPLOYEE REGISTRATION 
@app.route('/employee-registration', methods=['POST'])
def employee_registration():
    username = request.form['username']
    registration_code = request.form['registration_code']
    password = request.form['password']
    confirm_password = request.form['confirm_password']

    if password != confirm_password:
        return jsonify({'status': 'error', 'message': 'Passwords do not match.'})

    db = get_db_connection()
    employee = db.execute(
        "SELECT * FROM employees WHERE username = ? AND registration_code = ?",
        (username, registration_code)
    ).fetchone()

    if employee is None:
        return jsonify({'status': 'error', 'message': 'Invalid username or registration code.'})
    
    if employee['is_registered'] == 1:
        db.close()
        return jsonify({'status': 'error', 'message': 'This user is already registered.'})

    hashed_password = generate_password_hash(password)

    db.execute(
        "UPDATE employees SET password_hash = ?, is_registered = 1 WHERE username = ?",
        (hashed_password, username)
    )
    db.commit()
    db.close()

    return jsonify({'status': 'success', 'message': 'Registration successful. You can now log in.'})


@app.route('/employee-login-form', methods=['POST'])
def employee_login_form():
    username = request.form['username']
    password = request.form['password']

    db = get_db_connection()

    employee = db.execute(
        "SELECT * FROM employees WHERE username = ?",
        (username,)
    ).fetchone()

    db.close()

    if employee is None:
        return jsonify({'status': 'error', 'message': 'Invalid username or password.'})

    if not check_password_hash(employee['password_hash'], password):
        return jsonify({'status': 'error', 'message': 'Invalid username or password.'})
    
    session['employee_id'] = employee['id']
    session['employee_username'] = employee['username']

    return jsonify({'status': 'success', 'message': 'Login successful.'})

@app.route('/employee-logout')
def employee_logout():
    session.pop('employee_id', None)
    session.pop('employee_username', None)
    return redirect(url_for('employee_login'))

# MAIN
if __name__ == '__main__':
    app.run(debug=True)
