import os
import json
from datetime import datetime, timezone, timedelta
from app import create_app
from extensions import db
from app.models.user import User
from app.models.property import Property, PropertyImage
from app.models.favorite import Favorite
from app.models.inquiry import Inquiry
from app.models.visit import PropertyVisit
from app.models.notification import Notification
from app.models.transaction import PropertyTransaction
from app.models.contact import ContactMessage

app = create_app()

def seed_database():
    with app.app_context():
        print("Clearing old tables and recreating database...")
        db.drop_all()
        db.create_all()
        
        print("Seeding Users...")
        # 1. Admin
        admin = User(
            full_name='System Administrator',
            email='admin@realestate.com',
            phone='+91 98765 00001',
            role='admin',
            account_status='active',
            agency_name='EstateNexus Central Administration',
            bio='Chief platform supervisor and quality control administrator.'
        )
        admin.set_password('Admin@123')
        db.session.add(admin)
        
        # 2. Agents
        agent1 = User(
            full_name='Rajesh Patel',
            email='rajesh.patel@gujaratproperties.com',
            phone='+91 98250 12345',
            role='agent',
            account_status='active',
            agency_name='Gujarat Premier Realty',
            bio='Over 12 years of experience assisting clients with premium residential and commercial spaces across Ahmedabad and Gandhinagar.'
        )
        agent1.set_password('Agent@123')
        db.session.add(agent1)
        
        agent2 = User(
            full_name='Priya Sharma',
            email='priya.sharma@sharmahomes.in',
            phone='+91 97240 67890',
            role='agent',
            account_status='active',
            agency_name='Metro Landmarks Surat & Baroda',
            bio='Specializing in high-yield luxury riverfront apartments and modern bungalows in Surat and Vadodara.'
        )
        agent2.set_password('Agent@123')
        db.session.add(agent2)
        
        # 3. Buyers
        buyer1 = User(
            full_name='Amit Shah',
            email='amit.shah@gmail.com',
            phone='+91 99090 11223',
            role='buyer',
            account_status='active',
            bio='IT professional looking for a luxury 3 or 4 BHK home in Ahmedabad.'
        )
        buyer1.set_password('Buyer@123')
        db.session.add(buyer1)
        
        buyer2 = User(
            full_name='Neha Desai',
            email='neha.desai@gmail.com',
            phone='+91 98980 44556',
            role='buyer',
            account_status='active',
            bio='Architect seeking contemporary apartments and plots in Gandhinagar and Surat.'
        )
        buyer2.set_password('Buyer@123')
        db.session.add(buyer2)
        
        buyer3 = User(
            full_name='Rohit Mehta',
            email='rohit.mehta@gmail.com',
            phone='+91 98240 77889',
            role='buyer',
            account_status='active',
            bio='Business owner searching for rental commercial spaces and investment properties.'
        )
        buyer3.set_password('Buyer@123')
        db.session.add(buyer3)
        
        db.session.commit()
        print("Users seeded successfully.")
        
        print("Seeding Properties...")
        
        properties_data = [
            {
                'agent_id': agent1.id,
                'title': 'Luxurious 3 BHK Penthouse with Terrace Garden',
                'description': 'Spectacular double-height penthouse situated in the heart of Bodakdev. Features Italian marble flooring, expansive terrace garden with panoramic skyline views, modular German kitchen, and private elevator access.',
                'property_type': 'Apartment',
                'purpose': 'Buy',
                'price': 18500000.0,
                'location': 'Judges Bungalow Road, Bodakdev',
                'city': 'Ahmedabad',
                'state': 'Gujarat',
                'area_sqft': 2450.0,
                'bedrooms': 3,
                'bathrooms': 3,
                'furnishing': 'Furnished',
                'parking': 'Covered',
                'amenities': ['Swimming Pool', 'Clubhouse', 'Gymnasium', '24x7 Security', 'Terrace Garden', 'Reserved Parking', 'Power Backup', 'EV Charging'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent1.id,
                'title': 'Modern 4 BHK Contemporary Villa with Private Pool',
                'description': 'Exquisite independent architectural villa in South Bopal. Offers 4 master suites, lush landscaped lawn, private splash pool, acoustic home theater room, and automated smart-home lighting and climate controls.',
                'property_type': 'Villa',
                'purpose': 'Buy',
                'price': 26500000.0,
                'location': 'South Bopal, Near DPS School',
                'city': 'Ahmedabad',
                'state': 'Gujarat',
                'area_sqft': 3400.0,
                'bedrooms': 4,
                'bathrooms': 4,
                'furnishing': 'Semi-Furnished',
                'parking': 'Covered',
                'amenities': ['Private Swimming Pool', 'Private Garden', 'Home Automation', 'Security Surveillance', 'Modular Kitchen', 'Servant Quarters'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent1.id,
                'title': 'Premium 2 BHK Sunlit Flat on SG Highway',
                'description': 'Well-ventilated East-facing apartment close to Vaishnodevi Circle on SG Highway. Gated township with Olympic-grade amenities, kids play zones, and seamless highway connectivity.',
                'property_type': 'Flat',
                'purpose': 'Buy',
                'price': 5800000.0,
                'location': 'Near Vaishnodevi Circle, SG Highway',
                'city': 'Ahmedabad',
                'state': 'Gujarat',
                'area_sqft': 1250.0,
                'bedrooms': 2,
                'bathrooms': 2,
                'furnishing': 'Furnished',
                'parking': 'Open',
                'amenities': ['Gymnasium', 'Jogging Track', 'CCTV Security', 'Children Play Area', 'Lush Green Park', 'Intercom'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent1.id,
                'title': 'Spacious 3 BHK High-Rise Flat for Rent in Prahlad Nagar',
                'description': 'Fully furnished 3 BHK home in prestigious residential tower in Prahlad Nagar. Features air conditioning in all rooms, king size beds, 65-inch LED TV, high-speed fiber internet, and covered car parking.',
                'property_type': 'Flat',
                'purpose': 'Rent',
                'price': 38000.0,
                'location': 'Near Prahlad Nagar Garden, Anandnagar',
                'city': 'Ahmedabad',
                'state': 'Gujarat',
                'area_sqft': 1850.0,
                'bedrooms': 3,
                'bathrooms': 3,
                'furnishing': 'Furnished',
                'parking': 'Covered',
                'amenities': ['Clubhouse', 'Gym', '24x7 Security', 'Piped Gas Line', 'Power Backup', 'High Speed Elevators'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent1.id,
                'title': 'Corporate Grade Office Space in GIFT City',
                'description': 'Grade-A tech enabled commercial office floor in India’s foremost financial tech hub GIFT City. Features centralized VRV air conditioning, high-speed fiber connectivity, cafeteria, and 24/7 security.',
                'property_type': 'Office',
                'purpose': 'Rent',
                'price': 85000.0,
                'location': 'Tower A, GIFT City SEZ',
                'city': 'Gandhinagar',
                'state': 'Gujarat',
                'area_sqft': 2800.0,
                'bedrooms': 0,
                'bathrooms': 2,
                'furnishing': 'Furnished',
                'parking': 'Covered',
                'amenities': ['Central Air Conditioning', '24x7 Security', 'High Speed Elevators', 'Cafeteria', 'Conference Hall', 'Power Backup'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent1.id,
                'title': 'Serene 3 BHK Eco-Living Apartment in Kudasan',
                'description': 'Thoughtfully designed 3 BHK home overlooking green landscapes in Kudasan, Gandhinagar. Minutes from TCS Garima Park and PDPU. Solar water heating, rainwater harvesting, and jogging park.',
                'property_type': 'Apartment',
                'purpose': 'Buy',
                'price': 7200000.0,
                'location': 'Near Bhaijipura Cross Road, Kudasan',
                'city': 'Gandhinagar',
                'state': 'Gujarat',
                'area_sqft': 1680.0,
                'bedrooms': 3,
                'bathrooms': 3,
                'furnishing': 'Semi-Furnished',
                'parking': 'Covered',
                'amenities': ['Clubhouse', 'Solar Water Heater', 'Children Play Zone', 'Gymnasium', 'Badminton Court', '24x7 Security'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent1.id,
                'title': 'Grand 5 BHK Independent Royal Bungalow',
                'description': 'Stately 5 BHK duplex bungalow located in posh sector along Infocity Road. High perimeter walls, private servant quarter, marble temple alcove, 3 car parking porch, and wooden flooring in master suite.',
                'property_type': 'House',
                'purpose': 'Buy',
                'price': 34000000.0,
                'location': 'Sector 8 / Infocity Road',
                'city': 'Gandhinagar',
                'state': 'Gujarat',
                'area_sqft': 4200.0,
                'bedrooms': 5,
                'bathrooms': 5,
                'furnishing': 'Furnished',
                'parking': 'Covered',
                'amenities': ['Private Garden', 'Security Surveillance', 'Servant Quarters', 'Solar Panel Array', 'Covered Porch', 'Study Room'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent2.id,
                'title': 'Ultra-Luxury 4 BHK Riverfront Flat in Vesu',
                'description': 'Prestigious high-rise condominium in Surat’s premier residential area. Offers unhindered river breeze, expansive glass balconies, VRV air cooling, Jacuzzi tub, and Italian granite countertops.',
                'property_type': 'Apartment',
                'purpose': 'Buy',
                'price': 21500000.0,
                'location': 'VIP Road, Vesu',
                'city': 'Surat',
                'state': 'Gujarat',
                'area_sqft': 3100.0,
                'bedrooms': 4,
                'bathrooms': 4,
                'furnishing': 'Furnished',
                'parking': 'Covered',
                'amenities': ['Infinity Pool', 'Sky Lounge', 'Gym & Spa', 'Concierge Service', 'Banqueting Hall', '24x7 Security', 'Electric Vehicle Bay'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent2.id,
                'title': 'Prime Commercial Retail Showroom on Main Road',
                'description': 'Double fronted ground-floor commercial showroom in bustling Adajan. Massive 40-foot road frontage, 14-foot slab height, heavy footfall zone, ideal for jewelry showroom, bank, or luxury apparel flagship.',
                'property_type': 'Commercial',
                'purpose': 'Buy',
                'price': 12500000.0,
                'location': 'Adajan Main Road, Near LP Savani School',
                'city': 'Surat',
                'state': 'Gujarat',
                'area_sqft': 1500.0,
                'bedrooms': 0,
                'bathrooms': 1,
                'furnishing': 'Unfurnished',
                'parking': 'Open',
                'amenities': ['Main Road Visibility', '24x7 Security', 'Dedicated Customer Parking', 'Water Connection', 'Three Phase Power'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent2.id,
                'title': 'Cozy 2 BHK Fully Furnished Flat in Piplod',
                'description': 'Clean, bright 2 BHK flat for rent situated on high floor near Dumas Road. Equipped with stylish Scandinavian furniture, washing machine, refrigerator, gas pipeline, and dedicated basement parking.',
                'property_type': 'Flat',
                'purpose': 'Rent',
                'price': 22000.0,
                'location': 'Dumas Road, Piplod',
                'city': 'Surat',
                'state': 'Gujarat',
                'area_sqft': 1300.0,
                'bedrooms': 2,
                'bathrooms': 2,
                'furnishing': 'Furnished',
                'parking': 'Covered',
                'amenities': ['Elevator', 'Security Guard', 'Piped Gas', 'Clubhouse', 'Play Area'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1502005229762-ee152da92e06?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent2.id,
                'title': 'Charming 3 BHK Heritage Villa in Alkapuri',
                'description': 'Classic vintage styled 3 bedroom independent home nestled in Vadodara’s greenest residential enclave, Alkapuri. Solid Burma teak doors, private shaded porch, front lawn, and serene neighbourhood.',
                'property_type': 'Villa',
                'purpose': 'Buy',
                'price': 14500000.0,
                'location': 'RC Dutt Road, Alkapuri',
                'city': 'Vadodara',
                'state': 'Gujarat',
                'area_sqft': 2600.0,
                'bedrooms': 3,
                'bathrooms': 3,
                'furnishing': 'Semi-Furnished',
                'parking': 'Covered',
                'amenities': ['Private Garden', 'Antique Woodwork', 'Covered Porch', 'Borewell & Corporation Water', 'Security System'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent2.id,
                'title': 'Affordable 2 BHK Gated Community Flat in Gotri',
                'description': 'Ideal for young families and investors. Modern 2 BHK flat near Sevasi Canal road. High rental yields, proximity to top schools, supermarkets, and healthcare facilities.',
                'property_type': 'Flat',
                'purpose': 'Buy',
                'price': 4400000.0,
                'location': 'New Gotri Road, Near Yash Complex',
                'city': 'Vadodara',
                'state': 'Gujarat',
                'area_sqft': 1120.0,
                'bedrooms': 2,
                'bathrooms': 2,
                'furnishing': 'Unfurnished',
                'parking': 'Open',
                'amenities': ['Elevator', '24x7 Security', 'Community Hall', 'Jogging Track', 'Children Play Area'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent2.id,
                'title': 'Executive 3 BHK Penthouse for Rent in Vasna-Bhayli',
                'description': 'Spectacular 3 BHK top-floor terrace apartment in Vasna Bhayli. Fully modular Italian kitchen, walk-in closets, huge terrace for outdoor parties, and 2 designated covered car parking slots.',
                'property_type': 'Apartment',
                'purpose': 'Rent',
                'price': 32000.0,
                'location': 'Bhayli Canal Road, Vasna',
                'city': 'Vadodara',
                'state': 'Gujarat',
                'area_sqft': 2100.0,
                'bedrooms': 3,
                'bathrooms': 3,
                'furnishing': 'Furnished',
                'parking': 'Covered',
                'amenities': ['Clubhouse', 'Gym', 'Swimming Pool', 'Terrace Deck', 'Piped Gas', 'Security CCTV'],
                'listing_status': 'approved',
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                'agent_id': agent1.id,
                'title': 'Upcoming 4 BHK Designer Villa (Awaiting Admin Review)',
                'description': 'Brand new ultra modern luxury villa on Science City road. Under admin verification to demonstrate the approval workflow. 4 master suites, solar power plant, and landscaped courtyard.',
                'property_type': 'Villa',
                'purpose': 'Buy',
                'price': 29000000.0,
                'location': 'Science City Road, Sola',
                'city': 'Ahmedabad',
                'state': 'Gujarat',
                'area_sqft': 3600.0,
                'bedrooms': 4,
                'bathrooms': 5,
                'furnishing': 'Furnished',
                'parking': 'Covered',
                'amenities': ['Home Theater', 'Solar Electricity', 'Private Lawn', 'Automated Gates', 'Servant Room'],
                'listing_status': 'pending',  # PENDING to demonstrate Admin Approval feature!
                'availability_status': 'available',
                'images': [
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
                ]
            }
        ]
        
        created_properties = []
        for prop_data in properties_data:
            images = prop_data.pop('images', [])
            prop = Property(**prop_data)
            prop.set_amenities_list(prop_data['amenities'])
            db.session.add(prop)
            db.session.flush()
            
            for idx, img_url in enumerate(images):
                p_img = PropertyImage(
                    property_id=prop.id,
                    image_url=img_url,
                    is_featured=(idx == 0)
                )
                db.session.add(p_img)
                
            created_properties.append(prop)
            
        db.session.commit()
        print(f"Created {len(created_properties)} properties successfully.")
        
        print("Seeding Favorites...")
        # Buyer 1 favorites property 1 and property 2
        f1 = Favorite(user_id=buyer1.id, property_id=created_properties[0].id)
        f2 = Favorite(user_id=buyer1.id, property_id=created_properties[1].id)
        # Buyer 2 favorites property 5 and property 8
        f3 = Favorite(user_id=buyer2.id, property_id=created_properties[4].id)
        f4 = Favorite(user_id=buyer2.id, property_id=created_properties[7].id)
        db.session.add_all([f1, f2, f3, f4])
        
        print("Seeding Inquiries...")
        inq1 = Inquiry(
            property_id=created_properties[0].id,
            buyer_id=buyer1.id,
            agent_id=agent1.id,
            message="Hi Rajesh, is the price for this Bodakdev penthouse negotiable? We would like to inspect the property this weekend.",
            phone='+91 99090 11223',
            preferred_time='Saturday 11:00 AM',
            status='responded',
            response_message='Hello Amit! Yes, there is slight room for negotiation for serious buyers. Let us schedule a site visit.'
        )
        inq2 = Inquiry(
            property_id=created_properties[7].id,
            buyer_id=buyer2.id,
            agent_id=agent2.id,
            message="Interested in this Vesu riverfront flat. Could you please share the floor plan and maintenance charges?",
            phone='+91 98980 44556',
            preferred_time='Weekdays after 6 PM',
            status='pending'
        )
        db.session.add_all([inq1, inq2])
        
        print("Seeding Property Visits...")
        visit1 = PropertyVisit(
            property_id=created_properties[0].id,
            buyer_id=buyer1.id,
            agent_id=agent1.id,
            visit_date=(datetime.now(timezone.utc) + timedelta(days=2)).strftime('%Y-%m-%d'),
            visit_time='11:00 AM - 12:00 PM',
            notes='Interested in reviewing penthouse ceiling height and terrace view.',
            status='confirmed',
            agent_notes='Confirmed. Gate pass arranged at the society entrance.'
        )
        visit2 = PropertyVisit(
            property_id=created_properties[4].id,
            buyer_id=buyer3.id,
            agent_id=agent1.id,
            visit_date=(datetime.now(timezone.utc) + timedelta(days=4)).strftime('%Y-%m-%d'),
            visit_time='03:00 PM - 04:00 PM',
            notes='Looking for IT office lease for 3 years.',
            status='pending'
        )
        db.session.add_all([visit1, visit2])
        
        print("Seeding Notifications...")
        n1 = Notification(
            user_id=buyer1.id,
            title='Visit Confirmed',
            message="Agent Rajesh Patel confirmed your visit for 'Luxurious 3 BHK Penthouse' on Saturday at 11:00 AM.",
            link='/buyer/visits',
            type='visit'
        )
        n2 = Notification(
            user_id=agent1.id,
            title='New Inquiry Received',
            message="Amit Shah sent an inquiry on 'Luxurious 3 BHK Penthouse'.",
            link='/agent/inquiries',
            type='inquiry'
        )
        n3 = Notification(
            user_id=admin.id,
            title='Pending Property Approval',
            message="Agent Rajesh Patel submitted 'Upcoming 4 BHK Designer Villa' requiring review.",
            link='/admin/properties',
            type='listing'
        )
        db.session.add_all([n1, n2, n3])
        
        print("Seeding Transactions & Contact Messages...")
        t1 = PropertyTransaction(
            property_id=created_properties[9].id,
            agent_id=agent2.id,
            buyer_id=buyer3.id,
            transaction_type='rented',
            amount=22000.0,
            transaction_date=(datetime.now(timezone.utc) - timedelta(days=5)).strftime('%Y-%m-%d'),
            notes='11-month lease agreement executed with 2 months deposit.'
        )
        c1 = ContactMessage(
            name='Kavita Joshi',
            email='kavita.joshi@example.com',
            phone='+91 98790 55443',
            subject='Inquiry regarding commercial property investment in GIFT City',
            message='Hello team, I am looking for corporate grade office spaces for a fintech startup in GIFT City. Please connect me with the right agent.'
        )
        db.session.add_all([t1, c1])
        
        db.session.commit()
        print("Database seeded completely and successfully!")

if __name__ == '__main__':
    seed_database()
