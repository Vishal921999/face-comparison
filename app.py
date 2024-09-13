from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/compare-faces', methods=['POST'])
def compare_faces():
    try:
        data = request.get_json()
        image1_path = data.get('image1_path')
        image2_path = data.get('image2_path')
        print("Received data:", data)
        # image1_path = data['image1_path']
        # image2_path = data['image2_path']
        #face_locations_one = data['face_locations_one']
        #face_locations_two = data['face_locations_two']

        # Verify image file existence
        if not os.path.exists(image1_path) or not os.path.exists(image2_path):
            return jsonify({'error': 'Image file not found'}), 400

        # Load and process the images
        image1 = face_recognition.load_image_file(image1_path)
        image2 = face_recognition.load_image_file(image2_path)
        print('image loaded')

        # Convert face location dictionaries to dlib.rectangles
        #rect_one = create_rectangle(face_locations_one)
        #rect_two = create_rectangle(face_locations_two)

        # Get face encodings for the detected face locations
        face_encodings1 = face_recognition.face_encodings(image1)
        face_encodings2 = face_recognition.face_encodings(image2)
        print('encodings done')

        if not face_encodings1 or not face_encodings2:
            return jsonify({'error': 'Face encoding failed, possibly no faces detected.'}), 400

        face_encoding1 = face_encodings1[0]
        face_encoding2 = face_encodings2[0]
        print('near result')
        
        # Compare the faces
        results = face_recognition.compare_faces([face_encoding1], face_encoding2)
        match = results[0]
        print('match done')
        print(match)

        result = {
            'match': bool(match)
        }

        return jsonify(result)

    except IndexError:
        return jsonify({'error': 'Face encoding failed, possibly no faces detected.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
