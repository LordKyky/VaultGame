import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

import { Application, Assets, Sprite } from 'pixi.js';

import { gsap } from "gsap";   
import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(PixiPlugin);

var size = [1920, 1080];
var ratio = size[0] / size[1];

(async () =>
  {
    // Create a new application
    const app = new Application();
  
    // Initialize the application
    await app.init({ background: '#fcba03', resizeTo: window }).then(() =>
      {
        app.canvas.style.position = 'absolute';
  
        // Append the application canvas to the document body
        document.body.appendChild(app.canvas);
  
        // Add the assets to load
        Assets.add({ alias: 'bg', src: 'assets/bg.png' });
        Assets.add({ alias: 'door', src: 'assets/door.png' });
        Assets.add({ alias: 'handleShadow', src: 'assets/handleShadow.png' });
        Assets.add({ alias: 'handle', src: 'assets/handle.png' });
    
        // Start loading right away and create a promise
        //const texturePromise = Assets.load('https://pixijs.com/assets/bunny.png');
  
        // Load the assets and get a resolved promise once both are loaded
        const texturesPromise = Assets.load(['bg', 'door', 'handleShadow', 'handle']); // => Promise<{flowerTop: Texture, eggHead: Texture}>
  
    
        // When the promise resolves, we have the textures!
        texturesPromise.then((textures) =>
        {
          // Create a new Sprite from the resolved loaded Texture for background
          const bg = Sprite.from(textures.bg);

          // Center the sprite's anchor point
          bg.anchor.set(0.5);

          // Move the background sprite to the center of the screen
          bg.x = app.screen.width / 2;
          bg.y = app.screen.height / 2;

          // Set height and width of background to screen size
          bg.width = app.screen.width;
          bg.height = app.screen.height;

          app.stage.addChild(bg);

          // Create a new Sprite from the resolved loaded Texture for door
          const door = Sprite.from(textures.door);

          // Center the sprite's anchor point
          door.anchor.set(0.5);

          // Move the door sprite to the center of the screen
          door.x = app.screen.width / 2 + 14;
          door.y = app.screen.height / 2 - 9.5;

          // Set height and width of door to the screen size
          door.width = app.screen.width / 3;
          door.height = app.screen.height / 1.55;

          app.stage.addChild(door);

          // Create a new Sprite from the resolved loaded Texture for handle shadow
          const handleShadow = Sprite.from(textures.handleShadow);

          // Center the sprite's anchor point
          handleShadow.anchor.set(0.5);

          // Move the handle sprite to the center of the door sprite
          handleShadow.x = door.x / 1.027;
          handleShadow.y = door.y * 1.03;

          // Set height and width of handle shadow to the door size
          handleShadow.width = door.width / 2.85;
          handleShadow.height = door.height / 2.6;

          app.stage.addChild(handleShadow);

          // Create a new Sprite from the resolved loaded Texture for handle shadow
          const handle = Sprite.from(textures.handle);

          // Center the sprite's anchor point
          handle.anchor.set(0.5);

          // Move the handle sprite to the center of the door sprite
          handle.x = door.x / 1.027;
          handle.y = door.y;

          // Set height and width of handle shadow to the door size
          handle.width = door.width / 2.85;
          handle.height = door.height / 2.6;

          app.stage.addChild(handle);
        });
      });
  })();