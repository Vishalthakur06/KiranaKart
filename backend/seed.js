const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const Product = require("./models/Product");

// All images use https://picsum.photos/seed/<slug>/400/400
// Free public CDN — no API key, no referrer needed. Each seed string
// maps to a consistent photo so re-running the seeder keeps the same images.

const products = [
  // ─── GRAINS ───────────────────────────────────────────────────────────────
  { name: "India Gate Basmati Rice (5kg)", price: 375, description: "Premium aged basmati rice, extra long grain. Perfect for biryani & pulao.", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop", stock: 50, category: "Grains" },
  { name: "Aashirvaad Whole Wheat Atta (5kg)", price: 285, description: "100% whole wheat, freshly milled atta. Makes soft & delicious rotis.", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop", stock: 40, category: "Grains" },
  { name: "Daawat Super Basmati Rice (1kg)", price: 95, description: "Long-grain, aromatic basmati rice ideal for everyday cooking.", image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop", stock: 60, category: "Grains" },
  { name: "Rajdhani Besan (1kg)", price: 75, description: "Fine-ground gram flour for pakoras, kadhi, and Indian sweets.", image: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&h=400&fit=crop", stock: 55, category: "Grains" },
  { name: "Sujata Maida (1kg)", price: 45, description: "Refined all-purpose flour for baking, parathas, and naan.", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop", stock: 70, category: "Grains" },
  { name: "Quaker Oats (500g)", price: 110, description: "100% natural whole grain oats. Quick to cook, high in fibre.", image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=400&fit=crop", stock: 45, category: "Grains" },
  { name: "Rajdhani Sooji / Semolina (500g)", price: 38, description: "Fine semolina for upma, halwa, and rava dosa.", image: "https://images.unsplash.com/photo-1599909533730-f9d7e4f2e3b5?w=400&h=400&fit=crop", stock: 65, category: "Grains" },
  { name: "Organic Tattva Brown Rice (1kg)", price: 130, description: "Unpolished brown rice, rich in bran and nutrients. Healthy alternative.", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop", stock: 30, category: "Grains" },
  { name: "Aashirvaad Multigrain Atta (5kg)", price: 340, description: "Blend of 6 grains for a nutritious, wholesome roti experience.", image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=400&fit=crop", stock: 35, category: "Grains" },

  // ─── PULSES ───────────────────────────────────────────────────────────────
  { name: "Premium Toor Dal (1kg)", price: 140, description: "Fresh split pigeon peas, ideal for dal tadka and sambar.", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop", stock: 75, category: "Pulses" },
  { name: "Green Moong Dal (500g)", price: 80, description: "High-protein green moong dal. Perfect for dal khichdi and sprouts.", image: "https://images.unsplash.com/photo-1607672632458-9eb56696346b?w=400&h=400&fit=crop", stock: 60, category: "Pulses" },
  { name: "Masoor Dal (1kg)", price: 110, description: "Split red lentils, quick-cooking and nutritious. Great for soups & dal.", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop", stock: 70, category: "Pulses" },
  { name: "Chana Dal (1kg)", price: 95, description: "Split Bengal gram dal, nutty flavour. Ideal for dal and snacks.", image: "https://images.unsplash.com/photo-1599909533730-f9d7e4f2e3b5?w=400&h=400&fit=crop", stock: 65, category: "Pulses" },
  { name: "Kabuli Chana / Chickpeas (500g)", price: 85, description: "Large white chickpeas for chole, hummus, and salads.", image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=400&fit=crop", stock: 50, category: "Pulses" },
  { name: "Urad Dal (500g)", price: 90, description: "Black gram dal for idli, dosa batter, and makhani dal.", image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=400&fit=crop", stock: 55, category: "Pulses" },
  { name: "Rajma (500g)", price: 100, description: "Premium kidney beans from Jammu, perfect for rajma chawal.", image: "https://images.unsplash.com/photo-1583007492116-9ac1a7905b50?w=400&h=400&fit=crop", stock: 45, category: "Pulses" },
  { name: "Black Eyed Peas / Lobia (500g)", price: 75, description: "Tender black-eyed peas, protein-rich and easy to digest.", image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&h=400&fit=crop", stock: 40, category: "Pulses" },

  // ─── OILS ─────────────────────────────────────────────────────────────────
  { name: "Fortune Sunflower Oil (1L)", price: 160, description: "Light & healthy sunflower oil, rich in Vitamin E. Great for daily cooking.", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop", stock: 45, category: "Oils" },
  { name: "Saffola Gold Blended Oil (1L)", price: 185, description: "Blended rice bran and sunflower oil for a heart-healthy choice.", image: "https://images.unsplash.com/photo-1608181831042-c5f5d5e1e8b6?w=400&h=400&fit=crop", stock: 40, category: "Oils" },
  { name: "Patanjali Cow Ghee (500ml)", price: 320, description: "Pure bilona cow ghee with rich aroma. Traditional clarified butter.", image: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=400&h=400&fit=crop", stock: 30, category: "Oils" },
  { name: "Dabur Sesame Oil (500ml)", price: 175, description: "Cold-pressed sesame oil ideal for South Indian cooking and dressings.", image: "https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=400&h=400&fit=crop", stock: 35, category: "Oils" },
  { name: "KLF Coconut Oil (500ml)", price: 145, description: "Pure cold-pressed coconut oil, great for Kerala cuisine and hair care.", image: "https://images.unsplash.com/photo-1598579677605-e0c2c2e9e1f7?w=400&h=400&fit=crop", stock: 40, category: "Oils" },
  { name: "Fortune Kachi Ghani Mustard Oil (1L)", price: 170, description: "Traditional cold-pressed mustard oil with pungent aroma for pickles & tempering.", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop", stock: 50, category: "Oils" },

  // ─── DAIRY ────────────────────────────────────────────────────────────────
  { name: "Amul Butter (500g)", price: 280, description: "India's favourite butter made from fresh cream. Rich taste guaranteed.", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop", stock: 30, category: "Dairy" },
  { name: "Amul Full Cream Milk (1L)", price: 68, description: "Fresh full cream milk, packed with nutrients. Pasteurised & homogenised.", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop", stock: 80, category: "Dairy" },
  { name: "Amul Paneer (200g)", price: 90, description: "Fresh, soft cottage cheese from Amul. Perfect for curries and tikka.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop", stock: 40, category: "Dairy" },
  { name: "Mother Dairy Dahi / Curd (400g)", price: 50, description: "Thick and creamy set curd with live cultures. Great with meals.", image: "https://images.unsplash.com/photo-1571212515416-fca2ce42c9f5?w=400&h=400&fit=crop", stock: 55, category: "Dairy" },
  { name: "Amul Mozzarella Cheese (200g)", price: 165, description: "Stretchy mozzarella for pizzas, pastas, and sandwiches.", image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=400&fit=crop", stock: 25, category: "Dairy" },
  { name: "Amul Cream (200ml)", price: 80, description: "Rich fresh cream for gravies, desserts, and whipping.", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop", stock: 35, category: "Dairy" },
  { name: "Nestlé Slim Milk (1L)", price: 62, description: "Low-fat toned milk with all essential nutrients. Perfect for diet-conscious consumers.", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop", stock: 50, category: "Dairy" },
  { name: "Amul Lassi Sweet (200ml)", price: 30, description: "Chilled sweet lassi made with real curd. Refreshing Punjabi drink.", image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop", stock: 60, category: "Dairy" },

  // ─── BEVERAGES ────────────────────────────────────────────────────────────
  { name: "Tata Tea Premium (500g)", price: 315, description: "Finest Assam tea blend. Strong aroma and great taste for the perfect chai.", image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop", stock: 35, category: "Beverages" },
  { name: "Bru Instant Coffee (200g)", price: 225, description: "India's most loved instant coffee for a perfect morning kick.", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop", stock: 25, category: "Beverages" },
  { name: "Red Label Natural Care Tea (250g)", price: 185, description: "Immunity-boosting tea with 5 Ayurvedic herbs. Warm and aromatic.", image: "https://images.unsplash.com/photo-1597318130878-11e395f6e4d6?w=400&h=400&fit=crop", stock: 40, category: "Beverages" },
  { name: "Nescafé Classic (100g)", price: 275, description: "Rich and smooth instant coffee. The world's favourite coffee brand.", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop", stock: 30, category: "Beverages" },
  { name: "Paper Boat Aam Panna (200ml)", price: 35, description: "Tangy raw mango drink with a hint of spice. Refreshing summer cooler.", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop", stock: 50, category: "Beverages" },
  { name: "Real Fruit Juice - Mixed Fruit (1L)", price: 115, description: "No added preservatives, 100% fruit juice blend. Healthy & refreshing.", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop00/400", stock: 40, category: "Beverages" },
  { name: "Bournvita (500g)", price: 250, description: "Chocolate malt health drink packed with vitamins and minerals for kids.", image: "https://picsum.photos/seed/bournvita/400/400", stock: 35, category: "Beverages" },
  { name: "Dabur Honey Lemon Green Tea (25 bags)", price: 135, description: "Antioxidant-rich green tea with natural honey lemon flavour.", image: "https://picsum.photos/seed/green-tea/400/400", stock: 45, category: "Beverages" },
  { name: "Tropicana Orange Juice (1L)", price: 130, description: "Premium orange juice with pulp, no added sugar or preservatives.", image: "https://picsum.photos/seed/orange-juice/400/400", stock: 30, category: "Beverages" },

  // ─── SNACKS ───────────────────────────────────────────────────────────────
  { name: "Parle-G Biscuits (800g)", price: 65, description: "The original glucose biscuit, loved by generations. Crispy and delicious.", image: "https://picsum.photos/seed/parle-g/400/400", stock: 90, category: "Snacks" },
  { name: "Haldiram's Aloo Bhujia (400g)", price: 120, description: "Crispy, spiced potato sev from Haldiram's. A classic Indian snack.", image: "https://picsum.photos/seed/aloo-bhujia/400/400", stock: 60, category: "Snacks" },
  { name: "Lay's Classic Salted Chips (100g)", price: 40, description: "Light and crispy potato chips with a perfect hint of salt.", image: "https://picsum.photos/seed/lays-chips/400/400", stock: 80, category: "Snacks" },
  { name: "Britannia Good Day Butter Cookies (250g)", price: 45, description: "Buttery, melt-in-the-mouth cookies. Perfect with tea.", image: "https://picsum.photos/seed/good-day-cookies/400/400", stock: 70, category: "Snacks" },
  { name: "Maggi 2-Minute Noodles (12 pack)", price: 180, description: "India's iconic instant noodles. Quick, tasty, and loved by all ages.", image: "https://picsum.photos/seed/maggi-noodles/400/400", stock: 75, category: "Snacks" },
  { name: "Haldiram's Khatta Meetha (400g)", price: 110, description: "Tangy-sweet mixed namkeen with peanuts, sev, and spices.", image: "https://picsum.photos/seed/khatta-meetha/400/400", stock: 55, category: "Snacks" },
  { name: "Kurkure Masala Munch (90g)", price: 30, description: "Crunchy corn puffs with a bold masala punch. Irresistibly spicy.", image: "https://picsum.photos/seed/kurkure/400/400", stock: 100, category: "Snacks" },
  { name: "Oreo Original Cookies (300g)", price: 85, description: "Classic chocolate sandwich cookies with cream filling. Dunk or lick!", image: "https://picsum.photos/seed/oreo-cookies/400/400", stock: 65, category: "Snacks" },
  { name: "Sunfeast Dark Fantasy Choco Fills (300g)", price: 95, description: "Luxury biscuits with a rich chocolate filling. An indulgent snack.", image: "https://picsum.photos/seed/dark-fantasy/400/400", stock: 50, category: "Snacks" },
  { name: "Balaji Wafers (150g)", price: 30, description: "Thin, crispy wafers with a tangy masala flavour. Gujarati favourite.", image: "https://picsum.photos/seed/balaji-wafers/400/400", stock: 90, category: "Snacks" },
  { name: "Act II Microwave Popcorn - Butter (75g)", price: 55, description: "Ready-to-cook microwave popcorn with real butter flavour.", image: "https://picsum.photos/seed/act2-popcorn/400/400", stock: 55, category: "Snacks" },

  // ─── SPICES ───────────────────────────────────────────────────────────────
  { name: "MDH Garam Masala (100g)", price: 95, description: "Authentic blend of aromatic spices for rich, flavourful Indian cooking.", image: "https://picsum.photos/seed/garam-masala/400/400", stock: 55, category: "Spices" },
  { name: "Everest Chilli Powder (100g)", price: 55, description: "Vibrant red chilli powder with the right heat. A kitchen staple.", image: "https://picsum.photos/seed/chilli-powder/400/400", stock: 70, category: "Spices" },
  { name: "MDH Chole Masala (100g)", price: 70, description: "Special spice blend for perfectly flavoured chole and chana.", image: "https://picsum.photos/seed/chole-masala/400/400", stock: 60, category: "Spices" },
  { name: "Everest Turmeric Powder (100g)", price: 45, description: "Pure, bright turmeric powder for colour, flavour, and health.", image: "https://picsum.photos/seed/turmeric-powder/400/400", stock: 80, category: "Spices" },
  { name: "Tata Sampann Coriander Powder (100g)", price: 40, description: "Freshly ground coriander with rich aroma for curries and gravies.", image: "https://picsum.photos/seed/coriander-powder/400/400", stock: 75, category: "Spices" },
  { name: "Catch Cumin Seeds (100g)", price: 48, description: "Aromatic whole cumin seeds for tempering dals and rice.", image: "https://picsum.photos/seed/cumin-seeds/400/400", stock: 65, category: "Spices" },
  { name: "Everest Kitchen King Masala (100g)", price: 85, description: "All-purpose masala for vegetables, paneer, and meat curries.", image: "https://picsum.photos/seed/kitchen-king/400/400", stock: 55, category: "Spices" },
  { name: "MDH Biryani Masala (50g)", price: 60, description: "Fragrant whole spice blend crafted specifically for biryani.", image: "https://picsum.photos/seed/biryani-masala/400/400", stock: 50, category: "Spices" },
  { name: "Tata Salt (1kg)", price: 22, description: "Iodised vacuum-evaporated salt. India's most trusted salt brand.", image: "https://picsum.photos/seed/tata-salt/400/400", stock: 120, category: "Spices" },
  { name: "Catch Black Pepper Powder (50g)", price: 80, description: "Freshly ground black pepper with robust flavour and sharp aroma.", image: "https://picsum.photos/seed/black-pepper/400/400", stock: 60, category: "Spices" },

  // ─── HOUSEHOLD ────────────────────────────────────────────────────────────
  { name: "Surf Excel Easy Wash (1kg)", price: 200, description: "Dissolves easily in water, removes tough stains with less effort.", image: "https://picsum.photos/seed/surf-excel/400/400", stock: 40, category: "Household" },
  { name: "Ariel Matic Front Load Detergent (2kg)", price: 480, description: "Superior clean for front load washing machines. Removes 30 types of stains.", image: "https://picsum.photos/seed/ariel-matic/400/400", stock: 30, category: "Household" },
  { name: "Vim Dishwash Bar (300g)", price: 38, description: "Lemon-powered dishwash bar that cuts grease and leaves dishes sparkling.", image: "https://picsum.photos/seed/vim-dishwash/400/400", stock: 80, category: "Household" },
  { name: "Colin Glass Cleaner (500ml)", price: 145, description: "Streak-free glass cleaner for windows, mirrors, and screens.", image: "https://picsum.photos/seed/colin-cleaner/400/400", stock: 35, category: "Household" },
  { name: "Harpic Toilet Cleaner (750ml)", price: 130, description: "100% limescale removal with powerful disinfectant action.", image: "https://picsum.photos/seed/harpic/400/400", stock: 45, category: "Household" },
  { name: "Domex Floor Cleaner (1L)", price: 160, description: "Kills 99.9% germs on floors and surfaces. Pine fresh fragrance.", image: "https://picsum.photos/seed/domex-floor/400/400", stock: 40, category: "Household" },
  { name: "Good Knight Fast Card (10 cards)", price: 65, description: "Fast-acting mosquito repellent cards for 45 nights of protection.", image: "https://picsum.photos/seed/good-knight/400/400", stock: 55, category: "Household" },
  { name: "Hit Cockroach Killer Spray (425ml)", price: 250, description: "Powerful spray that kills cockroaches and their eggs on contact.", image: "https://picsum.photos/seed/hit-spray/400/400", stock: 30, category: "Household" },
  { name: "Scotch-Brite Kitchen Scrub Pad (3 pack)", price: 80, description: "Heavy-duty scrubbing pads for tough grease and baked-on food.", image: "https://picsum.photos/seed/scotchbrite/400/400", stock: 60, category: "Household" },
  { name: "Godrej Jumbo Garbage Bags (30 bags)", price: 95, description: "Large 90cm x 75cm garbage bags with tie handles. Leak-proof.", image: "https://picsum.photos/seed/garbage-bags/400/400", stock: 50, category: "Household" },

  // ─── PERSONAL CARE ────────────────────────────────────────────────────────
  { name: "Dove Moisturising Body Wash (500ml)", price: 295, description: "Nourishing body wash with ¼ moisturising cream. Leaves skin soft.", image: "https://picsum.photos/seed/dove-bodywash/400/400", stock: 35, category: "Personal Care" },
  { name: "Colgate MaxFresh Toothpaste (150g)", price: 85, description: "Cooling crystals for intense fresh breath and strong enamel.", image: "https://picsum.photos/seed/colgate-maxfresh/400/400", stock: 70, category: "Personal Care" },
  { name: "Pantene Silky Smooth Shampoo (340ml)", price: 330, description: "Pro-Vitamin formula for silky, frizz-free hair from root to tip.", image: "https://picsum.photos/seed/pantene-shampoo/400/400", stock: 30, category: "Personal Care" },
  { name: "Lux Soft Touch Beauty Soap (125g x 4)", price: 120, description: "Creamy bathing soap with French rose extract. Pamper your skin.", image: "https://picsum.photos/seed/lux-soap/400/400", stock: 55, category: "Personal Care" },
  { name: "Dettol Original Antiseptic Soap (75g x 3)", price: 110, description: "Clinically tested germ protection with fresh pine fragrance.", image: "https://picsum.photos/seed/dettol-soap/400/400", stock: 65, category: "Personal Care" },
  { name: "Nivea Soft Moisturising Cream (200ml)", price: 240, description: "Lightweight moisturiser with jojoba oil and vitamin E for everyday use.", image: "https://picsum.photos/seed/nivea-cream/400/400", stock: 40, category: "Personal Care" },
  { name: "Gillette Mach3 Razor with 2 Blades", price: 285, description: "3-blade razor system for a precise, comfortable shave every time.", image: "https://picsum.photos/seed/gillette-mach3/400/400", stock: 35, category: "Personal Care" },
  { name: "Whisper Ultra Clean Sanitary Pads (15 pads)", price: 110, description: "Keeps you dry and comfortable with soft cover and superior absorption.", image: "https://picsum.photos/seed/whisper-pads/400/400", stock: 50, category: "Personal Care" },
  { name: "Vaseline Intensive Care Lotion (200ml)", price: 195, description: "Deep moisture lotion with micro-droplets of Vaseline. 24-hr healing.", image: "https://picsum.photos/seed/vaseline-lotion/400/400", stock: 45, category: "Personal Care" },
  { name: "Head & Shoulders Anti-Dandruff Shampoo (340ml)", price: 350, description: "Clinically proven formula that removes 100% of visible dandruff flakes.", image: "https://picsum.photos/seed/head-shoulders/400/400", stock: 30, category: "Personal Care" },

  // ─── CONDIMENTS ───────────────────────────────────────────────────────────
  { name: "Kissan Mixed Fruit Jam (500g)", price: 155, description: "Sweet and fruity jam made with real fruit. Perfect for toast and parathas.", image: "https://picsum.photos/seed/kissan-jam/400/400", stock: 45, category: "Condiments" },
  { name: "Maggi Hot & Sweet Tomato Chilli Sauce (1kg)", price: 220, description: "Tangy tomato and chilli sauce for dipping, marinades, and cooking.", image: "https://picsum.photos/seed/maggi-sauce/400/400", stock: 50, category: "Condiments" },
  { name: "Heinz Tomato Ketchup (950g)", price: 285, description: "Classic tomato ketchup made with sun-ripened tomatoes. No artificial colours.", image: "https://picsum.photos/seed/heinz-ketchup/400/400", stock: 40, category: "Condiments" },
  { name: "Priya Mango Pickle (300g)", price: 95, description: "Spicy, tangy raw mango pickle in sesame oil. Authentic Andhra recipe.", image: "https://picsum.photos/seed/mango-pickle/400/400", stock: 55, category: "Condiments" },
  { name: "Dabur Honey (500g)", price: 235, description: "100% pure natural honey, no added sugar or preservatives.", image: "https://picsum.photos/seed/dabur-honey/400/400", stock: 35, category: "Condiments" },
  { name: "Dr Oetker FunFoods Eggless Mayonnaise (250g)", price: 115, description: "Creamy eggless mayo for sandwiches, wraps, and dips.", image: "https://picsum.photos/seed/eggless-mayo/400/400", stock: 40, category: "Condiments" },
  { name: "Mother's Recipe Sambar Powder (100g)", price: 65, description: "Authentic South Indian sambar masala blend with tamarind and lentils.", image: "https://picsum.photos/seed/sambar-powder/400/400", stock: 50, category: "Condiments" },
  { name: "Tops Peri-Peri Sauce (250ml)", price: 130, description: "Fiery African-style peri-peri sauce for wings, wraps, and grills.", image: "https://picsum.photos/seed/peri-peri-sauce/400/400", stock: 30, category: "Condiments" },

  // ─── FROZEN & READY-TO-EAT ────────────────────────────────────────────────
  { name: "McCain Smiles (420g)", price: 175, description: "Fun-shaped potato smiles, crispy outside and fluffy inside. Kids love them!", image: "https://picsum.photos/seed/mccain-smiles/400/400", stock: 40, category: "Frozen" },
  { name: "ITC Master Chef Veg Momos (400g)", price: 220, description: "Steamed dumplings with a spiced vegetable filling. Quick and delicious.", image: "https://picsum.photos/seed/veg-momos/400/400", stock: 35, category: "Frozen" },
  { name: "Vadilal Mango Ice Cream (750ml)", price: 165, description: "Rich and creamy Alphonso mango ice cream. A classic Indian indulgence.", image: "https://picsum.photos/seed/mango-icecream/400/400", stock: 30, category: "Frozen" },
  { name: "Gits Instant Idli Mix (500g)", price: 90, description: "Just add water for fluffy, authentic South Indian idlis in minutes.", image: "https://picsum.photos/seed/idli-mix/400/400", stock: 45, category: "Frozen" },
  { name: "Gits Instant Gulab Jamun Mix (500g)", price: 120, description: "Ready-made mix for soft, syrupy gulab jamuns in 20 minutes.", image: "https://picsum.photos/seed/gulab-jamun-mix/400/400", stock: 40, category: "Frozen" },

  // ─── BABY CARE ────────────────────────────────────────────────────────────
  { name: "Pampers New Born Diapers (22 count)", price: 350, description: "Ultra-soft diapers with up to 12-hour leakage protection for newborns.", image: "https://picsum.photos/seed/pampers-newborn/400/400", stock: 30, category: "Baby Care" },
  { name: "Johnsons Baby Powder (200g)", price: 135, description: "Clinically proven gentle baby powder. Keeps baby fresh and rash-free.", image: "https://picsum.photos/seed/johnsons-powder/400/400", stock: 45, category: "Baby Care" },
  { name: "Johnsons Baby Shampoo (200ml)", price: 175, description: "Tear-free, gentle shampoo that won't irritate baby's eyes.", image: "https://picsum.photos/seed/johnsons-shampoo/400/400", stock: 40, category: "Baby Care" },
  { name: "Nestle Cerelac Rice (400g)", price: 280, description: "Iron-fortified infant cereal with natural vitamins. For 6 months+.", image: "https://picsum.photos/seed/cerelac-rice/400/400", stock: 25, category: "Baby Care" },
  { name: "Himalaya Baby Lotion (200ml)", price: 145, description: "Gentle moisturising lotion with almond oil and country mallow for baby skin.", image: "https://picsum.photos/seed/himalaya-baby/400/400", stock: 35, category: "Baby Care" },

  // ─── HEALTH & WELLNESS ────────────────────────────────────────────────────
  { name: "Dabur Chyawanprash (500g)", price: 285, description: "Ayurvedic immunity booster with 40+ herbs including Amla and Ashwagandha.", image: "https://picsum.photos/seed/chyawanprash/400/400", stock: 30, category: "Health" },
  { name: "Revital H (30 capsules)", price: 330, description: "Complete multivitamin with ginseng for energy and vitality.", image: "https://picsum.photos/seed/revital-h/400/400", stock: 25, category: "Health" },
  { name: "Himalaya Liv.52 DS (60 tablets)", price: 270, description: "Ayurvedic liver health supplement. Helps in detoxification.", image: "https://picsum.photos/seed/liv52/400/400", stock: 20, category: "Health" },
  { name: "Dettol Hand Sanitiser (500ml)", price: 195, description: "Kills 99.9% of germs without water. Moisturising formula with aloe vera.", image: "https://picsum.photos/seed/dettol-sanitiser/400/400", stock: 50, category: "Health" },
  { name: "Savlon Antiseptic Liquid (500ml)", price: 220, description: "Multi-purpose antiseptic for wounds, bathing, and surface disinfection.", image: "https://picsum.photos/seed/savlon/400/400", stock: 35, category: "Health" },

  // ─── SUGAR & SWEETENERS ───────────────────────────────────────────────────
  { name: "Uttam Sugar (1kg)", price: 50, description: "Fine granulated white sugar. A pantry essential for cooking and baking.", image: "https://picsum.photos/seed/white-sugar/400/400", stock: 100, category: "Sugar" },
  { name: "Organic India Tulsi Stevia (25 sachets)", price: 150, description: "Zero-calorie natural sweetener from stevia leaves. Diabetic friendly.", image: "https://picsum.photos/seed/stevia/400/400", stock: 40, category: "Sugar" },
  { name: "Patanjali Mishri (500g)", price: 55, description: "Pure rock sugar crystals for prasad, chai, and traditional recipes.", image: "https://picsum.photos/seed/mishri/400/400", stock: 60, category: "Sugar" },

  // ─── STATIONERY ───────────────────────────────────────────────────────────
  { name: "Apsara Pencils HB (10 pack)", price: 40, description: "Smooth writing HB pencils with strong break-resistant lead.", image: "https://picsum.photos/seed/apsara-pencils/400/400", stock: 80, category: "Stationery" },
  { name: "Reynolds 045 Fine Carbure Pens (5 pack)", price: 55, description: "Smooth ball-point pens. India's classic everyday writing instrument.", image: "https://picsum.photos/seed/reynolds-pens/400/400", stock: 70, category: "Stationery" },
  { name: "Fevi Quick Adhesive (20g)", price: 35, description: "Instant super glue for ceramics, metal, plastic, and wood.", image: "https://picsum.photos/seed/feviquick/400/400", stock: 65, category: "Stationery" },
  { name: "Scotch Magic Tape (19mm x 33m)", price: 65, description: "Invisible tape that writes on and disappears under copier. Office essential.", image: "https://picsum.photos/seed/scotch-tape/400/400", stock: 55, category: "Stationery" },

  // ─── PACKAGED FOODS ───────────────────────────────────────────────────────
  { name: "MTR Poha (500g)", price: 55, description: "Flattened rice flakes for quick and easy breakfast poha.", image: "https://picsum.photos/seed/mtr-poha/400/400", stock: 60, category: "Packaged Foods" },
  { name: "MTR Ready-to-Eat Palak Paneer (300g)", price: 115, description: "Restaurant-quality palak paneer in a ready-to-heat pack.", image: "https://picsum.photos/seed/palak-paneer/400/400", stock: 40, category: "Packaged Foods" },
  { name: "Haldiram's Ready Meal Dal Makhani (300g)", price: 120, description: "Slow-cooked creamy dal makhani. Heat and eat in 5 minutes.", image: "https://picsum.photos/seed/dal-makhani/400/400", stock: 35, category: "Packaged Foods" },
  { name: "Aashirvaad Vermicelli (500g)", price: 45, description: "Thin whole wheat vermicelli for upma, kheer, and sweet seviyan.", image: "https://picsum.photos/seed/vermicelli/400/400", stock: 55, category: "Packaged Foods" },
  { name: "Lijjat Papad (200g)", price: 70, description: "Crispy urad dal papad with a hint of pepper. Roast or fry to perfection.", image: "https://picsum.photos/seed/lijjat-papad/400/400", stock: 65, category: "Packaged Foods" },
  { name: "Ching's Secret Schezwan Noodles (240g)", price: 80, description: "Fiery schezwan flavoured noodles for an Indo-Chinese meal at home.", image: "https://picsum.photos/seed/schezwan-noodles/400/400", stock: 50, category: "Packaged Foods" },
  { name: "Britannia Cheese Slices (200g)", price: 145, description: "10 processed cheese slices, perfect for sandwiches and burgers.", image: "https://picsum.photos/seed/cheese-slices/400/400", stock: 40, category: "Packaged Foods" },
  { name: "Dr Oetker Chocolate Cake Mix (300g)", price: 175, description: "Easy bake cake mix. Just add butter, egg, and milk for a rich chocolate cake.", image: "https://picsum.photos/seed/choco-cake-mix/400/400", stock: 30, category: "Packaged Foods" },
];

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} KiranaKart products successfully!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
