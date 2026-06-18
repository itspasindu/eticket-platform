import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ["HF_TOKEN"],
)

# MongoDB connection
mongo_client = MongoClient(os.environ["MONGO_URI"])
db = mongo_client["test"]  


def get_context(user_message):
    context = ""
    msg = user_message.lower()

    events = list(db.events.find(
        {"isPublished": True},
        {"_id": 1, "title": 1, "description": 1, "category": 1, "venue": 1, "date": 1, "time": 1, "availableSeats": 1, "totalSeats": 1}
    ).limit(20))
    # Convert _id to string
    for e in events:
        e["_id"] = str(e["_id"])
    if events:
        context += f"Available Events:\n{json.dumps(events, default=str, indent=2)}\n\n"

    # If user asks about seats
    if any(word in msg for word in ["seat", "available", "seats", "which seat"]):
        seats = list(db.seats.find(
            {"status": "available"},
            {"_id": 0, "seatNumber": 1, "row": 1, "category": 1, "price": 1, "status": 1}
        ).limit(20))
        if seats:
            context += f"Available Seats:\n{json.dumps(seats, default=str, indent=2)}\n\n"

    # If user asks about price
    if any(word in msg for word in ["price", "cost", "cheap", "cheapest", "how much", "ticket price"]):
        seats = list(db.seats.find(
            {"status": "available"},
            {"_id": 0, "seatNumber": 1, "category": 1, "price": 1}
        ).sort("price", 1).limit(10))  # sort by lowest price
        if seats:
            context += f"Ticket Prices (cheapest first):\n{json.dumps(seats, default=str, indent=2)}\n\n"

    # If user asks about bookings / cancellation
    if any(word in msg for word in ["book", "booking", "how to book", "buy", "purchase", "reserve", "cancel", "refund", "my ticket", "ticket code", "payment", "how to", "steps", "guide", "process", "procedure"]):
        context += """Booking Guide:
        Step 1 - Browse Events: Go to the Events page from the top navigation menu.
        Step 2 - Select Event: Click on the event you want to attend.
        Step 3 - Choose Seats: On the event page you will see a seat map. Click on your preferred seats (green = available, red = taken). You can select up to 6 seats.
        Step 4 - Review Summary: Check your selected seats and total price in the Booking Summary on the right side.
        Step 5 - Click Book Button: Click the Book Seats button to confirm.
        Step 6 - Login Required: If you are not logged in, you will be redirected to login first.
        Step 7 - Payment: Complete the payment using your credit or debit card.
        Step 8 - Confirmation: After payment you will receive a unique ticket code and QR code in your dashboard.
        Step 9 - View Tickets: Go to My Tickets in your dashboard to see all your bookings and QR codes.
        Step 10 - Email: You can also send your ticket to your email from the dashboard.

        Cancellation Policy:
        - Bookings can be cancelled 24 hours before the event for a full refund.
        - Contact support for cancellation requests.

        Payment Info:
        - We accept credit and debit cards.
        - Each booking gets a unique ticket code and QR code.
        - Seats are held for 10 minutes after selection.\n\n"""

    # Default FAQ if nothing matched
    if not context:
        context = """FAQ:
        - To book tickets: Go to the event page, select seats, and pay online.
        - Cancellation: Bookings can be cancelled 24 hours before the event for a full refund.
        - Payment: We accept credit/debit cards.
        - Seat categories available: Economy and others depending on the event.
        - You can view your bookings in your dashboard after logging in."""

    return context


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    history = data.get("history", [])

    if not user_message:
        return jsonify({"reply": "Please send a message."}), 400

    context = get_context(user_message)

    # Build conversation history for AI
    conversation = [
        {
            "role": "system",
            "content": f"""You are a helpful assistant for an e-ticket booking platform in Sri Lanka.
            You only help users with event-related questions such as finding events, booking tickets, seat availability, prices, venues, and dates.

            Here is ALL the current events from our database:
            {context}

            Rules:
            - Search through ALL events in the data above carefully before answering
            - Match user questions to event titles, descriptions and categories
            - For example if user asks "boxing" look for boxing in event titles and descriptions
            - Keep answers short and clear
            - Use bullet points for listing events
            - Always mention event name, date, time, venue and available seats
            - Be friendly and end with a helpful suggestion
            - ONLY answer based on the data provided above
            - NEVER make up events, venues, seats or prices that are not in the data

            Answering rules:
            - If user asks about an event that is NOT in the database → say "Sorry, we don't have any [event name] events available right now."
            - If user asks about a date and no event matches → say "Sorry, we don't have any events on that date right now."
            - If user asks about a place and no event matches → say "Sorry, we don't have any events in that location right now."
            - If user asks anything NOT related to events, tickets, seats, bookings, or this platform → say "Sorry, I can only help with event booking related questions." """
        }
    ]

    # Add previous messages to conversation
    for msg in history[:-1]:  # exclude the last one (current message)
        role = "user" if msg["from"] == "user" else "assistant"
        conversation.append({
            "role": role,
            "content": msg["text"]
        })

    # Add current message
    conversation.append({
        "role": "user",
        "content": user_message
    })

    try:
        completion = client.chat.completions.create(
            model="Qwen/Qwen2.5-VL-72B-Instruct:featherless-ai",
            messages=conversation,
        )
        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({"reply": f"Error: {str(e)}"}), 500
    
    
@app.route("/generate-description", methods=["POST"])
def generate_description():
    data = request.get_json()
    
    event_name = data.get("eventName", "")
    category = data.get("category", "")
    location = data.get("location", "")
    date = data.get("date", "")
    key_details = data.get("keyDetails", "")

    try:
        completion = client.chat.completions.create(
            model="Qwen/Qwen2.5-VL-72B-Instruct:featherless-ai",
            messages=[
                {
                    "role": "user",
                    "content": f"""Write a professional event description for the following event:

                    Event Name: {event_name}
                    Category: {category}
                    Location: {location}
                    Date: {date}
                    Key Details: {key_details}

                    Write 3-4 sentences. Make it exciting and professional. Only return the description text, nothing else."""
                }
            ],
        )
        description = completion.choices[0].message.content
        return jsonify({"description": description})

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
# Similar events (for event detail page) 
@app.route("/recommendations/similar/<event_id>", methods=["GET"])
def similar_events(event_id):
    try:
        all_events = list(db.events.find({"isPublished": True}))

        if len(all_events) < 2:
            return jsonify([])

        # Combine text fields for each event
        for e in all_events:
            # Repeat category 3 times so it has more weight
            e["combined"] = f"{e.get('category','')} {e.get('category','')} {e.get('category','')} {e.get('title','')} {e.get('description','')}"
            e["_id"] = str(e["_id"])

        # TF-IDF vectorization
        tfidf = TfidfVectorizer()
        matrix = tfidf.fit_transform([e["combined"] for e in all_events])

        # Find index of current event
        ids = [e["_id"] for e in all_events]
        if event_id not in ids:
            return jsonify([])

        idx = ids.index(event_id)

        # Calculate similarity scores
        scores = cosine_similarity(matrix[idx], matrix).flatten()
        # Get top 6 similar (skip index 0 which is itself)
        similar_indices = scores.argsort()[::-1][1:7]

        result = []
        for i in similar_indices:
            e = all_events[i]
            result.append({
                "_id": e["_id"],
                "title": e.get("title", ""),
                "category": e.get("category", ""),
                "date": str(e.get("date", "")),
                "time": e.get("time", ""),
                "image": e.get("image", ""),
                "venue": e.get("venue", {}),
                "availableSeats": e.get("availableSeats", 0),
            })

        return jsonify(result)

    except Exception as ex:
        print(f"ERROR similar_events: {ex}")
        return jsonify([])


# Personalized (for homepage + dashboard)
@app.route("/recommendations/personalized/<user_id>", methods=["GET"])
def personalized_events(user_id):
    try:
        # Get user's past bookings
        bookings = list(db.bookings.find({"user": ObjectId(user_id)}))

        if not bookings:
            # No history → return latest events
            latest = list(db.events.find(
                {"isPublished": True},
                {"_id": 1, "title": 1, "category": 1, "date": 1,
                 "time": 1, "image": 1, "venue": 1, "availableSeats": 1}
            ).sort("createdAt", -1).limit(6))
            for e in latest:
                e["_id"] = str(e["_id"])
            return jsonify(latest)

        # Find categories user booked most
        booked_event_ids = [b["event"] for b in bookings]
        booked_events = list(db.events.find({"_id": {"$in": booked_event_ids}}))
        category_count = {}
        for e in booked_events:
            cat = e.get("category", "other")
            category_count[cat] = category_count.get(cat, 0) + 1

        # Sort categories by most booked
        fav_categories = sorted(category_count, key=category_count.get, reverse=True)

        # Find upcoming events in those categories (exclude already booked)
        recommended = list(db.events.find({
            "isPublished": True,
            "category": {"$in": fav_categories},
            "_id": {"$nin": booked_event_ids}
        }, {
            "_id": 1, "title": 1, "category": 1, "date": 1,
            "time": 1, "image": 1, "venue": 1, "availableSeats": 1
        }).limit(6))

        for e in recommended:
            e["_id"] = str(e["_id"])

        return jsonify(recommended)

    except Exception as ex:
        print(f"ERROR personalized: {ex}")
        return jsonify([])


if __name__ == "__main__":
    app.run(debug=True, port=5001)