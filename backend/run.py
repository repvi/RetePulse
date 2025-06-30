from app import run_flask

if __name__ == '__main__':
    # Start the Flask application
    run_flask(host='0.0.0.0', port=5000, debug=True)