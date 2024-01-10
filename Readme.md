# YouTube Backend

## Overview

Welcome to the YouTube Backend project! This project is a full-featured backend implementation designed to replicate several functionalities of YouTube, along with additional features like tweets and more.

## Features

### User Management

- User registration, login, and logout.
- Reset password functionality.
- Update account details, change avatar, and cover image.
- Get watch history of user 
- Get Channel details 

### Video Management

- Video upload with thumbnail support.
- change publish status
- video update feature to update thumbnail,title and description to celebrate a big milestone achievement
- Video deletion.
  
### Playlist Management
- Create a playlist with appropriate name and description
- Categorize your videos
- Add and remove more and more videos
- Update playlist's title and description
- Delete Playlist


### Likes Model

- Handles like and dislike functionality for everything :
  1. Video
  2. Comment 
  3. And Tweet

### Tweet System

- Create a tweet that expresses your thought.
- Edit tweet as your need anytime.
- Delete tweet when you want.

### Comment

- Leave a comment on any video.
- Edit comment at anytime 
- Delete comment when you wish
- Get all comments of a channel with comment likes

### Dashboard

- Channel details with statistics.
- Channel videos.

### Search

- `getAllVideos` feature in the video controller returns all videos related to the search query.

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Vijesh0405/YoutubeBackend.git
   cd YoutubeBackend

2. **Install Dependencies:**
   ```bash
   npm install
3. **Configure Environment Variables:** 
   <p style="font-size:13px">
   Create a <strong>'.env'</strong> file based on the provided <strong>'.env.example'</strong> and fill in the necessary credentials for your MongoDB, Cloudinary, and other services.
   </p>

4. **Run Application**
   ```bash
   npm start
<h3 align="center">
  Thank you for checking out this project! I appreciate your support 🙏.
</h3>
<h5 align="center">
  Give a star ⭐ if you like ❤️
</h5>