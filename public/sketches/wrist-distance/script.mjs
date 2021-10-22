import { detectBodies, bodyPartsList } from "../../lib/bodydetection.mjs"
import { drawImageWithOverlay, drawSolidCircle } from "../../lib/drawing.mjs"
import { continuosly } from "../../lib/system.mjs"
import { createCameraFeed, facingMode } from "../../lib/camera.mjs"

function outputDistance(status, body) {
    if (body) {
        const distance = body.getDistanceBetweenBodyParts3D(bodyPartsList.leftWrist, bodyPartsList.rightWrist)
        status.innerText = `Distance between wrists: ${distance.toFixed(2)} m`
    }
}

var canvas1 = document.getElementById("canvas1");
var ctx = canvas1.getContext("2d");
var ballRadius = 10;
var x = canvas1.width/2;
var y = canvas1.height-30;
var dx = 2;
var dy = -2;

setInterval(draw, 10);


function drawWrists(canvas, body) {
    if (body) {
        // draw circle for left and right wrist
        const leftShoulder = body.getBodyPart2D(bodyPartsList.leftShoulder);
        const rightShoulder = body.getBodyPart2D(bodyPartsList.rightShoulder);
      
        const leftWrist = body.getBodyPart2D(bodyPartsList.leftWrist)
        const rightWrist = body.getBodyPart2D(bodyPartsList.rightWrist)    
        
      
        // draw left wrist
        drawSolidCircle(canvas, leftWrist.position.x, leftWrist.position.y, 10, 'white')

        // draw right wrist
        drawSolidCircle(canvas, rightWrist.position.x, rightWrist.position.y, 10, 'white')
      
        //draw Right shoulder
        drawSolidCircle(canvas, rightShoulder.position.x, rightShoulder.position.y, 10, 'red')
      
        //draw Left shoulder
        drawSolidCircle(canvas, leftShoulder.position.x, leftShoulder.position.y, 10, 'pink')
      
      
      //if(rightWrist.position.y <  rightShoulder.position.y){
       // console.log("yo bro its up");
      //} else if (rightWrist.position.y > rightShoulder.position.y){
       // console.log("down");
      //}
      
      
      var distanceShoulders = rightShoulder.position.x - leftShoulder.position.x;
      console.log(distanceShoulders);
      //speed is equal to the distance between shoulder
     
      dx = scale(distanceShoulders, -300, 300, -2, 2); // 0
      dy = -scale(distanceShoulders, -300, 300, -2, 2); // 0

      console.log(dx);
      
      if (distanceShoulders < 0){
        console.log("front");
      } else if (distanceShoulders > 0){
        console.log("back");
      }
      //console.log(rightShoulder.position.x - leftShoulder.position.x);
      
      
      
    const distanceWrists = body.getDistanceBetweenBodyParts3D(bodyPartsList.leftWrist, bodyPartsList.rightWrist)
    
    
    if (distanceWrists <= 0.23){
      // draw left wrist
        drawSolidCircle(canvas, leftWrist.position.x, leftWrist.position.y, 10, 'green')

        // draw right wrist
        drawSolidCircle(canvas, rightWrist.position.x, rightWrist.position.y, 10, 'green')
    } else {
      // draw left wrist
        drawSolidCircle(canvas, leftWrist.position.x, leftWrist.position.y, 10, 'yellow')

        // draw right wrist
        drawSolidCircle(canvas, rightWrist.position.x, rightWrist.position.y, 10, 'blue')
    }
    }
}




async function run(canvas, status) {
    let latestBody

    // create a video element connected to the camera
    const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment)

    const config = {
        video: video,
        multiPose: false,
        sampleRate: 100,
        flipHorizontal: true // true if webcam

    }
    
    
    // start detecting bodies camera-feed a set latestBody to first (and only) body
    detectBodies(config, (e) => latestBody = e.detail.bodies.listOfBodies[0])

    // draw video with wrists overlaid onto canvas continuously
    continuosly(() => {
        drawImageWithOverlay(canvas, video, () => drawWrists(canvas, latestBody))
        outputDistance(status, latestBody)
    })
}


function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);
    drawBall();
    
    if(x + dx > canvas1.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy > canvas1.height-ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }
    
    x += dx;
    y += dy;
}

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export { run }