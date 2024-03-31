const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes, ExclusionConstraintError } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());



// Database connection
const sequelize = new Sequelize('postgres://postgres:Achiket123@localhost:5432/');

// Define User model
const User = sequelize.define('User', {
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: DataTypes.STRING,
  phoneNumber: DataTypes.STRING,
  photoUrl: DataTypes.STRING,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  location: DataTypes.STRING
});

const City = sequelize.define('City', {
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

})



// Routes
app.post('/signup', async (req, res) => {
  try {
    console.log('executed');
    const { name, email, password, gender, phoneNumber, photoUrl, location } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(404).send('email already exist');
    }

    val = await User.create({
      name,
      email,
      password: hashedPassword,
      gender,
      phoneNumber,
      photoUrl,
      location
    });


    const token = jwt.sign(val.toJSON(), 'secret_key', { expiresIn: '4h' });
    res.status(200).send(token);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('executed');
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).send('User not found');
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).send('Invalid password');
  }
  const token = jwt.sign(user.toJSON(), 'secret_key', { expiresIn: '4h' });
  console.log(token);
  res.status(200).send(token);
});

// Sync models with database and start the server
(async () => {
  try {
    await sequelize.sync();
    console.log('Database synced');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
})();


app.get('/city', async (req, res) => {
  const data = await City.findAll()

  console.log('executed', '/city')
  const mappedData = data.map(city => ({
    uid: city.uuid,
    name: city.name
  }));
  const jsonData = JSON.stringify(mappedData);

  res.status(200).send(jsonData)

})

app.get('/homeview', async (req, res) => {
  try {
    const { location, uuid } = req.query;

    const recommendedStudios = await getRecommendedStudios(location);

    const nearbyStudios = await getNearbyStudios(location);

    const categories = await getCategories();

    const favourites = await getUserFavourites(uuid);

    const chatDetails = await getchatData(uuid);

    const rescentSearch = await getRecentSearch(uuid);
    console.log(location, uuid)

    res.status(200).send(JSON.stringify({ 'recent_search': rescentSearch, 'recommended': recommendedStudios, 'nearby': nearbyStudios, 'categories': categories, 'favourites': favourites, 'chatDetails': chatDetails }))
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching home view data');
  }
});


app.get('/description', async (req, res) => {
  try {

    const { uid } = req.query;
    console.log('/description')
    const studio_details = await getStudioAllDetails(uid);
    const agent_details = await getAgentDetails(uid);
    const review_details = await getReviewData(uid);
    res.status(200).send((JSON.stringify({ agent_details: agent_details, studio_details: studio_details, review_details: review_details })))
  } catch (error) {
    res.status(500).send('unable to fetch data');
  }
})

app.post('/review', async (req, res) => {
  try {

    const body = req.body;
    const uuid = body['uuid']
    console.log(body, uuid);
    const user = await User.findOne({ where: { uuid } })
    const review_details = await getReviewData(uuid);
    const review_data = {
      'name': user.name,
      'reviewId': '12wsvq',
      'photoUrl':
        user.photoUrl,
      'review': body['review'],
      'rating': body['rating'],
      'time': body['createdAt'],
    }
    console.log(review_data);
    res.status(200).send(JSON.stringify(review_data))
  } catch (error) {
    console.log(error);
    res.status(500);
  }
})

app.get('/search', async (req, res) => {
  try {
    const { search } = req.query;
    console.log(search)
    const getUserFavourite = await getUserFavourites(search)

    res.status(200).send(JSON.stringify(getUserFavourite))

  } catch (e) {
    console.log(e);
    res.status(500);
  }

})

app.post('/chat', async (req, res) => {
  // Simulate sending a message to all connected clients
  try {
    const message = req.body;
    res.status(200);
    await putMeassageInDb(message);
  } catch (e) {
    res.status(500)
  }
});

app.get('/chat', async (req, res) => {
  try {
    const { uuid, agentId } = req.query;
    const messages = await getAllMessages(uuid, agentId)

    res.status(200).send(JSON.stringify(messages));
  } catch (error) {
    res.status(500)

  }
})



// Data Part

async function putMeassageInDb(message) { }

async function getAgentDetails(agentID) {
  const agent_details = {

  }
}

async function getAllMessages(uuid, agentId) {
  const meessagePage =
    [
      {
        'isMe': true,
        'agentID': 'agentID',
        'userID': 'userID',
        'message': 'message',
        'timestamp': '22-03-2024T13:12:32',
      }, {
        'isMe': false,
        'agentID': 'agentID',
        'userID': 'userID',
        'message': 'message',
        'timestamp': '22-03-2024T13:12:32',
      }, {
        'isMe': true,
        'agentID': 'agentID',
        'userID': 'userID',
        'message': 'message',
        'timestamp': '22-03-2024T13:12:32',
      }, {
        'isMe': false,
        'agentID': 'agentID',
        'userID': 'userID',
        'message': 'message',
        'timestamp': '22-03-2024T13:12:32',
      },
    ]
  return meessagePage;
}

async function getUserFavourites(uuid) {
  const favourites = [{
    id: '1',
    image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
    title: 'Studio 1',
    tag: "Art",
    rating: '4.5',
    location: 'Location 1',
    address: 'Address 1',
    rent: 100,
    latitude: 24.685263024458504, longitude: 83.07017245514888
  }, {
    id: '3',
    image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
    title: 'Studio 3',
    tag: "Dance",
    rating: '4.0',
    location: 'Location 3',
    address: 'Address 3',
    rent: 90,
    latitude: 24.684180948704178, longitude: 83.0687321088662
  },
  {
    id: '4',
    image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
    title: 'Studio 4',
    tag: "Music",
    rating: '3.8',
    location: 'Location 4',
    address: 'Address 4',
    rent: 110,
    latitude: 24.6853946276258, longitude: 83.06685456250142
  },]
  return favourites;
}


async function getRecommendedStudios(location) {
  // Example implementation - fetch recommended studios based on the location
  // You would replace this with your actual data fetching logic (e.g., querying a database)
  const recommendedStudios = [
    {
      id: '1',
      image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
      title: 'Studio 1',
      tag: "Art",
      rating: '4.5',
      location: 'Location 1',
      address: 'Address 1',
      rent: 100,
      latitude: 24.685263024458504, longitude: 83.07017245514888
    },
    {
      id: '2',
      image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
      title: 'Studio 2',
      tag: "Music",
      rating: '4.2',
      location: 'Location 2',
      address: 'Address 2',
      rent: 120,
      latitude: 24.68579918464043, longitude: 83.0697620771577
    }
    // Add more recommended studios as needed
  ];
  console.log(recommendedStudios);
  return recommendedStudios;
}

async function getNearbyStudios(location) {
  // Example implementation - fetch nearby studios based on the location
  // You would replace this with your actual data fetching logic (e.g., querying a database)
  const nearbyStudios = [
    {
      id: '3',
      image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
      title: 'Studio 3',
      tag: "Dance",
      rating: '4.0',
      location: 'Location 3',
      address: 'Address 3',
      rent: 90,
      latitude: 24.684180948704178, longitude: 83.0687321088662
    },
    {
      id: '4',
      image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
      title: 'Studio 4',
      tag: "Music",
      rating: '3.8',
      location: 'Location 4',
      address: 'Address 4',
      rent: 110,
      latitude: 24.6853946276258, longitude: 83.06685456250142
    }
    // Add more nearby studios as needed
  ];
  console.log(nearbyStudios);
  return nearbyStudios;
}

async function getCategories() {
  // Example implementation - fetch nearby studios based on the location
  // You would replace this with your actual data fetching logic (e.g., querying a database)
  const categories = [
    {
      id: '3',
      image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
      title: 'Music',

    },
    {
      id: '4',
      image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
      title: 'Art',

    },
    {
      id: '5',
      image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
      title: 'Dance',

    },
    {
      id: '6',
      image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/KZ/ZY/CO/49655305/green-road-studio-spaces-005-1-.jpg',
      title: 'Photography',

    },
    // Add more nearby studios as needed
  ];
  return categories;
}


async function getchatData(uuid) {

  chatDetails = [

    {
      'id': '12',
      'name': 'Other Person',
      'image':
        'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'time': '09:34 PM',
      'message': 'Not much, just working on some projects. How about you?',
      'unread': 0,
    },
    {
      'id': '12',
      'name': 'You',
      'image':
        'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'time': '09:34 PM',
      'message':
        'Same here, just trying to stay productive. Have a good day!',
      'unread': 0,
    },
    {
      'id': '12',
      'name': 'You',
      'image':
        'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'time': '09:34 PM',
      'message': 'Hey, how are you doing?',
      'unread': 2,
    },
    {
      'id': '12',
      'name': 'Other Person',
      'image':
        'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'time': '09:34 PM',
      'message': 'I am doing great, thanks for asking. How about you?',
      'unread': 0,
    },
    {
      'id': '12',
      'name': 'You',
      'image':
        'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'time': '09:34 PM',
      'message':
        'I am doing well too, thanks. What have you been up to lately?',
      'unread': 1,
    },
    {
      'id': '12',
      'name': 'Other Person',
      'image':
        'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'time': '09:34 PM',
      'message': 'Not much, just working on some projects. How about you?',
      'unread': 0,
    },
    {
      'id': '12',
      'name': 'You',
      'image':
        'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'time': '09:34 PM',
      'message':
        'Same here, just trying to stay productive. Have a good day!',
      'unread': 0,
    },
  ];

  return chatDetails
}


async function getStudioAllDetails(uid) {
  const studio_details = {
    'category': 'PhotoGraphy'
    , 'rating': 4.8,
    'numberOfReviews': 300,
    'name': 'Capture Vision Studds',
    'location': 'Bihar k Lala',
    'address': 'Bihar me kahi to hoga hi kya pta',
    'tags': ['backDrops', 'LightingEquipment', 'Props'],
    'description': 'Consectetur do ipsum anim anim ut sit pariatur est laborum ipsum voluptate tempor adipisicing. Et in Lorem ipsum ut pariatur eiusmod. Fugiat est officia qui eiusmod nostrud tempor deserunt ad eu esse tempor. Irure cillum nisi do magna incididunt dolor consectetur. Laborum irure et commodo duis proident eiusmod ipsum minim incididunt. Laborum excepteur deserunt deserunt aute officia nostrud ullamco excepteur eu laboris in consectetur laboris. Enim enim exercitation amet proident nulla aliqua.',
    'frontImage': ['https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
    'gallery': ['https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
  }
  return studio_details
}


async function getAgentDetails(uid) {
  console.log(uid);
  const agent_details = [{
    id: '1', number: '1235464563', name: 'Bihari Babu', profile: 'owner'
  }, {
    id: '2', number: '1234567890', name: 'Bengali Babu', profile: 'thekedar'

  }, {
    id: '3', number: '1234567890', name: 'Najayz Babu', profile: 'dalal'

  }]
  return agent_details;
}

async function getReviewData(uid) {
  console.log(uid);
  const review_details = [
    {
      'name': 'Paul Yadav',
      'reviewId': '12wvq',
      'photoUrl': 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'review': 'Velit amet enim mollit irure quis exercitation dolor culpa ad ipsum reprehenderit exercitation pariatur.',
      'rating': 3.5,
      'time': '12-01-2021',
    }, {
      'name': 'Paul Yadav',
      'reviewId': '12wvq',
      'photoUrl': 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'review': 'Velit amet enim mollit irure quis exercitation dolor culpa ad ipsum reprehenderit exercitation pariatur.',
      'rating': 3.5,
      'time': '12-01-2021',
    }, {
      'name': 'Paul Yadav',
      'reviewId': '12wvq',
      'photoUrl': 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'review': 'Velit amet enim mollit irure quis exercitation dolor culpa ad ipsum reprehenderit exercitation pariatur.',
      'rating': 3.5,
      'time': '12-01-2021',
    },
  ]
  return review_details;
}

async function getRecentSearch(uuid) {
  const recent_search = [];
  return recent_search;
}