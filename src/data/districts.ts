export type FoodItem = {
  id: string;
  name: string;
  description: string;
};

export type District = {
  id: string;
  name: string;
  banglaName: string;
  division: string;
  intro: string;
  lat: number;
  lng: number;
  foods: FoodItem[];
};

const catalog = [
  { id: "dhaka", name: "Dhaka", banglaName: "????", division: "Dhaka", lat: 23.8103, lng: 90.4125, intro: "The capital city brings together flavours from every corner of Bangladesh, from aromatic rice dishes to vibrant street snacks.", foods: ["Kachchi Biryani", "Chotpoti", "Fuchka"] },
  { id: "faridpur", name: "Faridpur", banglaName: "???????", division: "Dhaka", lat: 23.6062, lng: 89.8331, intro: "Known for its river-side culture and comforting rice-based meals from the heart of central Bangladesh.", foods: ["Khatta Rice", "Bamboo Fish", "Misti Doi"] },
  { id: "gazipur", name: "Gazipur", banglaName: "???????", division: "Dhaka", lat: 24.0958, lng: 90.4125, intro: "A busy urban district where everyday favourites and restaurant classics are transformed with local flair.", foods: ["Traditional Sweets", "Grilled Kebab", "Pitha"] },
  { id: "gopalganj", name: "Gopalganj", banglaName: "?????????", division: "Dhaka", lat: 23.0059, lng: 89.8262, intro: "A southern gateway district known for comforting village dishes and generous use of seasonal produce.", foods: ["Ilish Paturi", "Shutki Bhuna", "Rice and Vegetable Curries"] },
  { id: "jamalpur", name: "Jamalpur", banglaName: "????????", division: "Mymensingh", lat: 24.9167, lng: 89.9333, intro: "A northern district where river produce, fresh greens and rice-centered meals anchor daily eating.", foods: ["Bhat Khichuri", "Mughlai Begun", "Lassi"] },
  { id: "kishoreganj", name: "Kishoreganj", banglaName: "?????????", division: "Dhaka", lat: 24.426, lng: 90.782, intro: "With its river channels and floodplains, this district celebrates fish-forward cooking and homestyle rice meals.", foods: ["Katla Bhuna", "Bhuna Rice", "Pitha Bhaja"] },
  { id: "madaripur", name: "Madaripur", banglaName: "?????????", division: "Dhaka", lat: 23.172, lng: 90.189, intro: "A southern district where simple ingredients are elevated into deeply comforting, homestyle meals.", foods: ["Sun-dried Fish Curry", "Aloo Chatpata", "Paan"] },
  { id: "manikganj", name: "Manikganj", banglaName: "?????????", division: "Dhaka", lat: 23.8617, lng: 90.0, intro: "The rivers and agricultural belts shape a straightforward but deeply satisfying cuisine.", foods: ["Roshmalai", "Hilsa Curry", "Sweet Rice"] },
  { id: "munshiganj", name: "Munshiganj", banglaName: "??????????", division: "Dhaka", lat: 23.55, lng: 90.53, intro: "Famed for river fish, seasonal produce and the refined yet rustic flavours of daily Bangla meals.", foods: ["Golda Chingri", "Fish Curry", "Mango Pickle"] },
  { id: "mymensingh", name: "Mymensingh", banglaName: "????????", division: "Mymensingh", lat: 24.7471, lng: 90.4203, intro: "An agricultural heartland where refined rice dishes and sweet treats hold pride of place.", foods: ["Mughlai Dishes", "Rice Sweets", "Seasonal Rice Dishes"] },
  { id: "narayanganj", name: "Narayanganj", banglaName: "??????????", division: "Dhaka", lat: 23.623, lng: 90.5, intro: "A river-port district whose cuisine reflects trade, fish, and the elegance of Bengali hospitality.", foods: ["Mutton Kebab", "Kebabs", "Sweet Rice Desserts"] },
  { id: "narsingdi", name: "Narsingdi", banglaName: "???????", division: "Dhaka", lat: 23.922, lng: 90.717, intro: "The region offers straightforward fish curries, fragrant biryani and tasty snack culture.", foods: ["Biryani", "Fish Tikka", "Samosa"] },
  { id: "netrokona", name: "Netrokona", banglaName: "?????????", division: "Mymensingh", lat: 24.883, lng: 90.733, intro: "Hill-country produce and river foods create a distinctly local eating culture.", foods: ["Seasonal Pitha", "Leaf Curry", "Bamboo Shoot Dish"] },
  { id: "rajbari", name: "Rajbari", banglaName: "????????", division: "Dhaka", lat: 23.757, lng: 89.648, intro: "A riverside district celebrated for gentle rice dishes and beloved sweets.", foods: ["Steamed Rice", "Sour Fish Dish", "Sweet Balls"] },
  { id: "shariatpur", name: "Shariatpur", banglaName: "?????????", division: "Dhaka", lat: 23.219, lng: 90.351, intro: "Riverine food culture here is grounded in fish, rice and pickles passed down through families.", foods: ["Hilsa Soup", "Local Pickles", "Puffed Rice Delights"] },
  { id: "sherpur", name: "Sherpur", banglaName: "??????", division: "Mymensingh", lat: 25.020, lng: 90.015, intro: "The district's cuisine centers on plain rice, lentils and festive sweets from local kitchens.", foods: ["Lentil Dal", "Winter Pitha", "Sweet Milk Desserts"] },
  { id: "tangail", name: "Tangail", banglaName: "????????", division: "Dhaka", lat: 24.251, lng: 89.916, intro: "From market sweets to hearty rice meals, Tangail's cuisine balances richness and comfort.", foods: ["Porabari Chomchom", "Coconut Sweets", "Khichuri"] },
  { id: "bandarban", name: "Bandarban", banglaName: "?????????", division: "Chattogram", lat: 22.1958, lng: 92.2184, intro: "Hill communities bring an aromatic, forest-inspired approach to rice, meat and leafy greens.", foods: ["Hill Chicken Curry", "Bamboo Shoot Curry", "Ginger Pickle"] },
  { id: "brahmanbaria", name: "Brahmanbaria", banglaName: "????????????????", division: "Chattogram", lat: 23.957, lng: 91.111, intro: "This district blends traditional Bengali flavours with a strong influence from market and festival foods.", foods: ["Kebab Platter", "Rice Dishes", "Festival Sweets"] },
  { id: "chandpur", name: "Chandpur", banglaName: "???????", division: "Chattogram", lat: 23.233, lng: 90.7, intro: "A river district where fish is central, and mustard, chili and onions define the flavour profile.", foods: ["Hilsa in Mustard", "Bhuna Fish", "Prawn Paturi"] },
  { id: "chattogram", name: "Chattogram", banglaName: "?????????", division: "Chattogram", lat: 22.3569, lng: 91.7832, intro: "The port city offers the richest coastal flavours, from grilled fish to slow-cooked beef and fine sweets.", foods: ["Mezban Beef", "Bengali Fish Curry", "Chingri Malai Curry"] },
  { id: "cumilla", name: "Cumilla", banglaName: "????????", division: "Chattogram", lat: 23.457, lng: 91.186, intro: "Cumilla's cuisine is famous for milk sweets and festive dishes shared across family tables.", foods: ["Roshmalai", "Meat Curry", "Pitha"] },
  { id: "cox-bazar", name: "Cox's Bazar", banglaName: "?????????", division: "Chattogram", lat: 21.4272, lng: 92.0058, intro: "The coast shapes a seafood-heavy cuisine full of coconut, chili and fresh catches.", foods: ["Grilled Fish", "Prawn Curry", "Coconut Sweet"] },
  { id: "feni", name: "Feni", banglaName: "????", division: "Chattogram", lat: 22.967, lng: 91.316, intro: "This coastal district makes excellent use of fresh seafood and udadhi-style comfort foods.", foods: ["Fried Fish", "Coconut Rice", "Chingri Bhaji"] },
  { id: "khagrachhari", name: "Khagrachhari", banglaName: "????????", division: "Chattogram", lat: 23.119, lng: 91.98, intro: "Forest hills and tribal culinary traditions produce hearty, vibrant dishes with deep local character.", foods: ["Hill Curry", "Smoked Meat", "Leaf-Served Dishes"] },
  { id: "lakshmipur", name: "Lakshmipur", banglaName: "??????????", division: "Chattogram", lat: 22.944, lng: 90.828, intro: "Inland river channels and sea access make this district naturally fish-forward and flavourful.", foods: ["Fish Soup", "Crab Dishes", "Stir-fried Fish"] },
  { id: "noakhali", name: "Noakhali", banglaName: "????????", division: "Chattogram", lat: 22.825, lng: 91.101, intro: "A coastal region rooted in seafood, mustard and the simple pleasures of family-style Bengali rice meals.", foods: ["Seafood Platter", "Mustard Fish", "Vegetable Curry"] },
  { id: "rangamati", name: "Rangamati", banglaName: "??????????", division: "Chattogram", lat: 22.655, lng: 92.179, intro: "Hill districts bring a distinct style of preparation rooted in forest ingredients and community cooking.", foods: ["Bamboo Shoot Dish", "Meat Bhuna", "Local Leaf Dishes"] },
  { id: "sylhet", name: "Sylhet", banglaName: "?????", division: "Sylhet", lat: 24.8949, lng: 91.8687, intro: "Sylhet's cuisine reflects tea gardens, beef dishes and aromatic herbs that make every meal memorable.", foods: ["Shatkora Beef", "Pitha", "Tea Garden Sweets"] },
  { id: "habiganj", name: "Habiganj", banglaName: "???????", division: "Sylhet", lat: 24.374, lng: 91.415, intro: "The district pairs cattle-based dishes with strong tea-house traditions and smoky preparations.", foods: ["Beef Curry", "Tea-time Snacks", "Rice Pitha"] },
  { id: "moulvibazar", name: "Moulvibazar", banglaName: "??????????", division: "Sylhet", lat: 24.482, lng: 91.770, intro: "Tea estates and woodland produce shape a cuisine of gentle aroma, leafy greens and local meats.", foods: ["Tea Leaf Dish", "Beef Dishes", "Tea-time Cakes"] },
  { id: "sunamganj", name: "Sunamganj", banglaName: "?????????", division: "Sylhet", lat: 25.065, lng: 91.395, intro: "A floodplain district where fish, rice and pungent greens define everyday cooking.", foods: ["Freshwater Fish", "Bitter Gourd Curry", "Sweet Pitha"] },
  { id: "bogura", name: "Bogura", banglaName: "?????", division: "Rajshahi", lat: 24.846, lng: 89.37, intro: "The district is famous for dairy traditions and a wide range of sweet and savory classics.", foods: ["Doi", "Paanch", "Rice and Fish"] },
  { id: "chapainawabganj", name: "Chapainawabganj", banglaName: "??????????????", division: "Rajshahi", lat: 24.596, lng: 88.277, intro: "The mango belt brings bright fruit-forward dishes and notable culinary customs to the region.", foods: ["Mango Sweets", "Mango Pickle", "Roasted Fish"] },
  { id: "joypurhat", name: "Joypurhat", banglaName: "????????", division: "Rajshahi", lat: 25.096, lng: 89.041, intro: "Joypurhat offers rice-centered meals and a classic sweet culture connected to family traditions.", foods: ["Milk Sweets", "Date Sweets", "Rice and Curry"] },
  { id: "naogaon", name: "Naogaon", banglaName: "?????", division: "Rajshahi", lat: 24.819, lng: 88.946, intro: "A district of winter pitha, sweets and homely rice dishes rooted in tradition.", foods: ["Winter Pitha", "Milk Sweet", "Lentil Dish"] },
  { id: "natore", name: "Natore", banglaName: "?????", division: "Rajshahi", lat: 24.411, lng: 89.003, intro: "Known for fragrant rice and rich desserts, Natore carries a refined culinary identity.", foods: ["Kataribhog Rice", "Sweet Rice", "Fish Curry"] },
  { id: "pabna", name: "Pabna", banglaName: "?????", division: "Rajshahi", lat: 24.007, lng: 89.236, intro: "The district is deeply tied to rice, pulses and sweets that feel both everyday and celebratory.", foods: ["Rice Sweet", "Dal", "Fish Bhuna"] },
  { id: "rajshahi", name: "Rajshahi", banglaName: "???????", division: "Rajshahi", lat: 24.3745, lng: 88.6042, intro: "This district is synonymous with fragrant rice, mangoes and a strong sweet culture.", foods: ["Mango Varieties", "Kataribhog Rice", "Mishti"] },
  { id: "sirajganj", name: "Sirajganj", banglaName: "?????????", division: "Rajshahi", lat: 24.454, lng: 89.708, intro: "Rice, fish and sweets are deeply woven into daily life along the Jamuna river belt.", foods: ["Rice and Fish Dish", "Misti Doi", "Pickles"] },
  { id: "bagerhat", name: "Bagerhat", banglaName: "????????", division: "Khulna", lat: 22.651, lng: 89.792, intro: "The historical district celebrates coconut, shrimp and richly spiced village dishes.", foods: ["Shrimp Curry", "Prawn Fry", "Coconut Sweets"] },
  { id: "chuadanga", name: "Chuadanga", banglaName: "???????????", division: "Khulna", lat: 23.642, lng: 88.857, intro: "A central-western district where simple curries and rice dishes dominate the menu.", foods: ["Rice and Lentil Curry", "Vegetable Dishes", "Sweet Cakes"] },
  { id: "jashore", name: "Jashore", banglaName: "????", division: "Khulna", lat: 23.166, lng: 89.208, intro: "Known for versatile cuisine, Jashore balances polished food traditions with bustling street snacks.", foods: ["Chui Jhal", "Khichuri", "Fish Fries"] },
  { id: "jhenaidah", name: "Jhenaidah", banglaName: "???????", division: "Khulna", lat: 23.544, lng: 89.152, intro: "The district is rooted in family meals, with rice at the center and spice as a supporting act.", foods: ["Mutton Curry", "Seasonal Vegetables", "Sweet Rice"] },
  { id: "khulna", name: "Khulna", banglaName: "?????", division: "Khulna", lat: 22.8456, lng: 89.5403, intro: "A strong coastal identity gives Khulna dishes built around shrimp, fish and the boldness of river spices.", foods: ["Chui Jhal", "Shrimp Sauce", "Fish in Mustard"] },
  { id: "kushtia", name: "Kushtia", banglaName: "?????????", division: "Khulna", lat: 23.901, lng: 89.122, intro: "The district's food culture revolves around comforting rice dishes and deep village-style flavours.", foods: ["Rice Bhaji", "Lentil Curry", "Sweet Dumplings"] },
  { id: "magura", name: "Magura", banglaName: "??????", division: "Khulna", lat: 23.487, lng: 89.419, intro: "Smaller in scale but rich in flavour, the district thrives on simple, home-style Bengali meals.", foods: ["Rice Bhuna", "Mudhi Curry", "Mango Pickle"] },
  { id: "meherpur", name: "Meherpur", banglaName: "????????", division: "Khulna", lat: 23.762, lng: 88.631, intro: "Daily meals center on seasonal vegetables, lentils and everyday rice dishes full of warmth.", foods: ["Seasonal Curry", "Rice and Dal", "Sweet Balls"] },
  { id: "narail", name: "Narail", banglaName: "??????", division: "Khulna", lat: 23.172, lng: 89.5, intro: "Narail's culinary character is rooted in family-style rice meals and generous, slow-cooked preparations.", foods: ["Rice Curry", "Fish Bhaji", "Dessert Sweet"] },
  { id: "satkhira", name: "Satkhira", banglaName: "?????????", division: "Khulna", lat: 22.708, lng: 89.071, intro: "The southwestern coast brings seafood, mustard and bright spice into a regional cuisine of character.", foods: ["Salted Fish", "Shrimp Curry", "Mustard Greens"] },
  { id: "barishal", name: "Barishal", banglaName: "??????", division: "Barishal", lat: 22.701, lng: 90.353, intro: "The city is famed for fish, rice and a style of cooking that is inherently river-facing and deeply comforting.", foods: ["Hilsa Curry", "Prawn Bhuna", "Mughlai Pulao"] },
  { id: "barguna", name: "Barguna", banglaName: "??????", division: "Barishal", lat: 22.158, lng: 90.124, intro: "A coastal district where fresh fish, simple rice and mustard define the taste of daily meals.", foods: ["Grilled Fish", "Mustard Fish", "Puffed Rice Snack"] },
  { id: "bhola", name: "Bhola", banglaName: "????", division: "Barishal", lat: 22.685, lng: 90.648, intro: "Bhola's food culture is rich in river fish, steamed rice and hearty slow-cooked dishes.", foods: ["River Fish Curry", "Steamed Rice", "Mango Pickle"] },
  { id: "jhalokati", name: "Jhalokati", banglaName: "???????", division: "Barishal", lat: 22.641, lng: 90.200, intro: "This southern district makes the most of fish, greens and a mild, balanced spice profile.", foods: ["Fish in Spice", "Green Vegetable Curry", "Rice Pudding"] },
  { id: "patuakhali", name: "Patuakhali", banglaName: "??????????", division: "Barishal", lat: 22.356, lng: 90.329, intro: "Gold and silver beaches meet a seafood-rich table shaped by local herbs and family traditions.", foods: ["Coastal Fish", "Shrimp Bhaji", "Coconut Rice"] },
  { id: "pirojpur", name: "Pirojpur", banglaName: "????????", division: "Barishal", lat: 22.584, lng: 89.978, intro: "The district's cuisine is gentle yet distinctive, centered on rice, fish and many homestyle side dishes.", foods: ["Fish Curry", "Rice and Dal", "Green Pickle"] },
  { id: "rangpur", name: "Rangpur", banglaName: "?????", division: "Rangpur", lat: 25.743, lng: 89.275, intro: "Rangpur's food culture is rooted in rice, vegetables and warm, everyday comfort foods.", foods: ["Rice and Lentils", "Aloo Vaji", "Sweet Pitha"] },
  { id: "dinajpur", name: "Dinajpur", banglaName: "????????", division: "Rangpur", lat: 25.627, lng: 88.633, intro: "This district is known for fragrant rice, seasonal sweets and a love of balanced, home-style snacks.", foods: ["Kataribhog Rice", "Rice Cakes", "Misti Doi"] },
  { id: "gaibandha", name: "Gaibandha", banglaName: "?????????", division: "Rangpur", lat: 25.328, lng: 89.527, intro: "A northern district where rice and seasonal greens meet bold flavors and river-side traditions.", foods: ["Rice and Greens", "Fish Curry", "Sweet Rice"] },
  { id: "kurigram", name: "Kurigram", banglaName: "??????????", division: "Rangpur", lat: 25.809, lng: 89.670, intro: "Kurigram's food traditions are simple but unforgettable, with strong annual seasonal touches.", foods: ["River Fish", "Shak Bhaji", "Pitha"] },
  { id: "lalmonirhat", name: "Lalmonirhat", banglaName: "??????????", division: "Rangpur", lat: 26.446, lng: 89.453, intro: "The district's culinary rhythm is shaped by rice, greens and comforting home-cooked dishes.", foods: ["Rice with Dal", "Mustard Greens", "Pickle"] },
  { id: "nilphamari", name: "Nilphamari", banglaName: "?????????", division: "Rangpur", lat: 25.931, lng: 88.847, intro: "The cuisine here captures village comfort through humble rice dishes and warm seasonal sides.", foods: ["Rice and Curry", "Seasonal Shak", "Sweet Dumplings"] },
  { id: "panchagarh", name: "Panchagarh", banglaName: "???????", division: "Rangpur", lat: 26.341, lng: 88.563, intro: "This northern district combines orchard produce and rice dishes with distinctly local flavor.", foods: ["Rice and Fish", "Seasonal Fruit Curry", "Pitha"] },
  { id: "thakurgaon", name: "Thakurgaon", banglaName: "?????????", division: "Rangpur", lat: 26.033, lng: 88.466, intro: "The district's food is a blend of simple village meals, rice staples and festive sweets.", foods: ["Rice Dishes", "Seasonal Veg Curry", "Sweet Pitha"] },
];

export const districts: District[] = catalog.map((district) => ({
  ...district,
  foods: district.foods.map((foodName, index) => ({
    id: `${district.id}-${index + 1}`,
    name: foodName,
    description: `${foodName} is a well-loved local favourite in ${district.name}.`,
  })),
}));
