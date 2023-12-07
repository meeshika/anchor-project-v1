const mongoose = require("mongoose");
const axios = require('axios');
const Video = require("../models/video");
const nodemailer = require('nodemailer');
require('dotenv').config();


exports.analyzeVideo = async(req, res, next) => {
    const { videoLink } = req.body;
    console.log(videoLink);
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoLink}&key=AIzaSyA3L5NcgqXtLpzRN0xQ4CUu6MegIPLIYLA`
    );
    const videoMetrics = response.data.items[0].statistics; 

    const earnings =
      //Math.min(videoMetrics.subscriberCount, videoMetrics.viewCount) +
      videoMetrics.viewCount
      10 * videoMetrics.commentCount +
      5 * videoMetrics.likeCount;
    console.log("earnings" + earnings);
    const video = new Video({
        _id: new mongoose.Types.ObjectId(),
        videoLink : videoLink
    });
    Video.find({ videoLink: req.body.videoLink })
      .exec()
      .then(video => {
        if (video.length >= 1) {
          return res.status(409).json({
            "videoMetrics" : videoMetrics,
            "earning" : earnings
          });
        } else {
              const video = new Video({
                _id: new mongoose.Types.ObjectId(),
                videoLink : videoLink
              });
              video
                .save()
                .then(result => {
                  console.log(result);
                  res.status(201).json({
                    message: "video link stored",
                    "videoMetrics" : videoMetrics,
                    "earning" : earnings
                  });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err,
                    message : "video link not stored"
                  });
                });
            }
          });
}
exports.getVideoLinks = async (req,res) => {
    try {
        const videoLinks = await Video.find({}, { _id: 0, __v: 0 }); 
        res.json(videoLinks);
      } catch (error) {
        console.error('Error fetching video links from MongoDB:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};
exports.requestCallBack = (req,res) =>{
    const { name, contactNumber, preferredCallbackTime, additionalComments } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
      user: process.env.EMAIL_ADDRESS, 
      pass: process.env.PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: 'gargmeeshika@gmail.com',
    subject: 'Callback Request',
    html: `
      <p><strong>Name:</strong> ${name || 'Not provided'}</p>
      <p><strong>Contact Number:</strong> ${contactNumber || 'Not provided'}</p>
      <p><strong>Preferred Callback Time:</strong> ${preferredCallbackTime || 'Not specified'}</p>
      <p><strong>Additional Comments/Questions:</strong> ${additionalComments || 'None'}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Callback request email sent successfully' });
    }
  });
}