const BigBiteData = [
  // --- PIZZAS ---
  {
    id: 1,
    category: "Pizza",
    title: "Chicken Tikka Pizza",
    description: "Cheese, sauce, chicken, onion.",
    image: "https://via.placeholder.com/300x200?text=Chicken+Tikka", // Yahan apni image lagayen
    basePrice: 590,
    options: [
      { label: "Small", price: 590 },
      { label: "Medium", price: 1150 },
      { label: "Large", price: 1590 },
    ],
  },
  {
    id: 2,
    category: "Pizza",
    title: "Mughlai Maza",
    description: "Special sauce on top, Mughlai chicken, capsicum, onion.",
    image: "https://via.placeholder.com/300x200?text=Mughlai+Pizza",
    basePrice: 1290,
    options: [
      { label: "Small", price: 1290 },
      { label: "Medium", price: 1690 }, // Large ka rate clear nahi tha, assumption
      { label: "Large", price: 1990 },
    ],
  },

  // --- BURGERS ---
  {
    id: 10,
    category: "Burger",
    title: "Zinger Burger",
    description: "Crunchy chicken fillet with signature sauce.",
    image: "https://via.placeholder.com/300x200?text=Zinger+Burger",
    basePrice: 330,
    options: [
      { label: "Regular", price: 330 },
      { label: "Combo", price: 530 }, // Fries + Drink included
    ],
  },
  {
    id: 11,
    category: "Burger",
    title: "Thunder Fillet",
    description: "Extra spicy fillet burger.",
    image: "https://via.placeholder.com/300x200?text=Thunder+Fillet",
    basePrice: 350,
    options: [
      { label: "Regular", price: 350 },
      { label: "Combo", price: 550 },
    ],
  },

  // --- BROAST ---
  {
    id: 20,
    category: "Broast",
    title: "Arabic Spicy Broast",
    description: "Injected spicy broast with garlic dip & fries.",
    image: "https://via.placeholder.com/300x200?text=Broast",
    basePrice: 650,
    options: [
      { label: "Quarter", price: 650 },
      { label: "Half", price: 1200 },
      { label: "Full", price: 2200 },
    ],
  },

  // --- SHAWARMA ---
  {
    id: 30,
    category: "Wraps",
    title: "Zinger Shawarma",
    description: "Crispy chicken chunks in pita bread.",
    image: "https://via.placeholder.com/300x200?text=Shawarma",
    basePrice: 330,
    options: [
      { label: "Regular", price: 330 },
      { label: "Combo", price: 530 },
    ],
  },
];

export default BigBiteData;